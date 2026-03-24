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
} from "../../services/agrofusion/audit.service";

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
    size: 5,
    total_pages: 1,
  });

  // Estado de carga para mostrar spinner
  const [loading, setLoading] = useState(false);

  //
  const [notListPerm, setNotListPerm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parámetros de paginación
  const [page, setPage] = useState(1);
  const [size] = useState(5);

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
          origin: truncate(event.origin, 20),
          action: truncate(event.action, 20),
          user: truncate(event.user ?? event.user_id, 20),
          message: formatAuditMessage(event.action, t),
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
