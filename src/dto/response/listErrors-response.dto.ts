export interface ErrorEvent {
  error_id: string
  component: string
  severity: string
  project: string
  message: string
  error_code: string
  date: string
}

export interface ListErrorsResponse {
  items: ErrorEvent[]
  total: number
  page: number
  size: number
  total_pages: number
}