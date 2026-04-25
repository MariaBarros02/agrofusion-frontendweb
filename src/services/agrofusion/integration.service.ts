import { integrationApi } from "./api/integration.api";
import type { listChecksRequest } from "../../dto/request/listChecks-request.dto";
import type { PaginatedChecksResponse } from "../../dto/response/listChecks-response.dto";
import type { CheckTypeListResponse } from "../../dto/response/listCheckTypes-response.dto";

export const listChecksService = async (
  payload: listChecksRequest,
): Promise<PaginatedChecksResponse> => {
  const { data } = await integrationApi.listChecks(payload);
  return data;
};

export const listCheckTypesService = async (): Promise<CheckTypeListResponse> => {
  const { data } = await integrationApi.listCheckTypes();
  return data;
};