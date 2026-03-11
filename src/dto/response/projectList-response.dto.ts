/**
 * Representa un proyecto externo en el listado de administración (RF-GES-01).
 *
 * Atributos del listado: código, nombre del proyecto, estado, fecha de creación, responsable.
 */
export interface ProjectListResponse {
  /** Identificador único del proyecto externo */
  external_project_id: string;
  /** Código de la instancia del proyecto */
  instance_code: string | null;
  /** Nombre del proyecto externo */
  project_name: string | null;
  /** Estado del proyecto (ej: ACTIVE, INACTIVE) */
  status: string | null;
  /** Fecha de creación del registro (ISO 8601) */
  created_at: string | null;
  /** Responsable (usuario creador del registro) */
  responsible: string | null;
}
