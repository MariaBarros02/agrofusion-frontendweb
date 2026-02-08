/* eslint-disable no-useless-escape */
import  { useState } from "react";
import ToastSimple from "../components/layout/ToastSimple";
import { type ToastData } from "../components/layout/ToastSimple";
import { projectsLinks } from "../services/orchestrator/authOrchestrator.service";
import Header from "../components/layout/Header";
import { Label, TextInput, Card, Button } from "flowbite-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getExternalProjects,
  resetPasswordService,
} from "../services/agrofusion/auth.service";
import { type AuthErrorCode } from "../scope/auth/authError.scope";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import type { AlertState } from "../components/layout/AlertSimple";
import AlertSimple from "../components/layout/AlertSimple";
import { handleResPasswordEP } from "../services/orchestrator/authOrchestrator.service";

/**
 * Componente para el establecimiento de una nueva contraseña.
 * * Este componente procesa tokens de reseteo de AgroFusion y proyectos satélites
 * (Disriego/Sigma) extraídos de la URL para actualizar las credenciales en cascada.
 */
const ResetPassword = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [alert, setAlert] = useState<AlertState>(null);
  const { t } = useTranslation();

  // --- HELPERS DE URL ---
  /** Extrae el token principal de AgroFusion */
  const getTokenFromUrl = () => new URLSearchParams(window.location.search).get("token") || "";
  /** Extrae el token específico para la instancia Disriego */
  const gettDisriegoFromUrl = () => new URLSearchParams(window.location.search).get("tDisriego") || "";
  /** Extrae el token específico para la instancia Sigma */
  const gettSigmaFromUrl = () => new URLSearchParams(window.location.search).get("tSigma") || "";
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPas, setShowConfirmPas] = useState(false);
  //Funcion para cambiar el estado de visibilidad
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasVis = () => {
    setShowConfirmPas(!showConfirmPas);
  };
  const inputType = showPassword ? "text" : "password";
  const InputIcon = FaLock;
  const ToggleIcon = showPassword ? FiEyeOff : FiEye;

  /**
   * Gestión del formulario con Formik y esquema de validación Yup.
   * La contraseña debe cumplir con políticas de complejidad:
   * - Mínimo 10 caracteres.
   * - Al menos una mayúscula, una minúscula, un número y un carácter especial.
   */
  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .required("validation.passwordRequired")
        .min(10, "validation.passwordMinLength")
        .max(128, "validation.passwordMaxLength")
        .matches(/[a-z]/, "validation.passwordLowercase")
        .matches(/\d/, "validation.passwordNumber")
        .matches(/[A-Z]/, "validation.passwordUppercase")
        .matches(
          /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/,
          "validation.passwordSpecialChar",
        ),
      confirmPassword: Yup.string()
        .required("validation.confirmPasswordRequired")
        .oneOf([Yup.ref("newPassword")], "validation.passwordsMustMatch"),
    }),
    onSubmit: async (values) => {
      try {
        setGlobalError(null);
        // 1. Actualizar contraseña en el servicio central de AgroFusion
        await resetPasswordService(
          getTokenFromUrl(),
          values.newPassword,
          values.confirmPassword,
        );

        // 2. Identificar proyectos externos vinculados
        const externalProjects = await getExternalProjects();

        // 3. Orquestar la actualización en proyectos externos
        const { errors } = await handleResPasswordEP(
          gettDisriegoFromUrl(),
          gettSigmaFromUrl(),
          values.newPassword,
          values.confirmPassword,
          externalProjects,
        );

        // 4. Notificar éxito al usuario
        setAlert({
          type: "success",
          message: t("resetPassword.successAlert"),
          to: "/login",
        });

        // 5. Si hubo errores en proyectos secundarios, mostrar notificaciones tipo Toast
        errors.forEach((err) => {
          const link = projectsLinks[err.project];

          setToasts((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              messageKey: err.messageKey,
              messageParams: err.messageParams,
              type: "error",
              ...(link ?? {}),
            },
          ]);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log("Error resetting password:", error.response.data);
        const data = error?.response?.data;
        const code = data?.detail.code as AuthErrorCode;
        if (code === "AUTH_INVALID_RESET_TOKEN") {
          setAlert({
            type: "error",
            message: t("errors.AUTH_INVALID_RESET_TOKEN"),
            to: "/request-reset-password",
          });
          return;
        }
        handleAuthError(code ?? "AUTH_GENERIC");
      }
    },
  });

  const handleAuthError = (errorCode: AuthErrorCode) => {
    setGlobalError(null);

    setGlobalError(errorCode);
  };


  return (
    <>
      <div className="flex flex-col w-full h-screen p-2 bg-gray-100 dark:bg-gray-900">
        <Header />
        {alert && (
          <AlertSimple
            type={alert.type}
            message={alert.message}
            to={alert.to}
            onClose={() => setAlert(null)}
          />
        )}
        <div className="flex items-center justify-center m-auto">
          <Card className="w-full bg-white rounded-xl sm:max-w-lg dark:bg-slate-950">
            <div>
              <h1 className="text-2xl font-semibold dark:text-white">
                {t("resetPassword.resetPassword")}
              </h1>
              <p className="my-3 text-sm text-stone-700 dark:text-gray-400">
                {t("resetPassword.instructions")}
              </p>

              <div>
                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-4">
                    <div className="block mb-2">
                      <Label htmlFor="newPassword">
                        {t("resetPassword.newPassword")}
                      </Label>
                    </div>

                    <div className="relative">
                      <TextInput
                        id="newPassword"
                        type={inputType}
                        icon={InputIcon}
                        placeholder="••••••••"
                        required
                        {...formik.getFieldProps("newPassword")}
                        color={
                          formik.touched.newPassword &&
                          formik.errors.newPassword
                            ? "failure"
                            : "default"
                        }
                      />

                      {/* Botón de Toggle (Ojo) */}
                      <Button
                        type="button"
                        onClick={togglePasswordVisibility}
                        color="gray"
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full p-0 text-gray-500 bg-transparent border-0 hover:bg-transparent focus:ring-0 dark:text-gray-400 dark:hover:bg-transparent dark:bg-transparent"
                      >
                        <ToggleIcon className="w-4 h-4" />
                      </Button>
                      {formik.touched.newPassword &&
                        formik.errors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {t(formik.errors.newPassword)}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="block mb-2">
                      <Label htmlFor="confirmPassword">
                        {t("resetPassword.confirmPassword")}
                      </Label>
                    </div>

                    <div className="relative">
                      <TextInput
                        id="confirmPassword"
                        type={inputType}
                        icon={InputIcon}
                        placeholder="••••••••"
                        required
                        {...formik.getFieldProps("confirmPassword")}
                        color={
                          formik.touched.confirmPassword &&
                          formik.errors.confirmPassword
                            ? "failure"
                            : "default"
                        }
                      />

                      {/* Botón de Toggle (Ojo) */}
                      <Button
                        type="button"
                        onClick={toggleConfirmPasVis}
                        color="gray"
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full p-0 text-gray-500 bg-transparent border-0 hover:bg-transparent focus:ring-0 dark:text-gray-400 dark:hover:bg-transparent dark:bg-transparent"
                      >
                        <ToggleIcon className="w-4 h-4" />
                      </Button>

                      {formik.touched.confirmPassword &&
                        formik.errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {t(formik.errors.confirmPassword)}
                          </p>
                        )}
                    </div>
                  </div>
                  {globalError && (
                    <p className="p-6 py-4 mt-1 text-sm font-bold text-center text-red-600 bg-red-200 mx-7 rounded-xl">
                      {t(`errors.${globalError}`)}
                    </p>
                  )}
                  <Button
                    className="block w-full my-3 bg-blue-600 rounded-2xl"
                    type="submit"
                    disabled={!formik.isValid || formik.isSubmitting}
                  >
                    {formik.isSubmitting
                      ? t("resetPassword.resetting")
                      : t("resetPassword.resetButton")}{" "}
                  </Button>
                </form>

                <Link
                  className="block my-3 text-sm text-center text-stone-900 dark:text-white"
                  to="/login"
                >
                  {t("reqResetPassword.rememberPassword")}{" "}
                  <span className="font-medium text-blue-600 hover:underline">
                    {t("reqResetPassword.backToLogin")}
                  </span>
                </Link>
              </div>
            </div>
          </Card>
        </div>
        {/* Notificaciones de errores en proyectos externos */}
        <div className="fixed z-50 flex flex-col gap-3 bottom-4 right-4">
          {toasts.map((toast) => (
            <ToastSimple
              key={toast.id}
              messageKey={toast.messageKey}
              messageParams={toast.messageParams}
              type={toast.type}
              to={toast.to}
              linkText={toast.linkText}
              onClose={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
