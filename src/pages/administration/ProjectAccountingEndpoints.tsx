/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import { FiCheck, FiCopy, FiEdit2, FiFilter, FiLink2, FiList, FiPlus, FiSave, FiSend, FiTrash2 } from "react-icons/fi";
import { HiSearch } from "react-icons/hi";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import DataTable, { type Column } from "../../components/DataTable";
import ModuleInactive from "../ModuleInactive";
import SubmoduleInactive from "../SubmoduleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";
import type {
  AccountingEndpointDetailResponse,
  AccountingEndpointListItemResponse,
  PaginatedProjectAccountingEndpointsResponse,
} from "../../dto/response/projectAccountingEndpoints-response.dto";
import type { CreateProjectAccountingInfoEndpointRequest } from "../../dto/request/createProjectAccountingInfoEndpoint-request.dto";
import {
  createProjectAccountingEndpointService,
  deleteProjectAccountingEndpointService,
  getProjectAccountingEndpointDetailService,
  getProjectDetailsService,
  listProjectAccountingEndpointsService,
  updateProjectAccountingEndpointService,
  validateAccountingTransferConnectionService,
} from "../../services/agrofusion/auth.service";
import AlertConfirmation from "../../components/layout/AlertConfirmation";
import AlertSimple, { type AlertState } from "../../components/layout/AlertSimple";
import ToastSimple, { type ToastData } from "../../components/layout/ToastSimple";

const EMPTY_CREATE_FORM: CreateProjectAccountingInfoEndpointRequest = {
  endpoint_name: "",
  api_url: "",
  api_path: "",
  request_url: "",
  method_code: "GET",
  description: "",
  is_protected: false,
};

const methodBadgeStyles: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-violet-100 text-violet-700",
  DELETE: "bg-rose-100 text-rose-700",
};

type AccountingEndpointFormErrors = {
  api_path?: string;
  request_url?: string;
};

