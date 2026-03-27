/**
 * Representa un evento de auditoría dentro del sistema.
 */
export type AuditEvent = {
  event_id: string;
  origin: string;
  result: string;
  action: string;
  user: string;
  message: string;
  date: string;
};