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
import { Link, useNavigate } from "react-router-dom";
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
import {
  FiCheckCircle,
  FiEdit2,
  FiFilter,
  FiFlag,
  FiLink2,
  FiMinusCircle,
  FiTrash2,
} from "react-icons/fi";
import {
  listProjectsService,
  updateProjectStatusService,
} from "../../services/agrofusion/auth.service";
import type {
  PaginatedProjectsResponse,
  ProjectListResponse,
} from "../../dto/response/projectList-response.dto";
import DataTable, { type Column } from "../../components/DataTable";
import type { AlertState } from "../../components/layout/AlertSimple";
import AlertSimple from "../../components/layout/AlertSimple";

const ProjectsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [paginatedData, setPaginatedData] = useState<PaginatedProjectsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [notListPerm, setNotListPerm] = useState(null);
  const [alert, setAlert] = useState<AlertState>(null);

  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    project: ProjectListResponse;
    newStatus: string;
  } | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const columns: Column<ProjectListResponse>[] = [
    {
      key: "instance_code",
      label: t("project.list.code"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "project_name",
      label: t("project.list.projectName"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "status",
      label: t("common.state"),
      type: "statusEditable",
      allowedStatuses: ["ACTIVE", "INACTIVE", "DELETED"],
      statusChangeDisabled: (project) => project.status === "DELETED",
      onChange: (project, newStatus) => {
        setPendingStatusChange({ project, newStatus });
      },
    },
    {
      key: "created_at",
      label: t("project.list.createdAt"),
      type: "text",
      width: "120px",
      format: (value: string) => (value ? value.split("T")[0] : "-"),
    },
    {
      key: "responsible",
      label: t("project.list.responsible"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "actions",
      label: t("project.list.action"),
      type: "actions",
      width: "300px",
      actions: [
        {
          label: t("project.list.edit"),
          icon: <FiEdit2 />,
          className: "bg-blue-600 text-white hover:bg-blue-500",
          disabled: (project) => project.status === "DELETED",
          onClick: (project) =>
            navigate(`/administration/projects/edit/${project.external_project_id}`),
        },
        {
          label: t("project.list.accountingEndpoints"),
          icon: <FiLink2 />,
          className: "dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600",
          disabled: (project) => project.status === "DELETED",
          onClick: (project) =>
            navigate(
              `/administration/projects/${project.external_project_id}/accounting-endpoints`,
            ),
        },
      ],
    },
  ];

  const getProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listProjectsService({
        page_index: page,
        page_size: size,
        search: search.trim() || undefined,
        state: state.trim() || undefined,
      });
      setPaginatedData(data);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail?.code;

      if (errorMessage == "AUTH_INSUFFICIENT_PERMISSIONS") {
        setNotListPerm(errorMessage);
        return;
      }
      setError(t("project.list.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjects();
  }, [page, size, search, state]);

  useEffect(() => {
    setPage(1);
  }, [search, state]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleResetFilters = () => {
    setSearch("");
    setState("");
    setPage(1);
  };

  const hasActiveFilters = search || state;

  const handleCloseModal = () => {
    setPendingStatusChange(null);
    setConfirmChecked(false);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange || !confirmChecked) return;
    const { project, newStatus } = pendingStatusChange;
    try {
      await updateProjectStatusService(project.external_project_id, newStatus);
      await getProjects();
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "project.list.statusUpdateSuccess",
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
      if (errorMessage === "EXT_PROJECT_DELETED_IMMUTABLE") {
        setAlert({
          message: t("errors.EXT_PROJECT_DELETED_IMMUTABLE"),
          type: "error",
        });
        return;
      }
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "project.list.statusUpdateError",
          type: "error",
        },
      ]);
    }finally{
      
      handleCloseModal();
    }
  };

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore(
    (s) => s.canAccessSubmodule,
  );
  const showModuleInactive = !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive =
    canAccessModule("ADMINISTRATION") && !canAccessSubmodule("PROJECTS");
  const showContent =
    canAccessModule("ADMINISTRATION") && canAccessSubmodule("PROJECTS");

  return (
    <AppLayoutSB>
      <TitleTarget title="project.title" description="project.description" />

      {/* Filtros y acción Agregar proyecto */}
      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
        <div className="flex flex-wrap items-end flex-1 gap-2 overflow-x-auto">
          <div className="w-72">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("project.list.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-52">
            <Label className="text-xs">{t("common.state")}</Label>
            <Select
              icon={FiFlag}
              sizing="sm"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">
                {t("common.all")}
              </option>
              <option value="ACTIVE">{t("common.active")}</option>
              <option value="INACTIVE">{t("common.inactive")}</option>
              <option value="DELETED">{t("common.deleted")}</option>
            </Select>
          </div>
        </div>
        <div className="flex items-end justify-end flex-shrink-0 gap-2 mt-2 md:mt-0 md:ml-4">
          <Button
            size="xs"
            onClick={() => getProjects()}
            color={hasActiveFilters ? "blue" : "alternative"}
          >
            <FiFilter size={18} /> {t("common.filterActive")}
          </Button>
          <Button color="blue" size="xs" onClick={handleResetFilters}>
            {t("common.filterReset")}
          </Button>
          <Link to="/administration/projects/create">
            <Button color="blue" size="xs">
              {t("project.create.addProject")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Área de contenido: mensaje inactivo o tabla */}
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("project.list.loading")}</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {error}
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

          {!loading &&
            !error &&
            !notListPerm &&
            paginatedData !== null &&
            paginatedData.total === 0 && (
              <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
                <p className="text-3xl font-bold text-black dark:text-gray-200">
                  {t("project.list.noProjects")}
                </p>
              </div>
            )}

          {!loading && !error && paginatedData !== null && paginatedData.total > 0 && (
            <DataTable
              data={paginatedData}
              columns={columns}
              onPageChange={handlePageChange}
              paginationText={t("project.list.paginationText")}
            />
          )}
        </>
      )}

      {/* Modal de confirmación de cambio de estado */}
      <Modal show={!!pendingStatusChange} onClose={handleCloseModal} size="md">
        <ModalHeader as="div">
          <div className="flex items-center gap-3">
            {pendingStatusChange?.newStatus === "DELETED" && (
              <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-lg shrink-0">
                <FiTrash2 className="w-6 h-6 text-white" />
              </div>
            )}
            {pendingStatusChange?.newStatus === "INACTIVE" && (
              <div className="flex items-center justify-center w-12 h-12 rounded-lg shrink-0 bg-amber-500">
                <FiMinusCircle className="w-6 h-6 text-white" />
              </div>
            )}
            {pendingStatusChange?.newStatus === "ACTIVE" && (
              <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg shrink-0">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {pendingStatusChange?.newStatus === "DELETED"
                ? t("project.list.deleteTitle")
                : pendingStatusChange?.newStatus === "INACTIVE"
                  ? t("project.list.deactivateTitle")
                  : t("project.list.activateTitle")}
            </h3>
          </div>
        </ModalHeader>
        <ModalBody className="pt-4">
          {pendingStatusChange && (
            <>
              <p className="mb-2 font-bold text-gray-900 dark:text-white">
                {pendingStatusChange.newStatus === "DELETED"
                  ? t("project.list.deleteQuestion")
                  : pendingStatusChange.newStatus === "INACTIVE"
                    ? t("project.list.deactivateQuestion")
                    : t("project.list.activateQuestion")}
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {pendingStatusChange.newStatus === "DELETED"
                  ? t("project.list.deleteDescription")
                  : pendingStatusChange.newStatus === "INACTIVE"
                    ? t("project.list.deactivateDescription")
                    : t("project.list.activateDescription")}
              </p>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm-status-change"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                />
                <Label
                  htmlFor="confirm-status-change"
                  className="text-sm font-normal text-gray-700 cursor-pointer dark:text-gray-300"
                >
                  {pendingStatusChange.newStatus === "DELETED"
                    ? t("project.list.deleteCheckbox")
                    : pendingStatusChange.newStatus === "INACTIVE"
                      ? t("project.list.deactivateCheckbox")
                      : t("project.list.activateCheckbox")}
                </Label>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="pt-4 border-t">
          <Button color="gray" onClick={handleCloseModal}>
            {t("common.cancel")}
          </Button>
          <Button
            className={
              pendingStatusChange?.newStatus === "DELETED"
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white"
                : pendingStatusChange?.newStatus === "INACTIVE"
                  ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300 text-white"
                  : "bg-green-500 hover:bg-green-600 focus:ring-green-300 text-white"
            }
            onClick={handleConfirmStatusChange}
            disabled={!confirmChecked}
          >
            {pendingStatusChange?.newStatus === "DELETED"
              ? t("project.list.deleteButton")
              : pendingStatusChange?.newStatus === "INACTIVE"
                ? t("project.list.deactivateButton")
                : t("project.list.activateButton")}
          </Button>
        </ModalFooter>
       
      </Modal>
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
      {/* Toasts de feedback */}
      <div className="fixed z-50 flex flex-col gap-2 bottom-4 right-4">
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
    </AppLayoutSB>
  );
};

export default ProjectsList;
