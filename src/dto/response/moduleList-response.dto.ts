/**
 * Representa un módulo en el listado de administración.
 */
export interface ModuleListResponse {
  /** Identificador único del módulo */
  af_module_id: string;
  /** Código del módulo */
  code: string | null;
  /** Nombre del módulo */
  name: string | null;
  /** Estado del módulo (ej: ACTIVE, INACTIVE) */
  status: string | null;
  /** ID del proyecto asociado */
  af_project_id: string | null;
  /** Código del proyecto asociado */
  project_code: string | null;
  /** Nombre del proyecto asociado */
  project_name: string | null;
  /** Fecha de creación del registro (ISO 8601) */
  created_at: string | null;
  /** Responsable (usuario creador del registro) */
  responsible: string | null;
}
