// Layout principal del sistema (sidebar + estructura base)
import AppLayoutSB from "../../components/layout/AppLayoutSB";

// Componente de título y descripción de la vista
import TitleTarget from "../../components/layout/TitleTarget";

// Hooks de React
import { useState, useEffect } from "react";

// Traducciones (i18n)
import { useTranslation } from "react-i18next";

// Tabla reutilizable con paginación
import DataTable, { type Column } from "../../components/DataTable";

// Estilos del datepicker (usado en filtros)
import "react-datepicker/dist/react-datepicker.css";

// Vista cuando el módulo está inactivo
import ModuleInactive from "../ModuleInactive";

// Filtros de auditoría (componente separado)
import AuditFilters from "../../components/audit/AuditFilters";

// Switch entre auditoría y errores
import AuditSwitch from "../../components/audit/AuditSwitch";

// Control de acceso a módulos
import { useModuleAccessStore } from "../../store/moduleAccess.store";

// Control de submódulos (carga de permisos)
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";

// Servicios para consumir API de auditoría
import {
  listAuditEventsService,
  listUsersService,
  listOriginsService,
  listEventsService,
  createAuditExportService,
  getAuditExportService,
} from "../../services/agrofusion/audit.service";
import { env } from "../../config/env";
import type {
  CreateAuditExportRequest,
  ExportFormat,
} from "../../dto/request/createAuditExport-request.dto";

// Tipos para request al backend
import type { ListAuditRequest } from "../../dto/request/listAudit-request.dto";

// Tipos para response del backend
import type { ListAuditResponse } from "../../dto/response/listAudit-response.dto";

// Tipo de evento de auditoría
import type { AuditEvent } from "../../dto/shared/audit.dto";

/**
 * Estructura de respuesta paginada para la tabla de auditoría
 * 
 * items        → Lista de eventos de auditoría
 * total        → Total de registros en BD
 * page         → Página actual
 * size         → Cantidad de registros por página
 * total_pages  → Total de páginas disponibles
 */
interface PaginatedAuditResponse {
  items: AuditEvent[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

/**
 * Recorta texto largo para evitar desbordes en la tabla
 * 
 * @param text Texto a recortar
 * @param max Cantidad máxima de caracteres
 * @returns Texto recortado con "..."
 */
const truncate = (text: string | number | undefined, max = 40): string => {
  if (!text) return "";
  const str = String(text);
  return str.length > max ? str.substring(0, max) + "..." : str;
};

/**
 * Traduce el código de acción a un mensaje amigable para UI
 * 
 * @param action Código del evento (ej: LOGIN_SUCCESS)
 * @param t Función de traducción i18n
 * @returns Mensaje traducido
 */
const formatAuditMessage = (action: string, t: any) => {
  const messages: Record<string, string> = {
    TOKENS_REFRESHED: t("audit.messages.tokenRefreshed"),
    SESSION_CREATED: t("audit.messages.sessionCreated"),
    LOGIN_SUCCESS: t("audit.messages.loginSuccess"),
    PASSWORD_RESET_COMPLETED: t("audit.messages.passwordResetCompleted"),
    PASSWORD_RESET_REQUESTED: t("audit.messages.passwordResetRequested"),
    USER_CREATED: t("audit.messages.userCreated"),
    USER_UPDATED: t("audit.messages.userUpdated"),
    USER_DELETED: t("audit.messages.userDeleted"),
  };

  return messages[action] || t("audit.messages.default");
};


const AuditList = () => {

  //Traducción
  const { t } = useTranslation();

  //Datos provenientes del backend para filtros
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [origins, setOrigins] = useState<{ code: string }[]>([]);
  const [events, setEvents] = useState<{ code: string }[]>([]);

  //Búsqueda de usuario en input
  const [userSearch, setUserSearch] = useState("");

  //Usuarios filtrados según búsqueda
  const [filteredUsers, setFilteredUsers] = useState<typeof users>([]);

  // Control para mostrar/ocultar dropdown de usuarios
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Estado principal de paginación y datos para la tabla
  const [pagination, setPagination] = useState<PaginatedAuditResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    total_pages: 1,
  });

  // Estado de carga para mostrar spinner
  const [loading, setLoading] = useState(false);

