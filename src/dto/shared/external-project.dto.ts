/**
 * Representa un proyecto o instancia externa vinculada a AgroFusion.
 */
export interface ExternalProject {
  /** Identificador único universal (UUID) del proyecto */
  external_project_id: string; 
  /** Código corto de identificación de la instancia (ej: 'DISRIEGO_COL') */
  instance_code: string;
  /** Nombre descriptivo del proyecto */
  project_name: string;
  /** Nombre del cliente dueño del proyecto */
  client_name: string;
  /** Estado de disponibilidad del proyecto */
  is_active: boolean;
}
