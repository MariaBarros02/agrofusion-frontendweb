import { intAgrofusionAxios } from "./axios";
import type { listChecksRequest } from "../../../dto/request/listChecks-request.dto";
import type { CheckDetailResponse, PaginatedChecksResponse } from "../../../dto/response/listChecks-response.dto";
import type { CheckTypeListResponse } from "../../../dto/response/listCheckTypes-response.dto";
import type { AccountingTransferRequest } from "../../../dto/request/accountingTransfer-request.dto";
import type { CheckRefreshResponse } from "../../../dto/response/accountingDiff-response.dto";
export const integrationApi = {
  listChecks: (params: listChecksRequest) =>
    intAgrofusionAxios.get<PaginatedChecksResponse>("integration/accounting-vouchers", { params }),

  getCheckDetail: (checkId: string) =>
    intAgrofusionAxios.get<CheckDetailResponse>(`/${checkId}`),

  listCheckTypes: () =>
    intAgrofusionAxios.get<CheckTypeListResponse>("integration/accounting-vouchers/types"),
  
  transferConsult: (consult: AccountingTransferRequest) =>
    intAgrofusionAxios.post("accounting-transfer", consult),
  
  consultAccountingDiff: (transfer_id: string) =>
    intAgrofusionAxios.get<CheckRefreshResponse>(`${transfer_id}/refresh`),
};
