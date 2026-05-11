/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import ToastSimple, {
  type ToastData,
} from "../../components/layout/ToastSimple";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  TextInput,
} from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { FiCheckCircle, FiFilter, FiFlag, FiMinusCircle } from "react-icons/fi";
import {
  getModuleProjectOptionsService,
  listModulesService,
  updateModuleStatusService,
} from "../../services/agrofusion/auth.service";
import type {
  ModuleListResponse,
  PaginatedModulesResponse,
} from "../../dto/response/moduleList-response.dto";
import DataTable, { type Column } from "../../components/DataTable";
import type { AlertState } from "../../components/layout/AlertSimple";
import AlertSimple from "../../components/layout/AlertSimple";

const ModulesList = () => {
  const { t } = useTranslation();

  const [paginatedData, setPaginatedData] = useState<PaginatedModulesResponse | null>(null);
  const [projectOptions, setProjectOptions] = useState<{ id: string; code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(5);

  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const [notListPerm, setNotListPerm] = useState(null);
  const [alert, setAlert] = useState<AlertState>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    module: ModuleListResponse;
    newStatus: string;
  } | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const columns: Column<ModuleListResponse>[] = [
    {
      key: "code",
      label: t("module.list.code"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "name",
      label: t("module.list.moduleName"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "project_name",
      label: t("module.list.associatedProject"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "status",
      label: t("common.state"),
      type: "statusEditable",
      allowedStatuses: ["ACTIVE", "INACTIVE"],
      onChange: (module, newStatus) => {
        setPendingStatusChange({ module, newStatus });
      },
    },
    {
      key: "created_at",
      label: t("module.list.createdAt"),
      type: "text",
      format: (value: string) => (value ? value.split("T")[0] : "-"),
    },
    {
      key: "responsible",
      label: t("module.list.responsible"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
  ];

  const getModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listModulesService({
        page_index: page,
        page_size: size,
        search: search.trim() || undefined,
        state: state.trim() || undefined,
        project_id: projectFilter || undefined,
      });
      setPaginatedData(data);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail?.code;

      if (errorMessage == "AUTH_INSUFFICIENT_PERMISSIONS") {
        setNotListPerm(errorMessage);
        return;
      }
      setError(t("module.list.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getModuleProjectOptionsService()
      .then((list) =>
        setProjectOptions(
          list.map((p) => ({
            id: p.af_project_id,
            code: p.project_code ?? "",
            name: p.project_name ?? p.project_code ?? "",
          }))
        )
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    getModules();
  }, [page, size, search, state, projectFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, state, projectFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleResetFilters = () => {
    setSearch("");
    setState("");
    setProjectFilter("");
    setPage(1);
  };

  const handleCloseModal = () => {
    setPendingStatusChange(null);
    setConfirmChecked(false);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange || !confirmChecked) return;
    const { module, newStatus } = pendingStatusChange;
    try {
      await updateModuleStatusService(module.af_module_id, newStatus);
      await getModules();
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "module.list.statusUpdateSuccess",
          type: "success",
        },
      ]);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail?.code;

      if (errorMessage == "AUTH_INSUFFICIENT_PERMISSIONS") {
        setAlert({
          message: t(`errors.${errorMessage}`),
          type:
            errorMessage == "AUTH_INSUFFICIENT_PERMISSIONS"
              ? "warning"
              : "error",
        });
        return;
      }
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "module.list.statusUpdateError",
          type: "error",
        },
      ]);
    } finally {
      handleCloseModal();
    }
  };

  const hasActiveFilters = search || state || projectFilter;
  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore(
    (s) => s.canAccessSubmodule,
  );
  const showModuleInactive = !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive =
    canAccessModule("ADMINISTRATION") && !canAccessSubmodule("MODULES");
  const showContent =
    canAccessModule("ADMINISTRATION") && canAccessSubmodule("MODULES");

  return (
    <AppLayoutSB>
      <TitleTarget title="module.title" description="module.description" />

      {/* Filtros - siempre visibles */}
      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
        <div className="flex flex-wrap items-end gap-2 flex-1 overflow-x-auto">
          <div className="md:w-72 w-full">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("module.list.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="md:w-52 w-full">
            <Label className="text-xs">{t("common.state")}</Label>
            <Select
              icon={FiFlag}
              sizing="sm"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">
                {t("common.active")} / {t("common.inactive")}
              </option>
              <option value="ACTIVE">{t("common.active")}</option>
              <option value="INACTIVE">{t("common.inactive")}</option>
            </Select>
          </div>
          <div className="md:w-52 w-full">
            <Label className="text-xs">
              {t("module.list.associatedProject")}
            </Label>
            <Select
              sizing="sm"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">{t("module.list.allProjects")}</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.code}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex items-end justify-end gap-2 mt-2 md:mt-0 md:ml-4 flex-shrink-0">
          <Button
            size="xs"
            onClick={() => getModules()}
            color={hasActiveFilters ? "blue" : "alternative"}
          >
            <FiFilter size={18} /> {t("common.filterActive")}
          </Button>
          <Button color="blue" size="xs" onClick={handleResetFilters}>
            {t("common.filterReset")}
          </Button>
        </div>
      </div>

      {/* Área de contenido: mensaje inactivo o tabla */}
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("module.list.loading")}</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            !notListPerm &&
            paginatedData !== null && paginatedData.total === 0 && (
              <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
                <p className="text-3xl font-bold text-black dark:text-gray-200">
                  {t("module.list.noModules")}
                </p>
              </div>
            )}
          {!loading && notListPerm && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">
                {t(`errors.${notListPerm}`, {
                  defaultValue: t("errors.unknown"),
                })}
              </p>
            </div>
          )}

          {!loading && !error && paginatedData !== null && paginatedData.total > 0 && (
            <DataTable
              data={paginatedData}
              columns={columns}
              onPageChange={handlePageChange}
              paginationText={t("module.list.paginationText")}
            />
          )}
        </>
      )}

      {/* Modal de confirmación de cambio de estado */}
      <Modal show={!!pendingStatusChange} onClose={handleCloseModal} size="md">
        <ModalHeader as="div">
          <div className="flex items-center gap-3">
            {pendingStatusChange?.newStatus === "INACTIVE" && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500">
                <FiMinusCircle className="h-6 w-6 text-white" />
              </div>
            )}
            {pendingStatusChange?.newStatus === "ACTIVE" && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-500">
                <FiCheckCircle className="h-6 w-6 text-white" />
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {pendingStatusChange?.newStatus === "INACTIVE"
                ? t("module.list.deactivateTitle")
                : t("module.list.activateTitle")}
            </h3>
          </div>
        </ModalHeader>
        <ModalBody className="pt-4">
          {pendingStatusChange && (
            <>
              <p className="mb-2 font-bold text-gray-900 dark:text-white">
                {pendingStatusChange.newStatus === "INACTIVE"
                  ? t("module.list.deactivateQuestion")
                  : t("module.list.activateQuestion")}
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {pendingStatusChange.newStatus === "INACTIVE"
                  ? t("module.list.deactivateDescription")
                  : t("module.list.activateDescription")}
              </p>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm-status-change"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                />
                <Label
                  htmlFor="confirm-status-change"
                  className="cursor-pointer text-sm font-normal text-gray-700 dark:text-gray-300"
                >
                  {pendingStatusChange.newStatus === "INACTIVE"
                    ? t("module.list.deactivateCheckbox")
                    : t("module.list.activateCheckbox")}
                </Label>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t pt-4">
          <Button color="gray" onClick={handleCloseModal}>
            {t("common.cancel")}
          </Button>
          <Button
            className={
              pendingStatusChange?.newStatus === "INACTIVE"
                ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300 text-white"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-300 text-white"
            }
            onClick={handleConfirmStatusChange}
            disabled={!confirmChecked}
          >
            {pendingStatusChange?.newStatus === "INACTIVE"
              ? t("module.list.deactivateButton")
              : t("module.list.activateButton")}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Toasts de feedback */}
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
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </div>
      {alert && (
        <AlertSimple
          message={t(alert.message)}
          type={alert.type}
          to={alert.to}
          onClose={() => {
            setAlert(null);
          }}
        />
      )}
    </AppLayoutSB>
  );
};

export default ModulesList;
