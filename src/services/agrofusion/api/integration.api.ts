import { intAgrofusionAxios } from "./axios";
import type { listChecksRequest } from "../../../dto/request/listChecks-request.dto";
import type { PaginatedChecksResponse } from "../../../dto/response/listChecks-response.dto";
import type { CheckTypeListResponse } from "../../../dto/response/listCheckTypes-response.dto";

export const integrationApi = {
  listChecks: (params: listChecksRequest) =>
    intAgrofusionAxios.get<PaginatedChecksResponse>("integration/accounting-vouchers", { params }),

  listCheckTypes: () =>
    intAgrofusionAxios.get<CheckTypeListResponse>("integration/accounting-vouchers/types"),
};