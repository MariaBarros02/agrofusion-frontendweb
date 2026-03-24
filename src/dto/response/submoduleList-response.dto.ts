/**
 * Representa un submódulo en el listado de administración.
 */
export interface SubmoduleListResponse {
  /** Identificador único del submódulo */
  af_submodule_id: string;
  /** Código del submódulo */
  code: string | null;
  /** Nombre del submódulo */
  name: string | null;
  /** Descripción del submódulo */
  description: string | null;
  /** Estado del submódulo (ej: ACTIVE, INACTIVE) */
  status: string | null;
  /** ID del módulo padre */
  module_id: string | null;
  /** Código del módulo padre */
  module_code: string | null;
  /** Nombre del módulo padre */
  module_name: string | null;
  /** Fecha de creación del registro (ISO 8601) */
  created_at: string | null;
  /** Responsable (usuario creador del registro) */
  responsible: string | null;
}

/** Respuesta paginada del listado de submódulos */
export interface PaginatedSubmodulesResponse {
  items: SubmoduleListResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}
