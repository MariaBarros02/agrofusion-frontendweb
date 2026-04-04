export interface ExternalEndpointDetailResponse {
  external_endpoint_id: string;
  endpoint_name: string;
  description: string | null;
  path: string;
  method_term_id: string;
  method_name: string | null;
  is_active: boolean;
  body_template: Record<string, unknown> | null;
  params_template: Record<string, unknown> | null;
  response_template: Record<string, unknown> | null;
  external_request_id: string;
  request_code: string;
  request_name: string;
  is_required_by_agrofusion: boolean;
}

export interface ExternalUrlDetailResponse {
  external_url_id: string;
  url_name: string;
  base_url: string;
  client_url: string | null;
  is_active: boolean;
  endpoints: ExternalEndpointDetailResponse[];
}

export interface ExternalSystemDetailResponse {
  ext_id: string;
  name: string;
  base_url: string | null;
  is_active: boolean;
  description: string | null;
  module_icon: string | null;
}

export interface ExternalProjectDetailResponse {
  external_project_id: string;
  instance_code: string | null;
  project_name: string | null;
  client_name: string | null;
  description: string | null;
  is_active: boolean;
  project_image_url: string | null;
  created_at: string | null;
  urls: ExternalUrlDetailResponse[];
  systems: ExternalSystemDetailResponse[];
}
