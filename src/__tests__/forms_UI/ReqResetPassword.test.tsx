/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ReqResetPassword from "../../pages/RequestResetPass";

/* ======================================================
   Mocks
====================================================== */

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("../../components/layout/Header", () => () => (
  <div data-testid="header" />
));

jest.mock("../../components/layout/ToastSimple", () => (props: any) => (
  <div>{props.messageKey}</div>
));

jest.mock("../../services/agrofusion/auth.service", () => ({
  getExternalProjects: jest.fn(),
  reqResetPasswordService: jest.fn(),
}));

jest.mock("../../services/auth/authOrchestrator.service", () => ({
  handleReqResPasswordEP: jest.fn(),
  projectsLinks: {
    SIGMA: {
      to: "/sigma",
      linkText: "Sigma",
    },
  },
}));

jest.mock("../../scope/auth/authError.scope", () => ({
  isGlobalAuthError: (code: string) =>
    ["AUTH_USER_NOT_FOUND", "AUTH_BLOCKED"].includes(code),
}));

/* ======================================================
   Imports de mocks
====================================================== */

import {
  getExternalProjects,
  reqResetPasswordService,
} from "../../services/agrofusion/auth.service";
import { handleReqResPasswordEP } from "../../services/auth/authOrchestrator.service";

/* ======================================================
   Helpers
====================================================== */

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ReqResetPassword />
    </BrowserRouter>
  );

/* ======================================================
   Tests
====================================================== */

describe("ReqResetPassword Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el formulario inicial de solicitud", () => {
    renderComponent();

    expect(
      screen.getByText("reqResetPassword.requestReset")
    ).toBeInTheDocument();

    expect(screen.getByLabelText("login.email")).toBeInTheDocument();

    expect(
      screen.getByText("reqResetPassword.sendResetLink")
    ).toBeInTheDocument();
  });

  it("NO envía el formulario si el email es inválido", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText("login.email"), {
      target: { value: "correo-invalido" },
    });

    fireEvent.click(
      screen.getByText("reqResetPassword.sendResetLink")
    );

    await waitFor(() => {
      expect(getExternalProjects).not.toHaveBeenCalled();
      expect(handleReqResPasswordEP).not.toHaveBeenCalled();
      expect(reqResetPasswordService).not.toHaveBeenCalled();
    });
  });

  it("ejecuta el flujo completo y muestra la vista de email enviado", async () => {
    (getExternalProjects as jest.Mock).mockResolvedValue([
      { instance_code: "SIGMA" },
    ]);

    (handleReqResPasswordEP as jest.Mock).mockResolvedValue({
      tokens: { tSigma: "token-123" },
      errors: [],
    });

    (reqResetPasswordService as jest.Mock).mockResolvedValue(undefined);

    renderComponent();

    fireEvent.change(screen.getByLabelText("login.email"), {
      target: { value: "test@mail.com" },
    });

    fireEvent.click(
      screen.getByText("reqResetPassword.sendResetLink")
    );

    await waitFor(() => {
      expect(
        screen.getByText("reqResetPassword.sentEmail")
      ).toBeInTheDocument();
    });

    expect(getExternalProjects).toHaveBeenCalled();
    expect(handleReqResPasswordEP).toHaveBeenCalled();
    expect(reqResetPasswordService).toHaveBeenCalled();
  });

  it("muestra un toast por errores en proyectos externos", async () => {
    (getExternalProjects as jest.Mock).mockResolvedValue([
      { instance_code: "SIGMA" },
    ]);

    (handleReqResPasswordEP as jest.Mock).mockResolvedValue({
      tokens: {},
      errors: [
        {
          project: "SIGMA",
          messageKey: "errors.SIGMA_DOWN",
          messageParams: {},
        },
      ],
    });

    (reqResetPasswordService as jest.Mock).mockResolvedValue(undefined);

    renderComponent();

    fireEvent.change(screen.getByLabelText("login.email"), {
      target: { value: "test@mail.com" },
    });

    fireEvent.click(
      screen.getByText("reqResetPassword.sendResetLink")
    );

    await waitFor(() => {
      expect(
        screen.getByText("errors.SIGMA_DOWN")
      ).toBeInTheDocument();
    });
  });

  it("muestra error global cuando ocurre una excepción conocida", async () => {
    (getExternalProjects as jest.Mock).mockRejectedValue({
      response: {
        data: {
          detail: { code: "AUTH_USER_NOT_FOUND" },
        },
      },
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText("login.email"), {
      target: { value: "test@mail.com" },
    });

    fireEvent.click(
      screen.getByText("reqResetPassword.sendResetLink")
    );

    await waitFor(() => {
      expect(
        screen.getByText("errors.AUTH_USER_NOT_FOUND")
      ).toBeInTheDocument();
    });
  });
});
