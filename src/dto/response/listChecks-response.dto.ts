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
  
export type PaginatedChecksResponse = {
    items: CheckListItemResponse[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
};