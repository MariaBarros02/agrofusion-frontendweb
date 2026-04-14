export interface AccountingEndpointFilterOptionResponse {
  value: string;
  label: string;
}

export interface AccountingEndpointListItemResponse {
  external_endpoint_id: string;
  external_url_id: string;
  external_request_id: string;
  request_code: string;
  path: string;
  api_name: string;
  url_endpoint: string;
  external_project_code: string | null;
  operation_type: string;
  method: string | null;
  status: string;
  is_deleted: boolean;
}

export interface PaginatedProjectAccountingEndpointsResponse {
  items: AccountingEndpointListItemResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
  method_options: AccountingEndpointFilterOptionResponse[];
  operation_type_options: AccountingEndpointFilterOptionResponse[];
}

export interface AccountingEndpointDetailResponse {
  external_endpoint_id: string;
  external_url_id: string;
  endpoint_name: string;
  api_url: string;
  api_path: string;
  request_url: string;
  method_code: string;
  description: string | null;
  is_protected: boolean;
}
