import { accountingApi } from "./api/accounting.api";
import type { AccountingConsultRequest } from "../../dto/request/accountingConsult-request.dto";
import type { AccountingConsultResponse } from "../../dto/response/accountingConsult-response.dto";

export const consultAccountingInfoService = async (
  payload: AccountingConsultRequest,
): Promise<AccountingConsultResponse> => {
  const { data } = await accountingApi.consultAccountingInfo(payload);
  return data;
};