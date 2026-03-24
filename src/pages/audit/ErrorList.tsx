import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useState, useEffect } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";

import ModuleInactive from "../ModuleInactive";
import AuditFilters from "../../components/audit/AuditFilters";
import AuditSwitch from "../../components/audit/AuditSwitch";

import { useModuleAccessStore } from "../../store/moduleAccess.store";


import { listErrorEventsService, listErrorComponentsService, listErrorCodesService } from "../../services/agrofusion/audit.service";

import type { ListErrorsRequest } from "../../dto/request/listErrors-request.dto";
import type { ListErrorsResponse } from "../../dto/response/listErrors-response.dto";
import type { ErrorEvent } from "../../dto/response/listErrors-response.dto";

interface PaginationResponse {
  items: ErrorEvent[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

const ErrorList = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState<PaginationResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 5,
    total_pages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notListPerm, setNotListPerm] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [size] = useState(5);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [component, setComponent] = useState("");
  const [project, setProject] = useState("");
  const [code, setCode] = useState("");
  const [components, setComponents] = useState<{ code: string }[]>([]);
  const [codes, setCodes] = useState<{ code: string }[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);


// definir columnas tabla
  const columns: Column<ErrorEvent>[] = [
    {
      key: "error_id",
      label: t("externalErrors.columns.id"),
      type: "text",
      format: (value: string) => value?.slice(0, 7),
    },
    { key: "project", label: t("externalErrors.columns.project"), type: "text" },
    {
      key: "severity",
      label: t("externalErrors.columns.severity"),
      type: "text",
      format: (value: string) => {
        if (value === "HIGH") {
          return (
            <span className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
              {t("externalErrors.severity.high")}
            </span>
          );
        }

        if (value === "MEDIUM") {
          return (
            <span className="px-3 py-1 text-xs font-medium text-white bg-yellow-500 rounded-full">
              {t("externalErrors.severity.medium")}
            </span>
          );
        }

        if (value === "Bajo") {
          return (
            <span className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
              {t("externalErrors.severity.low")}
            </span>
          );
        }

        return value;
      },
    },
    { key: "component", label: t("externalErrors.columns.component"), type: "text" },
    {
      key: "error_code",
      label: t("externalErrors.columns.code"),
      type: "text",
      format: (value: string) => (
        <span className="whitespace-nowrap text-xs font-medium">{value}</span>
      ),
    },
    {
      key: "date",
      label: t("externalErrors.columns.date"),
      type: "text",
      format: (value: string) => {
        if (!value) return "";

        const date = new Date(value);

        return date.toLocaleString("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },

    {
      key: "message",
      label: t("externalErrors.columns.message"),
      type: "text",
      format: (value: string) => {
        if (!value) return "";

        // simplificar mensajes comunes
        if (value.includes("token de ingreso sso")) {
          return t("externalErrors.messages.ssoTokenError");
        }

        if (value.includes("cambio de contraseña")) {
          return t("externalErrors.messages.passwordChangeError");
        }

        if (value.includes("login")) {
          return 
;
        }

        // fallback si no coincide
        if (value.length > 40) {
          return value.substring(0, 40) + "...";
        }

        return value;
      },
    },
  ];

  const getErrorEvents = async (pageToLoad = page) => {
  try {
    // loading ON
    setLoading(true);

    // limpiar estados
    setError(null);
    setNotListPerm(null);

    const payload: ListErrorsRequest = {
      page_index: pageToLoad,
      page_size: size,
      search,
      severity,
      component,
      project,
      error_code: code,
      start_date: startDate ? startDate.toISOString() : undefined,
      end_date: endDate ? endDate.toISOString() : undefined,
    };

    const response: ListErrorsResponse =
      await listErrorEventsService(payload);

    setPagination({
      items: response.items,
      total: response.total,
      page: pageToLoad,
      size: size,
      total_pages: response.total_pages,
    });

  } catch (err: any) {
    console.error(err);

    // 🔒 manejo permisos (igual que Roles/Audit)
    const errorData = err.response?.data?.detail;

if (errorData) {
  const code =
    typeof errorData === "object"
      ? errorData.code
      : errorData;

  setNotListPerm(String(code));
  return;
}

    // error general
    setError(t("externalErrors.error"));;

  } finally {
    // loading OFF
    setLoading(false);
  }
};

  useEffect(() => {
    getErrorEvents(page);
  }, [page, severity, component, project, search, code, startDate, endDate]);

  useEffect(() => {
  listErrorComponentsService()
    .then(setComponents)
    .catch(console.error);

  listErrorCodesService()
    .then(setCodes)
    .catch(console.error);
}, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const applyFilters = () => {
    setPage(1);
    getErrorEvents(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSeverity("");
    setComponent("");
    setProject("");
    setCode("");
    setStartDate(null);
    setEndDate(null);
    setPage(1);

    getErrorEvents(1);
  };

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  

  const showModuleInactive = !canAccessModule("AUDIT");
  

  const showContent = canAccessModule("AUDIT");

  return (
    <AppLayoutSB>
      <div className="relative">
        <TitleTarget
          title={t("externalErrors.title")}
          description={t("externalErrors.description")}
          />

        <AuditSwitch active="errors" />
      </div>

      {/* FILTROS */}

      <AuditFilters
        type="errors"
        search={search}
        setSearch={setSearch}
        origin=""
        setOrigin={() => {}}
        result=""
        setResult={() => {}}
        eventType=""
        setEventType={() => {}}
        severity={severity}
        setSeverity={setSeverity}
        component={component}
        setComponent={setComponent}
        project={project}
        setProject={setProject}
        code={code}
        setCode={setCode}
        components={components}
        codes={codes}
        userSearch=""
        setUserSearch={() => {}}
        setUserId={() => {}}
        users={[]}
        filteredUsers={[]}
        showUserDropdown={false}
        setShowUserDropdown={() => {}}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        origins={[]}
        events={[]}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
      />

      {showModuleInactive && <ModuleInactive />}
      

      {showContent && (
  <>
    {/* LOADING */}
    {loading && (
      <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
        <p className="text-2xl font-bold">
          {t("externalErrors.loading")}
        </p>
      </div>
    )}

    {/* SIN PERMISOS */}
    {!loading && notListPerm && (
      <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
        <p className="text-2xl font-bold">
          {t(`errors.${notListPerm}`)}
        </p>
      </div>
    )}

    {/* ERROR GENERAL */}
    {!loading && !notListPerm && error && (
      <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
        <p className="text-2xl font-bold">
          {t("externalErrors.error")}
        </p>
      </div>
    )}

    {/* SIN DATOS */}
    {!loading && !error && !notListPerm && pagination.items.length === 0 && (
      <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
        <p className="text-2xl font-bold">
          {t("externalErrors.noData")}
        </p>
      </div>
    )}

    {/* TABLA */}
    {!loading && !error && !notListPerm && pagination.items.length > 0 && (
      <DataTable
        data={pagination}
        columns={columns}
        onPageChange={handlePageChange}
        paginationText={t("externalErrors.pagination")}
        maxVisiblePages={5}
      />
    )}
  </>
)}
    </AppLayoutSB>
  );
};

export default ErrorList;
