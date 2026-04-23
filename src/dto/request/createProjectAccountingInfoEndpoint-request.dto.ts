export interface CreateProjectAccountingInfoEndpointRequest {
  endpoint_name: string;
  api_url: string;
  api_path: string;
  request_url: string;
  method_code: string;
  description?: string;
  is_protected: boolean;
}
