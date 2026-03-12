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
  listSubmodulesService,
  updateSubmoduleStatusService,
} from "../../services/agrofusion/auth.service";
import type { SubmoduleListResponse } from "../../dto/response/submoduleList-response.dto";
import DataTable, { type Column } from "../../components/DataTable";

interface PaginatedSubmodulesResponse {
  items: SubmoduleListResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

const SubmodulesList = () => {
  const { t } = useTranslation();

  const [submodules, setSubmodules] = useState<SubmoduleListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(5);

  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    submodule: SubmoduleListResponse;
    newStatus: string;
  } | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const moduleOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { id: string; code: string; name: string }[] = [];
    for (const s of submodules) {
      if (s.module_id && s.module_code && !seen.has(s.module_id)) {
        seen.add(s.module_id);
        options.push({
          id: s.module_id,
          code: s.module_code ?? "",
          name: s.module_name ?? s.module_code ?? "",
        });
      }
    }
    return options.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [submodules]);

  const columns: Column<SubmoduleListResponse>[] = [
    {
      key: "code",
      label: t("submodule.list.code"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "name",
      label: t("submodule.list.submoduleName"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "description",
      label: t("submodule.list.description"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "status",
      label: t("common.state"),
      type: "statusEditable",
      allowedStatuses: ["ACTIVE", "INACTIVE"],
      onChange: (submodule, newStatus) => {
        setPendingStatusChange({ submodule, newStatus });
      },
    },
    {
      key: "module_name",
      label: t("submodule.list.parentModule"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
    {
      key: "created_at",
      label: t("submodule.list.createdAt"),
      type: "text",
      format: (value: string) => (value ? value.split("T")[0] : "-"),
    },
    {
      key: "responsible",
      label: t("submodule.list.responsible"),
      type: "text",
      format: (value: string) => value ?? "-",
    },
  ];

  const filteredSubmodules = useMemo(() => {
    let result = [...submodules];
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      result = result.filter(
        (s) =>
          (s.name?.toLowerCase().includes(searchLower)) ||
          (s.code?.toLowerCase().includes(searchLower))
      );
    }
    if (state) {
      result = result.filter((s) => (s.status ?? "").toUpperCase() === state);
    }
    if (moduleFilter) {
      result = result.filter((s) => s.module_id === moduleFilter);
    }
    return result;
  }, [submodules, search, state, moduleFilter]);

  const paginatedData: PaginatedSubmodulesResponse = useMemo(() => {
    const start = (page - 1) * size;
    const items = filteredSubmodules.slice(start, start + size);
    const total = filteredSubmodules.length;
    const total_pages = Math.max(1, Math.ceil(total / size));
    return {
      items,
      total,
      page,
      size,
      total_pages,
    };
  }, [filteredSubmodules, page, size]);

  const getSubmodules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listSubmodulesService();
      setSubmodules(data);
      setPage(1);
    } catch (err) {
      console.error(err);
      setError(t("submodule.list.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubmodules();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, state, moduleFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleResetFilters = () => {
    setSearch("");
    setState("");
    setModuleFilter("");
    setPage(1);
  };

  const handleCloseModal = () => {
    setPendingStatusChange(null);
    setConfirmChecked(false);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange || !confirmChecked) return;
    const { submodule, newStatus } = pendingStatusChange;
    try {
      await updateSubmoduleStatusService(submodule.af_submodule_id, newStatus);
      setSubmodules((prev) =>
        prev.map((s) =>
          s.af_submodule_id === submodule.af_submodule_id
            ? { ...s, status: newStatus }
            : s
        )
      );
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "submodule.list.statusUpdateSuccess",
          type: "success",
        },
      ]);
    } catch (err) {
      console.error(err);
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "submodule.list.statusUpdateError",
          type: "error",
        },
      ]);
    } finally {
      handleCloseModal();
    }
  };

  const hasActiveFilters = search || state || moduleFilter;
  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  if (!canAccessModule("ADMINISTRATION")) {
    return (
      <AppLayoutSB>
        <TitleTarget title="submodule.title" description="submodule.description" />
        <ModuleInactive />
      </AppLayoutSB>
    );
  }

  return (
    <AppLayoutSB>
      <TitleTarget title="submodule.title" description="submodule.description" />

      {/* Filtros en una sola línea */}
      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 rounded-2xl">
        <div className="flex flex-nowrap items-end gap-2 overflow-x-auto">
          <div className="flex-shrink-0 w-72">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("submodule.list.searchPlaceholder")}
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

          <div className="flex-shrink-0 w-52">
            <Label className="text-xs">{t("submodule.list.associatedModule")}</Label>
            <Select
              sizing="sm"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="">{t("submodule.list.allModules")}</option>
              {moduleOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.code}
                </option>
              ))}
            </Select>
          </div>

          <Button
            size="xs"
            onClick={() => getSubmodules()}
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
          <p className="text-3xl font-bold">{t("submodule.list.loading")}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && filteredSubmodules.length === 0 && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          <p className="text-3xl font-bold text-black dark:text-gray-200">
            {t("submodule.list.noSubmodules")}
          </p>
        </div>
      )}

      {!loading && !error && filteredSubmodules.length > 0 && (
        <DataTable
          data={paginatedData}
          columns={columns}
          onPageChange={handlePageChange}
          paginationText={t("submodule.list.paginationText")}
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
                ? t("submodule.list.deactivateTitle")
                : t("submodule.list.activateTitle")}
            </h3>
          </div>
        </ModalHeader>
        <ModalBody className="pt-4">
          {pendingStatusChange && (
            <>
              <p className="mb-2 font-bold text-gray-900 dark:text-white">
                {pendingStatusChange.newStatus === "INACTIVE"
                  ? t("submodule.list.deactivateQuestion")
                  : t("submodule.list.activateQuestion")}
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {pendingStatusChange.newStatus === "INACTIVE"
                  ? t("submodule.list.deactivateDescription")
                  : t("submodule.list.activateDescription")}
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
                    ? t("submodule.list.deactivateCheckbox")
                    : t("submodule.list.activateCheckbox")}
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
              ? t("submodule.list.deactivateButton")
              : t("submodule.list.activateButton")}
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
              setToasts((prev) => prev.filter((item) => item.id !== toast.id))
            }
          />
        ))}
      </div>
    </AppLayoutSB>
  );
};

export default SubmodulesList;
