export interface ListErrorsRequest {
  page_index: number
  page_size: number

  search?: string
  severity?: string
  project?: string
  component?: string
  error_code?: string

  start_date?: string
  end_date?: string
}