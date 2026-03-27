import type { AuditEvent } from "../shared/audit.dto";

/**
 * Respuesta paginada de eventos de auditoría.
 */
export type ListAuditResponse = {
  items: AuditEvent[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
};