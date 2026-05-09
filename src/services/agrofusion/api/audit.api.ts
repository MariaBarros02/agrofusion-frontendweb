import { auditAgrofusionAxios } from "./axios";
import type { RegisterErrorPEPayload } from "../audit.service";
import type { ListAuditRequest } from "../../../dto/request/listAudit-request.dto";
import type { ListAuditResponse } from "../../../dto/response/listAudit-response.dto";
import type { ListErrorsRequest } from "../../../dto/request/listErrors-request.dto";
import type { CreateAuditExportRequest } from "../../../dto/request/createAuditExport-request.dto";
import type { AuditExportJobResponse } from "../../../dto/response/auditExport-response.dto";
import type { AuditExportSigningReadinessResponse } from "../../../dto/response/auditExportSigningReadiness-response.dto";

export type CheckExportFormat = "JSON" | "CSV" | "XML";

export type CreateCheckExportRequest = {
  check_id: string;
  format: CheckExportFormat;
};

export type CheckExportResponse = {
  export_id: string;
  check_id: string;
  status: string;
  format: string;
  export_name?: string | null;
  requested_at?: string;
  completed_at?: string;
  expires_at?: string;
  file_size_bytes?: number | null;
  file_hash?: string | null;
  digital_signature?: string | null;
  error_message?: string | null;
  download_token?: string | null;
  download_filename?: string | null;
};

export type SigningReadinessResponse = {
  ready: boolean;
  message?: string | null;
  key_id?: string | null;
  key_alias?: string | null;
};
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

  createAuditExport: (body: CreateAuditExportRequest) =>
    auditAgrofusionAxios.post<AuditExportJobResponse>("audit/exports", body),

  getAuditExport: (exportId: string) =>
    auditAgrofusionAxios.get<AuditExportJobResponse>(`audit/exports/${exportId}`),

  listAuditExports: (params?: { limit?: number }) =>
    auditAgrofusionAxios.get<AuditExportJobResponse[]>("audit/exports", { params }),

  deleteAuditExport: (exportId: string) =>
    auditAgrofusionAxios.delete(`audit/exports/${exportId}`),

  checkSigningReadiness: () =>
    auditAgrofusionAxios.get<SigningReadinessResponse>("audit/checks/signing-readiness"),

  exportCheckVoucher: (body: CreateCheckExportRequest) =>
    auditAgrofusionAxios.post<CheckExportResponse>("audit/checks/export", body),

  getCheckExport: (exportId: string) =>
    auditAgrofusionAxios.get<CheckExportResponse>(`audit/checks/exports/${exportId}`),
    getAuditExportSigningReadiness: () =>
    auditAgrofusionAxios.get<AuditExportSigningReadinessResponse>(
      "audit/exports/signing-readiness"
    ),

};
