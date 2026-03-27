/**
 * DTO para solicitar la lista paginada de eventos de auditoría.
 */
export type ListAuditRequest = {
  /** Índice de página */
  page_index?: number;

  /** Tamaño de página */
  page_size?: number;

  /** Búsqueda general */
  search?: string;

  /** Usuario que ejecutó la acción */
  user_id?: string;

  /** Origen del evento */
  origin?: string;

  /** Resultado del evento */
  result?: string;

  /** Fecha inicio del filtro */
  start_date?: string;

  /** Fecha fin del filtro */
  end_date?: string;

  /** Tipo de evento */
  event_type?: string;
};
