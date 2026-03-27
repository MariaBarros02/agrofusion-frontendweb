import { auditAgrofusionAxios } from "./axios";
import type { RegisterErrorPEPayload } from "../audit.service";
import type { ListAuditRequest } from "../../../dto/request/listAudit-request.dto";
import type { ListAuditResponse } from "../../../dto/response/listAudit-response.dto";
import type { ListErrorsRequest } from "../../../dto/request/listErrors-request.dto";
/**
 * Servicio encargado del registro de logs y auditoría del sistema.
 */
export const auditApi = {
  /**
   * Registra múltiples errores de proyectos externos en el sistema de auditoría.
   * @param {RegisterErrorPEPayload[]} data - Arreglo de objetos con detalles de errores a persistir.
   * @returns {Promise<any>} Confirmación del registro.
   */
  registerErrorPE: (data: RegisterErrorPEPayload[]) =>
    auditAgrofusionAxios.post("audit/register-errors-EP", data),

  /**
   * Obtiene la lista paginada de eventos de auditoría.
   * @param params - Parámetros de paginación y filtros.
   * @returns Promise con la lista de eventos de auditoría.
   */
  listAuditEvents: (params: ListAuditRequest) =>
    auditAgrofusionAxios.post<ListAuditResponse>("audit/list", params),

  listErrorEvents: (payload: ListErrorsRequest) =>
    auditAgrofusionAxios.post("audit/errors/list", payload),

  listUsers: () => auditAgrofusionAxios.get("/audit/users"),
listOrigins: () => auditAgrofusionAxios.get("/audit/origins"),
listEvents: () => auditAgrofusionAxios.get("/audit/events"),

listErrorComponents: () => auditAgrofusionAxios.get("/audit/errors/components"),
listErrorCodes: () => auditAgrofusionAxios.get("/audit/errors/codes"),
};
