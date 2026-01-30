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
  /**Descripcion del proyecto */
  description: string;
  /**Imagen principal del proyecto */
  project_image_url: string;
  /**Modulos asociados al proyecto */
  systems: ExternalSystems[];
}

/**
 * Representa un modulo de un proyecto o instancia externa vinculada a AgroFusion.
 */
export interface ExternalSystems{
  /** Id del modulo */
  ext_id: string;
  /** Nombre del modulo */
  name: string;
  /**Base url del modulo */
  base_url: string;
  /**estado del modulo */
  is_active: boolean;
  /**Descripcion del modulo */
  description: string;
  /**Icono del modulo */
  module_icon: string;
}
