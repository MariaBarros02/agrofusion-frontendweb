export type ExportFormat = "CSV" | "XLSX" | "PDF" | "JSONL";
export type ExportPriority = "normal" | "high";

export type CreateAuditExportRequest = {
  format: ExportFormat;
  priority?: ExportPriority;
  export_name?: string;
  date_from?: string;
  date_to?: string;
  user_ids?: string[];
  project_ids?: string[];
  module_codes?: string[];
  action_codes?: string[];
  outcomes?: string[];
  entity_types?: string[];
  search?: string;
  fields?: string[];
  mask_pii?: boolean;
  include_sensitive?: boolean;
};
