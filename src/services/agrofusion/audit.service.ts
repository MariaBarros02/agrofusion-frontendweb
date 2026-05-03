import { auditApi } from "./api/audit.api";
import type { ListAuditRequest } from "../../dto/request/listAudit-request.dto";
import type { ListAuditResponse } from "../../dto/response/listAudit-response.dto";
import type { ListErrorsRequest } from "../../dto/request/listErrors-request.dto";
import type { ListErrorsResponse } from "../../dto/response/listErrors-response.dto";
import type { CreateAuditExportRequest } from "../../dto/request/createAuditExport-request.dto";
import type { AuditExportJobResponse } from "../../dto/response/auditExport-response.dto";
import type { AuditExportSigningReadinessResponse } from "../../dto/response/auditExportSigningReadiness-response.dto";
/**
 * Define la estructura de datos para el registro de errores en proyectos externos (PE).
 * Se utiliza para auditar fallos de sincronización, errores de red o excepciones de lógica.
 */
export type RegisterErrorPEPayload = {
  /** El flujo donde ocurre el error (ej: "RESET_PASSWORD_ORCHESTRATION") */
  context: string;

  /** El identificador del proyecto externo (ej: "SIGMA", "DISRIEGO") */
  project: string;

  /** Descripción legible del error para el equipo de desarrollo */
  message: string;

  /** Nivel de importancia (ej: "CRITICAL", "WARNING", "INFO") */
  severity: string;

  /** Un fragmento del objeto o respuesta que causó el fallo para depuración */
  payload_excerpt: object;

  /** Código de error técnico devuelto por el servidor o el catch */
  error_code: string;

  /** Nombre del componente o servicio de frontend donde se disparó el log */
  component: string;
};

/**
 * Servicio para enviar una lista de errores al sistema de auditoría central de AgroFusion.
 *
 * @param errors - Array de objetos que cumplen con la interfaz RegisterErrorPEPayload.
 * @returns Promesa con la respuesta del servidor.
 */
export const registerErrorPEService = async (
  errors: RegisterErrorPEPayload[]
) => {
  try {
    console.log("📡 Sending audit errors:", errors);

    const { data } = await auditApi.registerErrorPE(errors);

    return data;
  } catch (error) {
    console.error("Error registering external project errors:", error);
    throw error;
  }
};

/**
 * Listar auditoría
 */
export const listAuditEventsService = async (
  payload: ListAuditRequest
): Promise<ListAuditResponse> => {
  try {
    console.log("📡 Fetching audit events with payload:", payload);

    const { data } = await auditApi.listAuditEvents(payload);

    return data;
  } catch (error) {
    console.error("Error fetching audit events:", error);
    throw error;
  }
};

/**
 * ==================== FILTROS AUDITORÍA ====================
 */

export const listUsersService = async () => {
  try {
    const { data } = await auditApi.listUsers();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const listOriginsService = async () => {
  try {
    const { data } = await auditApi.listOrigins();
    return data;
  } catch (error) {
    console.error("Error fetching origins:", error);
    throw error;
  }
};

export const listEventsService = async () => {
  try {
    const { data } = await auditApi.listEvents();
    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

/**
 * ==================== ERRORES ====================
 */

export const listErrorEventsService = async (
  payload: ListErrorsRequest
): Promise<ListErrorsResponse> => {
  try {
    console.log("📡 Fetching external project errors:", payload);

    const { data } = await auditApi.listErrorEvents(payload);

    return data;
  } catch (error) {
    console.error("Error fetching external project errors:", error);
    throw error;
  }
};

export const listErrorComponentsService = async () => {
  try {
    const { data } = await auditApi.listErrorComponents();
    return data;
  } catch (error) {
    console.error("Error fetching components:", error);
    throw error;
  }
};

export const listErrorCodesService = async () => {
  try {
    const { data } = await auditApi.listErrorCodes();
    return data;
  } catch (error) {
    console.error("Error fetching error codes:", error);
    throw error;
  }
};

export const createAuditExportService = async (
  payload: CreateAuditExportRequest
): Promise<AuditExportJobResponse> => {
  const { data } = await auditApi.createAuditExport(payload);
  return data;
};

export const getAuditExportService = async (
  exportId: string
): Promise<AuditExportJobResponse> => {
  const { data } = await auditApi.getAuditExport(exportId);
  return data;
};

export const getAuditExportSigningReadinessService =
  async (): Promise<AuditExportSigningReadinessResponse> => {
    const { data } = await auditApi.getAuditExportSigningReadiness();
    return data;
  };

export const listAuditExportsService = async (
  limit?: number
): Promise<AuditExportJobResponse[]> => {
  const { data } = await auditApi.listAuditExports({ limit });
  return data;
};