export type CheckListItemResponse = {
    id: string;
    transaction_type: string;
    project_name?: string;
    project_code?: string;
    state: string;
    issued_at?: string;
    amount?: number;
    issued_by?: string;
};

export type CheckDetailResponse = CheckListItemResponse & {
    queue_id: string;
    source_project_id: string;
    source_module_code?: string;
    accounting_date?: string;
    sent_at?: string;
    acknowledged_at?: string;
    accounting_entry_id?: string;
    response_json?: Record<string, unknown> | null;
    payload_json: Record<string, unknown>;
    transaction_data: Record<string, unknown>;
    error_message?: string;
    retry_count?: number;
    queue_status?: string;
    attempts?: number;
    max_attempts?: number;
    last_error?: string;
};
  
export type PaginatedChecksResponse = {
    items: CheckListItemResponse[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
};
