/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "../../../services/agrofusion/api/auth.api";
import { authAgrofusionAxios } from "../../../services/agrofusion/api/axios";
jest.mock("../../../api/agrofusion/axios", () => ({
  authAgrofusionAxios: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("authApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getExternalProjects → GET auth/external-projects", async () => {
    const mockResponse = { data: [] };
    (authAgrofusionAxios.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.getExternalProjects();

    expect(authAgrofusionAxios.get).toHaveBeenCalledWith(
      "auth/external-projects"
    );
    expect(result).toBe(mockResponse);
  });

  it("login → POST auth/login", async () => {
    const payload = { email: "test@test.com", password: "123456" };
    const mockResponse = { data: { token: "jwt" } };

    (authAgrofusionAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.login(payload as any);

    expect(authAgrofusionAxios.post).toHaveBeenCalledWith(
      "auth/login",
      payload
    );
    expect(result).toBe(mockResponse);
  });

  it("logout → POST auth/logout", async () => {
    const mockResponse = { data: null };
    (authAgrofusionAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.logout();

    expect(authAgrofusionAxios.post).toHaveBeenCalledWith("auth/logout");
    expect(result).toBe(mockResponse);
  });

  it("ssoLogin → POST auth/sso-token", async () => {
    const payload = { project_code: "SIGMA" };
    const mockResponse = { data: { token: "sso-token" } };

    (authAgrofusionAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.ssoLogin(payload);

    expect(authAgrofusionAxios.post).toHaveBeenCalledWith(
      "auth/sso-token",
      payload
    );
    expect(result).toBe(mockResponse);
  });

  it("verifyMfa → POST auth/verify-otp", async () => {
    const payload = { otp: "123456", session_id: "abc" };
    const mockResponse = { data: { token: "jwt" } };

    (authAgrofusionAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.verifyMfa(payload as any);

    expect(authAgrofusionAxios.post).toHaveBeenCalledWith(
      "auth/verify-otp",
      payload
    );
    expect(result).toBe(mockResponse);
  });

  it("reqResetPassword → POST auth/request-reset-password", async () => {
    const payload = {
      email: "test@test.com",
      tokens: { AF: "t1", SIGMA: "t2" },
    };

    const mockResponse = { data: null };
    (authAgrofusionAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.reqResetPassword(payload as any);

    expect(authAgrofusionAxios.post).toHaveBeenCalledWith(
      "auth/request-reset-password",
      payload
    );
    expect(result).toBe(mockResponse);
  });

  it("resetPassword → POST auth/reset-password/:token", async () => {
    const payload = {
      token: "reset-token",
      newPassword: "123456",
      confirmPassword: "123456",
    };

    const mockResponse = { data: null };
    (authAgrofusionAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.resetPassword(payload);

    expect(authAgrofusionAxios.post).toHaveBeenCalledWith(
      `auth/reset-password/${payload.token}`,
      {
        new_password: payload.newPassword,
        confirm_password: payload.confirmPassword,
      }
    );
    expect(result).toBe(mockResponse);
  });

  it("logErrorPE → POST auth/log-error-EP", async () => {
    const payload = { project: "SIGMA", detail: "Error 500" };
    const mockResponse = { data: null };

    (authAgrofusionAxios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.logErrorPE(payload);

    expect(authAgrofusionAxios.post).toHaveBeenCalledWith(
      "auth/log-error-EP",
      payload
    );
    expect(result).toBe(mockResponse);
  });
});