  //
  const [notListPerm, setNotListPerm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parámetros de paginación
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  //Filtros principales de búsqueda
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("");
  const [result, setResult] = useState("");
  const [userId, setUserId] = useState("");
  const [eventType, setEventType] = useState("");

  //Búsqueda con debounce para evitar llamadas excesivas al backend
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  //Rango de fechas
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [exportFormat, setExportFormat] = useState<ExportFormat>("CSV");
  const [exportBusy, setExportBusy] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<{
    exportId: string;
    token: string;
    filename: string;
    hash: string;
    records: number;
  } | null>(null);
  const [redownloadBusy, setRedownloadBusy] = useState(false);

  const EXPORT_EXT: Record<ExportFormat, string> = {
    CSV: "csv",
    XLSX: "xlsx",
    JSONL: "jsonl",
    PDF: "pdf",
  };

  const FORMAT_OPTIONS: {
    id: ExportFormat;
    labelKey: string;
    descKey: string;
    accent: string;
  }[] = [
    { id: "CSV", labelKey: "audit.export.fmtCsv", descKey: "audit.export.fmtCsvDesc", accent: "from-sky-500/15 to-sky-600/5 ring-sky-400/40" },
    { id: "XLSX", labelKey: "audit.export.fmtXlsx", descKey: "audit.export.fmtXlsxDesc", accent: "from-emerald-500/15 to-emerald-600/5 ring-emerald-400/40" },
    { id: "JSONL", labelKey: "audit.export.fmtJsonl", descKey: "audit.export.fmtJsonlDesc", accent: "from-violet-500/15 to-violet-600/5 ring-violet-400/40" },
    { id: "PDF", labelKey: "audit.export.fmtPdf", descKey: "audit.export.fmtPdfDesc", accent: "from-rose-500/15 to-rose-600/5 ring-rose-400/40" },
  ];

  const downloadExportFile = async (
    exportId: string,
    token: string,
    filename: string
  ) => {
    const base = (env.VITE_API_AUDIT_AF_URL || "").replace(/\/$/, "");
    const url = `${base}/audit/exports/${exportId}/download?token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("DOWNLOAD_FAILED");
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

// Definición de columnas para la tabla de auditoría
  const columns: Column<AuditEvent>[] = [
    { key: "event_id", label: t("audit.columns.id"), type: "text", width:"70px" },
    { key: "origin", label: t("audit.columns.origin"), type: "text" },
    {
      key: "result",
      label: t("audit.columns.result"),
      type: "text",
      width:"90px",
      format: (value: string) => {
        if (value === "SUCCESS") {
          return (
            <span className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
              {t("common.success")}
            </span>
          );
        }

        if (value === "FAILED") {
          return (
            <span className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
              {t("common.rejected")}
            </span>
          );
        }

        return value;
      },
    },
    {
      key: "date",
      label: t("audit.columns.date"),
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
    { key: "action", label: t("audit.columns.action"), type: "text" },
    { key: "user", label: t("audit.columns.user"), type: "text" },
    { key: "message", label: t("audit.columns.message"), type: "text" },
  ];

  // Función para obtener eventos de auditoría desde el backend

  const getAuditEvents = async (pageToLoad = page) => {
    try {
      // Activar loading
      setLoading(true);

      // Limpiar estados previos
      setError(null);
      setNotListPerm(null);

      // Preparar payload para request
      const payload: ListAuditRequest = {
        page_index: pageToLoad,
        page_size: size,
        search: debouncedSearch,
        origin,
        result,
        user_id: userId,
        event_type: eventType,
        start_date: startDate ? startDate.toISOString() : undefined,
        end_date: endDate ? endDate.toISOString() : undefined,
      };

      const response: ListAuditResponse = await listAuditEventsService(payload);


      // Formatear datos para la tabla (recortar textos largos, traducir mensajes, etc)
      const formattedItems: AuditEvent[] = response.items.map((event: any) => {
        return {
          ...event,
          event_id: event.event_id?.substring(0, 7),
          origin: t(`audit.${event.origin}`),
          action: event.action,
          user:(event.user ?? event.user_id),
          message:event.description,
          result: String(event.result).toUpperCase(),
        };
      });

      setPagination({
        items: formattedItems,
        total: response.total,
        page: pageToLoad,
        size,
        total_pages: response.total_pages,
      });
    } catch (err: any) {
      console.error(err);

      // 🔒 Manejo de permisos (igual que Roles)
      const errorData = err.response?.data?.detail;

      if (errorData) {
        const code = typeof errorData === "object" ? errorData.code : errorData;

        setNotListPerm(String(code));
        return;
      }

      //Error general
      setError(t("audit.error"));
    } finally {
      // 🔄 Desactivar loading
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
useEffect(() => {
  getAuditEvents(page);
}, [
  page,
  userId,
  origin,
  result,
  eventType,
  startDate,
  endDate,
  debouncedSearch,
]);
/* eslint-enable react-hooks/exhaustive-deps */

// Cargar datos para filtros (usuarios, orígenes, tipos de eventos)
  useEffect(() => {
    listUsersService().then(setUsers).catch(console.error);
    listOriginsService().then(setOrigins).catch(console.error);
    listEventsService().then(setEvents).catch(console.error);
  }, []);

  useEffect(() => {
    if (!userSearch.trim()) {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()),
    );

    setFilteredUsers(filtered);
  }, [userSearch, users]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const applyFilters = () => {
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setOrigin("");
    setResult("");
    setUserId("");
    setEventType("");
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  const mapOutcomesForExport = (): string[] | undefined => {
    if (!result) return undefined;
    const r = result.toUpperCase();
    if (r === "SUCCESS") return ["success"];
    if (r === "FAILED" || r === "FAILURE") return ["failed"];
    return [result.toLowerCase()];
  };

  const handleAuditExport = async () => {
    setExportMsg(null);
    setExportSuccess(null);
    setExportBusy(true);
    try {
      const body: CreateAuditExportRequest = {
        format: exportFormat,
        priority: "normal",
        export_name: `Informe auditoría ${new Date().toISOString().slice(0, 10)}`,
        date_from: startDate ? startDate.toISOString() : undefined,
        date_to: endDate ? endDate.toISOString() : undefined,
        user_ids: userId ? [userId] : undefined,
        module_codes: origin ? [origin] : undefined,
        action_codes: eventType ? [eventType] : undefined,
        outcomes: mapOutcomesForExport(),
        search: debouncedSearch || undefined,
      };
      const created = await createAuditExportService(body);
      setExportMsg(t("audit.export.requested"));

      let settled = false;
      const maxAttempts = 90;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const st = await getAuditExportService(created.export_id);
        if (st.status === "COMPLETED" && st.download_token) {
          settled = true;
          const fname =
            st.download_filename ||
            `AgroFusion_Auditoria_${created.export_id.slice(0, 8)}.${EXPORT_EXT[exportFormat]}`;
          await downloadExportFile(created.export_id, st.download_token, fname);
          setExportSuccess({
            exportId: created.export_id,
            token: st.download_token,
            filename: fname,
            hash: st.file_hash ?? "",
            records: st.actual_records ?? 0,
          });
          setExportMsg(t("audit.export.ready"));
          break;
        }
        if (st.status === "FAILED") {
          settled = true;
          setExportMsg(st.error_message || t("audit.export.failed"));
          break;
        }
        if (i % 5 === 0) {
          setExportMsg(t("audit.export.polling"));
        }
      }
      if (!settled) {
        setExportMsg(t("audit.export.timeout"));
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: { code?: string } } } };
      const code = e.response?.data?.detail?.code;
      if (code === "AUTH_INSUFFICIENT_PERMISSIONS") {
        setExportMsg(t("audit.export.forbidden"));
      } else {
        setExportMsg(t("audit.export.failed"));
      }
    } finally {
      setExportBusy(false);
    }
  };

  const handleRedownload = async () => {
    if (!exportSuccess) return;
    setRedownloadBusy(true);
    try {
      await downloadExportFile(
        exportSuccess.exportId,
        exportSuccess.token,
        exportSuccess.filename
      );
    } catch {
      setExportMsg(t("audit.export.failed"));
    } finally {
      setRedownloadBusy(false);
    }
  };

  // Control de acceso 
  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);

  const showModuleInactive = !canAccessModule("AUDIT");
  const showContent = canAccessModule("AUDIT");

  return (
    <AppLayoutSB>
      <div className="relative">
        <TitleTarget
  title={t("audit.title")}
  description={t("audit.description")}
/>

        <AuditSwitch active="audit" />
      </div>
  
      <AuditFilters
        type="audit"
        search={search}
        setSearch={setSearch}
        origin={origin}
        setOrigin={setOrigin}
        result={result}
        setResult={setResult}
        eventType={eventType}
        setEventType={setEventType}
        code=""
        setCode={() => {}}
        components={[]}
        codes={[]}
        severity=""
        setSeverity={() => {}}
        component=""
        setComponent={() => {}}
        project=""
        setProject={() => {}}
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        setUserId={setUserId}
        users={users}
        filteredUsers={filteredUsers}
        showUserDropdown={showUserDropdown}
        setShowUserDropdown={setShowUserDropdown}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        origins={origins}
        events={events}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
      />

      {showContent && !notListPerm && (
        <div className="mt-4 overflow-hidden border shadow-md rounded-2xl border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-white dark:border-emerald-900/50 dark:from-gray-800 dark:via-emerald-950/30 dark:to-gray-800">
          <div className="px-5 py-4 border-b border-emerald-100/90 bg-emerald-600/10 dark:border-emerald-900/40 dark:bg-emerald-900/20">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              {t("audit.export.title")}
            </h3>
            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/70">
              {t("audit.export.subtitle")}
            </p>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
                {t("audit.export.format")}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {FORMAT_OPTIONS.map((opt) => {
                  const active = exportFormat === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={exportBusy}
                      onClick={() => setExportFormat(opt.id)}
                      className={`rounded-xl border bg-gradient-to-br p-3 text-left transition-all ring-2 ring-transparent ${
                        opt.accent
                      } ${
                        active
                          ? "border-emerald-500 shadow-md ring-emerald-500/50 dark:border-emerald-400"
                          : "border-slate-200/90 opacity-90 hover:border-emerald-300 hover:shadow dark:border-slate-600"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                        {t(opt.labelKey)}
                      </span>
                      <span className="block mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t(opt.descKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleAuditExport()}
                disabled={exportBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {exportBusy && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {exportBusy ? t("audit.export.polling") : t("audit.export.run")}
              </button>
              {exportMsg && !exportSuccess && (
                <span className="text-sm text-slate-600 dark:text-slate-300">{exportMsg}</span>
              )}
            </div>

            {exportSuccess && (
              <div className="p-4 border rounded-xl border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      {t("audit.export.ready")}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-800/80 dark:text-emerald-200/80">
                      {exportSuccess.records} {t("audit.export.records")} ·{" "}
                      <span className="font-mono">{exportSuccess.filename}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRedownload()}
                    disabled={redownloadBusy}
                    className="rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/50 dark:text-emerald-100 dark:hover:bg-emerald-900"
                  >
                    {redownloadBusy ? t("audit.export.downloading") : t("audit.export.download")}
                  </button>
                </div>
                <div className="px-3 py-2 mt-3 rounded-lg bg-white/90 dark:bg-gray-900/60">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("audit.export.hashHint")}
                  </p>
                  <p className="mt-1 font-mono text-xs break-all text-slate-700 dark:text-slate-200">
                    {exportSuccess.hash || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showModuleInactive && <ModuleInactive />}

      {showContent && (
        <>
          {/* LOADING */}
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-2xl font-bold">
                {t("audit.loading")}
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
              <p className="text-2xl font-bold">{t("audit.error")}</p>
            </div>
          )}

          {/* SIN DATOS */}
          {!loading &&
            !error &&
            !notListPerm &&
            pagination.items.length === 0 && (
              <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
                <p className="text-2xl font-bold">
                  {t("audit.noData")}
                </p>
              </div>
            )}

          {/* TABLA */}
          {!loading &&
            !error &&
            !notListPerm &&
            pagination.items.length > 0 && (
              <DataTable
                data={pagination}
                columns={columns}
                onPageChange={handlePageChange}
                paginationText={t("audit.pagination")}
                maxVisiblePages={5}
              />
            )}
        </>
      )}
    </AppLayoutSB>
  );
};

export default AuditList;
