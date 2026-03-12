import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import ToastSimple, { type ToastData } from "../../components/layout/ToastSimple";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import { useEffect, useState, useMemo } from "react";
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
import { FiAlertTriangle, FiFilter, FiFlag } from "react-icons/fi";
import {
  listProjectsService,
  updateProjectStatusService,
} from "../../services/agrofusion/auth.service";
import type { ProjectListResponse } from "../../dto/response/projectList-response.dto";
import DataTable, { type Column } from "../../components/DataTable";

interface PaginatedProjectsResponse {
  items: ProjectListResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

const ProjectsList = () => {
  const { t } = useTranslation();

  const [projects, setProjects] = useState<ProjectListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(6);

  // Filtros (mismo diseño que gestión de usuarios)
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
      allowedStatuses: ["ACTIVE", "INACTIVE"],
      onChange: (project, newStatus) => {
        setPendingStatusChange({ project, newStatus });
      },
    },
    {
      key: "created_at",
      label: t("project.list.createdAt"),
      type: "text",
      format: (value: string) => (value ? value.split("T")[0] : "-"),
    },
    {
      key: "responsible",
      label: t("project.list.responsible"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
  ];

  // Filtrar por búsqueda (nombre o código) y estado
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      result = result.filter(
        (p) =>
          (p.project_name?.toLowerCase().includes(searchLower)) ||
          (p.instance_code?.toLowerCase().includes(searchLower))
      );
    }
    if (state) {
      result = result.filter((p) => (p.status ?? "").toUpperCase() === state);
    }
    return result;
  }, [projects, search, state]);

  const paginatedData: PaginatedProjectsResponse = useMemo(() => {
    const start = (page - 1) * size;
    const items = filteredProjects.slice(start, start + size);
    const total = filteredProjects.length;
    const total_pages = Math.max(1, Math.ceil(total / size));
    return {
      items,
      total,
      page,
      size,
      total_pages,
    };
  }, [filteredProjects, page, size]);

  const getProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listProjectsService();
      setProjects(data);
      setPage(1);
    } catch (err) {
      console.error(err);
      setError(t("project.list.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  // Al cambiar filtros, volver a página 1
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
      setProjects((prev) =>
        prev.map((p) =>
          p.external_project_id === project.external_project_id
            ? { ...p, status: newStatus }
            : p
        )
      );
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "project.list.statusUpdateSuccess",
          type: "success",
        },
      ]);
    } catch (err) {
      console.error(err);
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "project.list.statusUpdateError",
          type: "error",
        },
      ]);
    } finally {
      handleCloseModal();
    }
  };

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  if (!canAccessModule("ADMINISTRATION")) {
    return (
      <AppLayoutSB>
        <TitleTarget title="project.title" description="project.description" />
        <ModuleInactive />
      </AppLayoutSB>
    );
  }

  return (
    <AppLayoutSB>
      <TitleTarget title="project.title" description="project.description" />

      {/* Filtros en una sola línea */}
      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 rounded-2xl">
        <div className="flex flex-nowrap items-end gap-2 overflow-x-auto">
          <div className="flex-shrink-0 w-72">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("project.list.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-shrink-0 w-52">
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

          <Button
            size="xs"
            onClick={() => getProjects()}
            color={hasActiveFilters ? "blue" : "alternative"}
            className="flex-shrink-0"
          >
            <FiFilter size={18} /> {t("common.filterActive")}
          </Button>

          <Button color="blue" size="xs" onClick={handleResetFilters} className="flex-shrink-0">
            {t("common.filterReset")}
          </Button>
        </div>
      </div>

      {/* Tabla */}
      {loading && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          <p className="text-3xl font-bold">{t("project.list.loading")}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          <p className="text-3xl font-bold text-black dark:text-gray-200">
            {t("project.list.noProjects")}
          </p>
        </div>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <DataTable
          data={paginatedData}
          columns={columns}
          onPageChange={handlePageChange}
          paginationText={t("project.list.paginationText")}
        />
      )}

      {/* Modal de confirmación de cambio de estado */}
      <Modal
        show={!!pendingStatusChange}
        onClose={handleCloseModal}
        size="md"
      >
        <ModalHeader as="div">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500">
              <FiAlertTriangle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {pendingStatusChange?.newStatus === "INACTIVE"
                ? t("project.list.deactivateTitle")
                : t("project.list.activateTitle")}
            </h3>
          </div>
        </ModalHeader>
        <ModalBody className="pt-4">
          {pendingStatusChange && (
            <>
              <p className="mb-2 font-bold text-gray-900 dark:text-white">
                {pendingStatusChange.newStatus === "INACTIVE"
                  ? t("project.list.deactivateQuestion")
                  : t("project.list.activateQuestion")}
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {pendingStatusChange.newStatus === "INACTIVE"
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
                  className="cursor-pointer text-sm font-normal text-gray-700 dark:text-gray-300"
                >
                  {pendingStatusChange.newStatus === "INACTIVE"
                    ? t("project.list.deactivateCheckbox")
                    : t("project.list.activateCheckbox")}
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
            className="bg-amber-500 hover:bg-amber-600 focus:ring-amber-300 text-white"
            onClick={handleConfirmStatusChange}
            disabled={!confirmChecked}
          >
            {pendingStatusChange?.newStatus === "INACTIVE"
              ? t("project.list.deactivateButton")
              : t("project.list.activateButton")}
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
    </AppLayoutSB>
  );
};

export default ProjectsList;
