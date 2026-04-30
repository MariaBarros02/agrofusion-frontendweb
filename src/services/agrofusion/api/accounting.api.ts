import { intAgrofusionAxios } from "./axios";
import type { AccountingConsultRequest } from "../../../dto/request/accountingConsult-request.dto";
import type { AccountingConsultResponse } from "../../../dto/response/accountingConsult-response.dto";

export const accountingApi = {
  consultAccountingInfo: (payload: AccountingConsultRequest) =>
    intAgrofusionAxios.post<AccountingConsultResponse>(
      "integration/accounting-vouchers/consult",
      payload,
    ),
};