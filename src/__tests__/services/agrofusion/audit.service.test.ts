/* eslint-disable @typescript-eslint/no-explicit-any */
import { auditApi } from "../../../services/agrofusion/api/audit.api";
import { auditAgrofusionAxios } from "../../../services/agrofusion/api/axios";

jest.mock("../../../api/agrofusion/axios", () => ({
  auditAgrofusionAxios: {
    post: jest.fn(),
  },
}));

describe("auditApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registerErrorPE → POST audit/register-errors-EP", async () => {
    const payload = [
      {
        project: "SIGMA",
        detail: "Error de autenticación",
        timestamp: "2024-01-01T00:00:00Z",
      },
      {
        project: "AF",
        detail: "Timeout en servicio",
        timestamp: "2024-01-01T00:01:00Z",
      },
    ];

    const mockResponse = { data: { success: true } };

    (auditAgrofusionAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await auditApi.registerErrorPE(payload as any);

    expect(auditAgrofusionAxios.post).toHaveBeenCalledWith(
      "audit/register-errors-EP",
      payload
    );

    expect(result).toBe(mockResponse);
  });

  it("registerErrorPE → propaga errores de axios", async () => {
  const payload = [{ project: "SIGMA", detail: "Error" }];
  const error = new Error("Network error");

  (auditAgrofusionAxios.post as jest.Mock).mockRejectedValue(error);

  await expect(auditApi.registerErrorPE(payload as any)).rejects.toThrow(
    "Network error"
  );
});

});
