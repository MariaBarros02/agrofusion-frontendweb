import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "../../pages/ResetPassword";
import { BrowserRouter } from "react-router-dom";

/* ======================================================
   Mocks
====================================================== */

/* i18n */
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

/* Header */
jest.mock("../../components/layout/Header", () => () => (
  <div data-testid="header" />
));

/* ======================================================
   Helpers
====================================================== */

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ResetPassword />
    </BrowserRouter>
  );

/* ======================================================
   Tests
====================================================== */

describe("ResetPassword Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el formulario de reset de contraseña", () => {
    renderComponent();

    expect(
      screen.getByText("resetPassword.resetPassword")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("resetPassword.newPassword")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("resetPassword.confirmPassword")
    ).toBeInTheDocument();

    expect(
      screen.getByText("resetPassword.resetButton")
    ).toBeInTheDocument();
  });

  it("permite escribir la nueva contraseña y confirmarla", async () => {
    renderComponent();

    fireEvent.change(
      screen.getByLabelText("resetPassword.newPassword"),
      { target: { value: "Password123!" } }
    );

    fireEvent.change(
      screen.getByLabelText("resetPassword.confirmPassword"),
      { target: { value: "Password123!" } }
    );

    expect(
      screen.getByLabelText("resetPassword.newPassword")
    ).toHaveValue("Password123!");

    expect(
      screen.getByLabelText("resetPassword.confirmPassword")
    ).toHaveValue("Password123!");
  });

  it("envía el formulario al hacer submit", async () => {
    renderComponent();

    fireEvent.change(
      screen.getByLabelText("resetPassword.newPassword"),
      { target: { value: "Password123!" } }
    );

    fireEvent.change(
      screen.getByLabelText("resetPassword.confirmPassword"),
      { target: { value: "Password123!" } }
    );

    fireEvent.click(
      screen.getByText("resetPassword.resetButton")
    );

    // No hay efecto visible mocked aquí,
    // este test valida que el submit no rompe el render
    await waitFor(() => {
      expect(
        screen.getByText("resetPassword.resetButton")
      ).toBeInTheDocument();
    });
  });
});
