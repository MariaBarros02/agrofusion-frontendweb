export interface ExternalRequestTemplateResponse {
  external_request_id: string;
  request_code: string;
  request_name: string;
  description: string | null;
  is_required_by_agrofusion: boolean;
  body_template: Record<string, unknown> | null;
  params_template: Record<string, unknown> | null;
  response_template: Record<string, unknown> | null;
}
