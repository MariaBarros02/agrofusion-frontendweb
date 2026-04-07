export interface listChecksRequest {
    page_index?: number;
    page_size?: number;
    search?: string;
    state?: string;
    project_id?: string;
    start_date?: string;
    end_date?: string;
}

export interface listChecksRequest {
    page_index?: number;
    page_size?: number;
    search?: string;
    state?: string;
    project_id?: string;
    transaction_type?: string;
    start_date?: string;
    end_date?: string;
}