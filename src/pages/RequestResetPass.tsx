import  { useState } from "react";
import ToastSimple from "../components/layout/ToastSimple";
import Header from "../components/layout/Header";
import { Label, TextInput, Card, Button } from "flowbite-react";
import { HiMail } from "react-icons/hi";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  isGlobalAuthError,
  type AuthErrorCode,
} from "../scope/auth/authError.scope";
import { useTranslation } from "react-i18next";
import {
  getExternalProjects,
  reqResetPasswordService,
} from "../services/agrofusion/auth.service";
import { Link } from "react-router-dom";
import { type ToastData } from "../components/layout/ToastSimple";
import { projectsLinks } from "../services/auth/authOrchestrator.service";
import { handleReqResPasswordEP } from "../services/auth/authOrchestrator.service";

/**
 * Componente de Recuperación de Contraseña.
 * * Funcionalidades clave:
 * 1. Validación de formato de email con Formik/Yup.
 * 2. Orquestación de reseteo en múltiples microservicios/proyectos externos.
 * 3. Manejo de feedback mediante Toasts para errores en proyectos satélite.
 * 4. Interfaz de dos pasos: Solicitud ('request') y Confirmación de envío ('email-sent').
 */
const ReqResetPass = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { t } = useTranslation();
  const [globalError, setGlobalError] = useState<string | null>(null);
  /** Define el paso actual del flujo de recuperación */
  type resetStep = "request" | "email-sent";
  const [step, setStep] = useState<resetStep>("request");
  /**
   * Configuración de Formik para el formulario de recuperación.
   */
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("validation.emailInvalid")
        .required("validation.emailRequired"),
    }),
    onSubmit: async (values) => {
      try {
        setGlobalError(null);

        // 1. Obtener los proyectos vinculados al usuario
        const externalProjects = await getExternalProjects();

        // 2. Orquestar la solicitud en proyectos externos (SSO)
        // Retorna tokens de éxito y una lista de errores por proyecto
        const { tokens, errors } = await handleReqResPasswordEP(
          values.email,
          externalProjects,
        );
        // 3. Si hubo errores en proyectos externos, se notifican individualmente
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
        // 4. Ejecutar el servicio principal de AgroFusion
        await reqResetPasswordService(values.email, tokens);
        // 5. Cambiar a la vista de "Correo enviado"
        setStep("email-sent");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const data = error?.response?.data;
        const code = data?.detail.code as AuthErrorCode;

        handleAuthError(code ?? "AUTH_GENERIC");
      }
    },
  });
  /**
   * Centraliza la lógica de errores de autenticación para la UI.
   */
  const handleAuthError = (errorCode: AuthErrorCode) => {
    setGlobalError(null);

    if (isGlobalAuthError(errorCode)) {
      setGlobalError(errorCode);
      return;
    }

    setGlobalError("AUTH_GENERIC");
  };
  return (
    <>
      <div className="flex flex-col w-full h-screen p-2 bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center m-auto">
          <Card className="w-full bg-white rounded-xl sm:max-w-lg dark:bg-slate-950">
            {step === "request" ? (
              <div>
                <h1 className="text-2xl font-semibold dark:text-white">
                  {t("reqResetPassword.requestReset")}
                </h1>
                <p className="my-3 text-sm text-stone-700 dark:text-gray-400">
                  {t("reqResetPassword.instructions")}
                </p>
                {globalError && (
                  <p className="p-6 py-4 mt-1 text-sm font-bold text-center text-red-600 bg-red-200 mx-7 rounded-xl">
                    {t(`errors.${globalError}`)}
                  </p>
                )}

                <div>
                  <form onSubmit={formik.handleSubmit}>
                    <div className="block mb-2">
                      <Label htmlFor="email">{t("login.email")}</Label>
                    </div>

                    <TextInput
                      id="email"
                      type="email"
                      icon={HiMail}
                      placeholder={t("login.emailPlaceholder")}
                      required
                      {...formik.getFieldProps("email")}
                      color={
                        globalError ||
                        (formik.touched.email && formik.errors.email)
                          ? "failure"
                          : "default"
                      }
                    />

                    <Button
                      className="block w-full my-3 bg-blue-600 rounded-2xl"
                      type="submit"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting
                        ? t("reqResetPassword.sending")
                        : t("reqResetPassword.sendResetLink")}{" "}
                    </Button>
                  </form>

                  <Link
                    className="block my-3 text-sm font-semibold text-center text-stone-900 dark:text-white"
                    to="/login"
                  >
                    {t("reqResetPassword.rememberPassword")}{" "}
                    <span className="font-medium text-blue-600 hover:underline">
                      {t("reqResetPassword.backToLogin")}
                    </span>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-semibold dark:text-white">
                  {t("reqResetPassword.sentEmail")}
                </h1>
                <p className="my-3 text-sm text-stone-700 dark:text-gray-400">
                  {t("reqResetPassword.sentEmailInstruction")}
                </p>
                <Button
                  className="block w-full my-3 bg-blue-600"
                  type="submit"
                  disabled={formik.isSubmitting}
                  onClick={() => formik.handleSubmit()}
                >
                  {formik.isSubmitting
                    ? t("reqResetPassword.sendingAgain")
                    : t("reqResetPassword.sendAgain")}
                </Button>
              </div>
            )}
          </Card>
        </div>
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

export default ReqResetPass;