const ProjectAccountingEndpoints = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("");
  const [operationType, setOperationType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notListPerm, setNotListPerm] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginatedProjectAccountingEndpointsResponse | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [editingEndpoint, setEditingEndpoint] =
    useState<AccountingEndpointListItemResponse | null>(null);
  const [createFormData, setCreateFormData] =
    useState<CreateProjectAccountingInfoEndpointRequest>(EMPTY_CREATE_FORM);
  const [formErrors, setFormErrors] = useState<AccountingEndpointFormErrors>({});
  const [pendingDelete, setPendingDelete] =
    useState<AccountingEndpointListItemResponse | null>(null);
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [copiedEndpointId, setCopiedEndpointId] = useState<string | null>(null);

  const size = 5;

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore(
    (s) => s.canAccessSubmodule,
  );
  const canUseDashboardFlow = canAccessModule("DASHBOARD");
  const canUseAdministrationFlow =
    canAccessModule("ADMINISTRATION") && canAccessSubmodule("PROJECTS");
  const showModuleInactive =
    !canUseDashboardFlow && !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive =
    !canUseDashboardFlow &&
    canAccessModule("ADMINISTRATION") &&
    !canAccessSubmodule("PROJECTS");
  const showContent = canUseDashboardFlow || canUseAdministrationFlow;

  const getEndpoints = async (pageParam = 1) => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError("");
      setNotListPerm(null);

      const response = await listProjectAccountingEndpointsService(projectId, {
        page_index: pageParam,
        page_size: size,
        search: search.trim() || undefined,
        method: method || undefined,
        operation_type: operationType || undefined,
      });

      setPagination(response);
    } catch (err: any) {
      const errorCode = err.response?.data?.detail?.code;

      if (errorCode) {
        setNotListPerm(errorCode);
        return;
      }

      setError("LOAD_ACCOUNTING_ENDPOINTS_ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getEndpoints(1);
  }, [projectId, search, method, operationType]);

  useEffect(() => {
    const loadMetadata = async () => {
      if (!projectId) return;

      try {
        const projectData = await getProjectDetailsService(projectId);

        setProjectTitle(
          projectData.instance_code ||
            projectData.project_name ||
            t("project.accountingEndpoints.title"),
        );
      } catch {
        setProjectTitle(t("project.accountingEndpoints.title"));
      }
    };

    void loadMetadata();
  }, [projectId, t]);

  const openCreateModal = () => {
    setEditingEndpoint(null);
    setCreateFormData(EMPTY_CREATE_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const mapDetailToForm = (
    detail: AccountingEndpointDetailResponse,
  ): CreateProjectAccountingInfoEndpointRequest => ({
    endpoint_name: detail.endpoint_name,
    api_url: detail.api_url,
    api_path: detail.api_path,
    request_url: detail.request_url,
    method_code: detail.method_code || "GET",
    description: detail.description || "",
    is_protected: detail.is_protected,
  });

  const getActionErrorMessageKey = (
    err: any,
    fallbackKey: string,
  ) => {
    const errorCode = err?.response?.data?.detail?.code;
    if (errorCode === "AUTH_INSUFFICIENT_PERMISSIONS") {
      return "errors.AUTH_INSUFFICIENT_PERMISSIONS";
    }

    if (errorCode === "EXT_ACCOUNTING_ENDPOINT_DUPLICATED") {
      return "project.accountingEndpoints.duplicateEndpoint";
    }

    const backendMessage = err?.response?.data?.detail?.meta?.message;
    if (backendMessage === "La api ingresada no existe") {
      return "project.accountingEndpoints.invalidApiUrl";
    }

    return fallbackKey;
  };

  const handlePermissionAlert = (err: any) => {
    const errorCode = err?.response?.data?.detail?.code;
    if (errorCode !== "AUTH_INSUFFICIENT_PERMISSIONS") {
      return false;
    }

    setAlert({
      message: t("errors.AUTH_INSUFFICIENT_PERMISSIONS"),
      type: "warning",
    });
    setPendingDelete(null);
    setConfirmDeleteChecked(false);
    return true;
  };

  const openEditModal = async (endpoint: AccountingEndpointListItemResponse) => {
    if (!projectId) return;

    try {
      setIsModalLoading(true);
      setEditingEndpoint(endpoint);
      setShowModal(true);

      const detail = await getProjectAccountingEndpointDetailService(
        projectId,
        endpoint.external_endpoint_id,
      );
      setCreateFormData(mapDetailToForm(detail));
    } catch (err: any) {
      if (handlePermissionAlert(err)) {
        return;
      }
      setShowModal(false);
      setEditingEndpoint(null);
      setCreateFormData(EMPTY_CREATE_FORM);
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: getActionErrorMessageKey(
            err,
            "project.accountingEndpoints.endpointLoadError",
          ),
          type: "error",
        },
      ]);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEndpoint(null);
    setCreateFormData(EMPTY_CREATE_FORM);
    setFormErrors({});
    setIsModalLoading(false);
  };

  const validateForm = () => {
    const errors: AccountingEndpointFormErrors = {};

    if (!createFormData.api_path.trim().startsWith("/")) {
      errors.api_path = "project.accountingEndpoints.form.mustStartWithSlash";
    }

    if (!createFormData.request_url.trim().startsWith("/")) {
      errors.request_url = "project.accountingEndpoints.form.mustStartWithSlash";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!projectId) return;
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      if (editingEndpoint) {
        await updateProjectAccountingEndpointService(
          projectId,
          editingEndpoint.external_endpoint_id,
          createFormData,
        );
      } else {
        await createProjectAccountingEndpointService(projectId, createFormData);
      }

      closeModal();
      await getEndpoints(pagination?.page ?? 1);
      setAlert({
        message: t(
          editingEndpoint
            ? "project.accountingEndpoints.endpointUpdated"
            : "project.accountingEndpoints.endpointCreated",
        ),
        type: "success",
      });
    } catch (err: any) {
      if (handlePermissionAlert(err)) {
        return;
      }
      if (err?.response?.data?.detail?.code === "EXT_ACCOUNTING_ENDPOINT_DUPLICATED") {
        setAlert({
          message: t("project.accountingEndpoints.duplicateEndpoint"),
          type: "error",
        });
        return;
      }
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: getActionErrorMessageKey(
            err,
            "project.accountingEndpoints.endpointSaveError",
          ),
          type: "error",
        },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!projectId || !pendingDelete) return;

    try {
      await deleteProjectAccountingEndpointService(
        projectId,
        pendingDelete.external_endpoint_id,
      );
      setPendingDelete(null);
      setConfirmDeleteChecked(false);
      await getEndpoints(1);
      setAlert({
        message: t("project.accountingEndpoints.endpointDeleted"),
        type: "success",
      });
    } catch (err: any) {
      if (handlePermissionAlert(err)) {
        return;
      }
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: getActionErrorMessageKey(
            err,
            "project.accountingEndpoints.endpointDeleteError",
          ),
          type: "error",
        },
      ]);
    }
  };

  const handleCopyUrl = async (
    endpointId: string,
    url: string,
  ) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedEndpointId(endpointId);
      window.setTimeout(() => {
        setCopiedEndpointId((current) =>
          current === endpointId ? null : current,
        );
      }, 1500);
    } catch {
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "project.accountingEndpoints.copyError",
          type: "error",
        },
      ]);
    }
  };

  const handleTransferValidation = async () => {
    try {
      await validateAccountingTransferConnectionService();
      return true;
    } catch (err: any) {
      if (handlePermissionAlert(err)) {
        return false;
      }

      const errorCode = err?.response?.data?.detail?.code;
      const backendMessage = err?.response?.data?.detail?.meta?.message;

      if (
        errorCode === "ACCOUNTING_TRANSFER_CONNECTION_NOT_FOUND" ||
        backendMessage ===
          "No existe una conexión a un sistema de contabilidad. Agrega la conexión en el módulo de comprobantes"
      ) {
        setAlert({
          message: t("project.accountingEndpoints.transferConnectionMissing"),
          type: "warning",
        });
        return false;
      }

      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "project.accountingEndpoints.transferValidationError",
          type: "error",
        },
      ]);
      return false;
    }
  };

  const handleTransfer = async (endpoint: AccountingEndpointListItemResponse) => {
    if (!projectId) return;

    const shouldContinue = await handleTransferValidation();
    if (!shouldContinue) return;

    const targetPath =
      canUseAdministrationFlow && !canUseDashboardFlow
        ? `/administration/projects/${projectId}/accounting-transfer-request`
        : `/projects/${projectId}/accounting-transfer-request`;

    navigate(targetPath, {
      state: {
        apiName: endpoint.api_name,
        projectCode: endpoint.external_project_code,
        endpointId: endpoint.external_endpoint_id,
        urlEndpoint: endpoint.url_endpoint,
      },
    });
  };

  const columns: Column<AccountingEndpointListItemResponse>[] = [
    {
      key: "api_name",
      label: t("project.accountingEndpoints.columns.apiName"),
      type: "text",
      width: "160px",
    },
    {
      key: "url_endpoint",
      label: t("project.accountingEndpoints.columns.urlEndpoint"),
      type: "text",
      width: "220px",
      format: (value: string, row) => (
        <div className="flex items-center justify-center gap-2">
          <span className="block max-w-[170px] truncate" title={value}>
            {value || "-"}
          </span>
          {value && (
            <button
              type="button"
              title={t("project.accountingEndpoints.copyUrl")}
              onClick={() => handleCopyUrl(row.external_endpoint_id, value)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              {copiedEndpointId === row.external_endpoint_id ? (
                <FiCheck className="text-emerald-600" size={14} />
              ) : (
                <FiCopy size={14} />
              )}
            </button>
          )}
        </div>
      ),
    },
    {
      key: "external_project_code",
      label: t("project.accountingEndpoints.columns.projectCode"),
      type: "text",
      width: "130px",
      format: (value: string) => value || "-",
    },
    {
      key: "operation_type",
      label: t("project.accountingEndpoints.columns.operationType"),
      type: "text",
      width: "200px",
    },
    {
      key: "method",
      label: t("project.accountingEndpoints.columns.method"),
      type: "text",
      width: "100px",
      format: (value: string) =>
        value ? (
          <span
            className={`inline-flex min-w-[72px] justify-center rounded-full px-3 py-1 text-xs font-semibold ${
              methodBadgeStyles[value] ?? "bg-slate-100 text-slate-700"
            }`}
          >
            {value}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "actions",
      label: t("project.accountingEndpoints.columns.actions"),
      type: "actions",
      width: "300px",
      actions: [
        {
          label: t("project.accountingEndpoints.edit"),
          icon: <FiEdit2 />,
          className: "bg-blue-600 text-white hover:bg-blue-500",
          disabled: (row) => row.is_deleted,
          onClick: (row) => openEditModal(row),
        },
        {
          label: t("project.accountingEndpoints.delete"),
          icon: <FiTrash2 />,
          className: "bg-red-600 text-white hover:bg-red-500",
          disabled: (row) => row.is_deleted,
          onClick: (row) => {
            setPendingDelete(row);
            setConfirmDeleteChecked(false);
          },
        },
        {
          label: t("project.accountingEndpoints.transfer"),
          icon: <FiSend />,
          className: "bg-blue-600 text-white hover:bg-blue-500",
          disabled: (row) => row.is_deleted,
          onClick: (row) => handleTransfer(row),
        },
      ],
    },
  ];

  return (
    <AppLayoutSB>
      <TitleTarget
        title={t("project.accountingEndpoints.title")}
        description={t("project.accountingEndpoints.description", {
          project: projectTitle || "-",
        })}
      />

      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
        <div className="flex flex-wrap flex-1 gap-2 overflow-visible">
          <div className="w-72">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("project.accountingEndpoints.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-52">
            <Label className="text-xs">
              {t("project.accountingEndpoints.filters.method")}
            </Label>
            <Select
              icon={FiLink2}
              sizing="sm"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="">
                {t("project.accountingEndpoints.filters.allMethods")}
              </option>
              {pagination?.method_options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-60">
            <Label className="text-xs">
              {t("project.accountingEndpoints.filters.operationType")}
            </Label>
            <Select
              icon={FiList}
              sizing="sm"
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
            >
              <option value="">
                {t("project.accountingEndpoints.filters.allOperationTypes")}
              </option>
              {pagination?.operation_type_options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-end justify-end flex-shrink-0 gap-2 mt-2 md:mt-0 md:ml-4">
          <Button size="xs" onClick={() => getEndpoints(1)} color="alternative">
            <FiFilter size={18} /> {t("common.filterActive")}
          </Button>
          <Button
            color="blue"
            size="xs"
            onClick={() => {
              setSearch("");
              setMethod("");
              setOperationType("");
            }}
          >
            {t("common.filterReset")}
          </Button>
          <Button className="bg-green-600 text-white hover:bg-green-500" size="xs" onClick={openCreateModal}>
            <FiPlus size={18} /> {t("project.accountingEndpoints.addEndpoint")}
          </Button>
        </div>
      </div>

      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-2xl font-bold">
                {t("project.accountingEndpoints.loading")}
              </p>
            </div>
          )}

          {!loading && notListPerm && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-2xl font-bold">{t(`errors.${notListPerm}`)}</p>
            </div>
          )}

          {!loading && !notListPerm && error && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-2xl font-bold">
                {t("project.accountingEndpoints.error")}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            !notListPerm &&
            pagination &&
            pagination.items.length === 0 && (
              <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
                <p className="text-2xl font-bold">
                  {t("project.accountingEndpoints.noEndpoints")}
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            !notListPerm &&
            pagination &&
            pagination.items.length > 0 && (
              <DataTable
                data={pagination}
                columns={columns}
                onPageChange={getEndpoints}
                paginationText={t("project.accountingEndpoints.paginationText")}
              />
            )}
        </>
      )}

      <Modal show={showModal} onClose={closeModal} size="lg">
        <ModalHeader as="div">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingEndpoint
              ? t("project.accountingEndpoints.editModalTitle")
              : t("project.accountingEndpoints.createModalTitle")}
          </h3>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {isModalLoading ? (
            <div className="py-8 text-center text-sm font-medium text-slate-600">
              {t("project.accountingEndpoints.loading")}
            </div>
          ) : (
            <>
              <div>
                <Label>{t("project.accountingEndpoints.form.endpointName")}</Label>
                <TextInput
                  placeholder={t("project.accountingEndpoints.form.endpointNamePlaceholder")}
                  value={createFormData.endpoint_name}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      endpoint_name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>{t("project.accountingEndpoints.form.apiUrl")}</Label>
                <TextInput
                  placeholder={t("project.accountingEndpoints.form.apiUrlPlaceholder")}
                  value={createFormData.api_url}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      api_url: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>{t("project.accountingEndpoints.form.apiPath")}</Label>
                <TextInput
                  placeholder={t("project.accountingEndpoints.form.apiPathPlaceholder")}
                  color={formErrors.api_path ? "failure" : undefined}
                  value={createFormData.api_path}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      api_path: e.target.value,
                    }))
                  }
                />
                <p
                  className={`mt-1 text-xs ${
                    formErrors.api_path ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {t("project.accountingEndpoints.form.mustStartWithSlash")}
                </p>
              </div>

              <div>
                <Label>{t("project.accountingEndpoints.form.requestUrl")}</Label>
                <TextInput
                  placeholder={t("project.accountingEndpoints.form.requestUrlPlaceholder")}
                  color={formErrors.request_url ? "failure" : undefined}
                  value={createFormData.request_url}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      request_url: e.target.value,
                    }))
                  }
                />
                <p
                  className={`mt-1 text-xs ${
                    formErrors.request_url ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {t("project.accountingEndpoints.form.mustStartWithSlash")}
                </p>
              </div>

              <div>
                <Label>{t("project.accountingEndpoints.form.method")}</Label>
                <Select
                  value={createFormData.method_code}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      method_code: e.target.value,
                    }))
                  }
                >
                  {["GET", "POST"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>{t("project.accountingEndpoints.form.description")}</Label>
                <Textarea
                  rows={4}
                  placeholder={t("project.accountingEndpoints.form.descriptionPlaceholder")}
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>{t("project.accountingEndpoints.form.authentication")}</Label>
                <Select
                  value={createFormData.is_protected ? "PROTECTED" : "OPEN"}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      is_protected: e.target.value === "PROTECTED",
                    }))
                  }
                >
                  <option value="OPEN">
                    {t("project.accountingEndpoints.form.authenticationOpen")}
                  </option>
                  <option value="PROTECTED">
                    {t("project.accountingEndpoints.form.authenticationProtected")}
                  </option>
                </Select>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t pt-4">
          <Button color="gray" onClick={closeModal}>
            {t("common.cancel")}
          </Button>
          <Button color="blue" onClick={handleSave} disabled={isSaving || isModalLoading}>
            <FiSave className="mr-2" />
            {editingEndpoint
              ? t("project.accountingEndpoints.saveChanges")
              : t("project.accountingEndpoints.createEndpoint")}
          </Button>
        </ModalFooter>
      </Modal>

      <AlertConfirmation
        show={!!pendingDelete}
        type="error"
        title={t("project.accountingEndpoints.deleteTitle")}
        message={t("project.accountingEndpoints.deleteQuestion")}
        description={t("project.accountingEndpoints.deleteDescription")}
        checkboxLabel={t("project.accountingEndpoints.deleteCheckbox")}
        checkboxChecked={confirmDeleteChecked}
        onCheckboxChange={setConfirmDeleteChecked}
        confirmText={t("project.accountingEndpoints.delete")}
        confirmDisabled={!confirmDeleteChecked}
        onConfirm={handleDelete}
        onClose={() => {
          setPendingDelete(null);
          setConfirmDeleteChecked(false);
        }}
      />

      {alert && (
        <AlertSimple
          message={alert.message}
          type={alert.type}
          to={alert.to}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastSimple
            key={toast.id}
            messageKey={toast.messageKey}
            messageParams={toast.messageParams}
            type={toast.type}
            to={toast.to}
            linkText={toast.linkText}
            onClose={() =>
              setToasts((prev) => prev.filter((item) => item.id !== toast.id))
            }
          />
        ))}
      </div>
    </AppLayoutSB>
  );
};

export default ProjectAccountingEndpoints;
