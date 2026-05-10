import type { AccountingConsultResponse } from "../response/accountingConsult-response.dto";

export type AccountingTransferRequest = {
  external_project_id: string;
  external_endpoint_id: string;
  normalized_json: AccountingConsultResponse;
};