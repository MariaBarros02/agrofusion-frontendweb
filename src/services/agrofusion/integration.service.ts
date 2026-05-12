/* eslint-disable @typescript-eslint/no-explicit-any */
import { integrationApi } from "./api/integration.api";
import type { listChecksRequest } from "../../dto/request/listChecks-request.dto";
import type { CheckDetailResponse, PaginatedChecksResponse } from "../../dto/response/listChecks-response.dto";
import type { CheckTypeListResponse } from "../../dto/response/listCheckTypes-response.dto";
import type { AccountingTransferRequest } from "../../dto/request/accountingTransfer-request.dto";
import type { CheckRefreshResponse } from "../../dto/response/accountingDiff-response.dto";
import type { AccountingUpdateResponse } from "../../dto/response/accountingUpdate-response";

export const listChecksService = async (
  payload: listChecksRequest,
): Promise<PaginatedChecksResponse> => {
  const { data } = await integrationApi.listChecks(payload);
  return data;
};

export const getCheckDetailService = async (
  checkId: string,
): Promise<CheckDetailResponse> => {
  const { data } = await integrationApi.getCheckDetail(checkId);
  return data;
};

export const listCheckTypesService = async (): Promise<CheckTypeListResponse> => {
  const { data } = await integrationApi.listCheckTypes();
  return data;
};

export const accountingTransferService = async (consult: AccountingTransferRequest): Promise<any> => {
  const { data } = await integrationApi.transferConsult(consult);
  return data;
};
export const consultAccountingDiffService = async (transfer_id: string): Promise<CheckRefreshResponse> => {
  const { data } = await integrationApi.consultAccountingDiff(transfer_id);
  return data;
};


export const updateVoucherService = async (transfer_id: string, data: any): Promise<AccountingUpdateResponse> => {
  const response = await integrationApi.updateVoucher(transfer_id, {diff: data});
  console.log(response.data);
  return response.data;
}
