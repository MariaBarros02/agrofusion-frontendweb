/**
 * Módulo de acceso rápido para crear proyecto externo (RF-GES-14).
 */
export interface CreateModuleRequest {
  name: string;
  base_url: string;
  module_icon: string;
  description: string;
}

/**
 * Request para registrar un nuevo proyecto externo (RF-GES-14).
 */
export interface CreateProjectRequest {
  instance_code: string;
  project_name: string;
  project_url: string;
  description: string;
  is_active: boolean;
  project_image: string;
  project_image_mime_type: string;
  api_url_base: string;
  modules: CreateModuleRequest[];
}
