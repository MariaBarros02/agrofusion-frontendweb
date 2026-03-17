/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { Card, Label, TextInput, Button } from "flowbite-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { HiMail } from "react-icons/hi";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import * as yup from "yup";
import Header from "../components/layout/Header";
import { loginService } from "../services/agrofusion/auth.service";
import {
  isGlobalAuthError,
  isPasswordAuthError,
  type AuthErrorCode,
} from "../scope/auth/authError.scope";
import { MdInfoOutline } from "react-icons/md";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";
import MfaForm from "../components/forms/MfaForm";
import type { AlertState } from "../components/layout/AlertSimple";
import AlertSimple from "../components/layout/AlertSimple";
/**
 * Estructura de datos para el formulario de inicio de sesión.
 */
interface LoginValues {
  email: string;
  password: string;
}
/**
 * Esquema de validación dinámico.
 * Recibe la función 't' para localizar los mensajes de error.
 */
const LoginSchema = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: any) => string,
): yup.Schema<LoginValues> =>
  yup.object({
    email: yup
      .string()
      .email(t("validation.emailInvalid"))
      .required(t("validation.emailRequired")),
    password: yup.string().required(t("validation.passwordRequired")),
  });

/**
 * Componente de Página de Login.
 * Gestiona el acceso principal, visibilidad de contraseña y transiciones hacia MFA.
 */
const Login = () => {
  const loginStore = useAuthStore();
  const navigate = useNavigate();
  // Hook de traducción
  const { t } = useTranslation();
  const [alert, setAlert] = useState<AlertState>(null);
  const [tokens, setTokens] = useState<any>(null);

  //Estado para controlar si la contraseña es visible
  const [showPassword, setShowPassword] = useState(false);

  //Funcion para cambiar el estado de visibilidad
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determinar el tipo de input basado en el estado
  const inputType = showPassword ? "text" : "password";

  // Determinar el ícono del botón de toggle
  const ToggleIcon = showPassword ? FaEyeSlash : FaEye;

  // Determinar el ícono principal del input
  const InputIcon = FaLock;
  //Estado para errores de autenticacion
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  /**
   * Inicialización de Formik para la gestión del formulario.
   */
  const formik = useFormik<LoginValues>({
    initialValues: {
      email: "",
      password: "",
    },
    enableReinitialize: true,
    validationSchema: LoginSchema(t),
    onSubmit: async (values) => {
      try {
        setGlobalError(null);
        setPasswordError(null);
        const response = await loginService(values.email, values.password);
        // Flujo A: Requiere Segundo Factor
        if (response.mfa_required) {
          setStep("mfa");
          return;
        }
        setTokens(response);

        setAlert({
          message: "login.loginSuccess",
          type: "success",
          to: "/dashboard",
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log(error);
        const data = error?.response?.data;
        const code = data?.detail.code as AuthErrorCode;
        const meta = data?.detail.meta;

        setRetryAfter(null);

        if (code === "AUTH_USER_BLOCKED" && meta?.retry_after_seconds) {
          setRetryAfter(meta.retry_after_seconds);
        }

        handleAuthError(code ?? "AUTH_GENERIC");
      }
    },
  });

  /** Helper para renderizar errores de validación local (Yup) */
  const displayError = (name: keyof LoginValues) => {
    return formik.touched[name] && formik.errors[name] ? (
      <p className="mt-1 text-sm text-red-500 ">{formik.errors[name]}</p>
    ) : null;
  };

  /**
   * Clasifica el error recibido del backend para mostrarlo en el lugar correcto (Global o Password).
   */
  const handleAuthError = (errorCode: AuthErrorCode) => {
    setGlobalError(null);
    setPasswordError(null);

    if (isGlobalAuthError(errorCode)) {
      setGlobalError(errorCode);
      return;
    }

    if (isPasswordAuthError(errorCode)) {
      setPasswordError(errorCode);
      return;
    }

    setGlobalError("AUTH_GENERIC");
  };

  const isButtonDisabled = formik.isSubmitting;

  const anioActual: number = new Date().getFullYear();
  const IconInfo = MdInfoOutline;

  type LoginStep = "login" | "mfa";

  const [step, setStep] = useState<LoginStep>("login");

  return (
    <div className="flex flex-col w-full min-h-screen px-3 bg-gray-100 sm:px-6 dark:bg-gray-900">
      {/* Barra superior */}
      <Header />

      {/* Centro */}
      <div className="flex flex-col items-center justify-center flex-1 w-full py-6">
        {/* Contenedor con Slider para transición Login <-> MFA */}

       <Card className="w-full max-w-md py-6 overflow-hidden bg-white shadow-lg rounded-2xl sm:max-w-lg dark:bg-slate-950">

          <div
            className={`flex w-[200%] transition-transform duration-300 ease-in-out touch-pan-y ${
              step === "mfa" ? "-translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* SECCIÓN 1: Formulario de Login */}
           <div className="w-1/2 px-5 sm:px-10 shrink-0">

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t("login.login")}
              </h2>
              {/* Alerta de Error Global */}
              {globalError && (
                <div className="flex items-center p-3 mt-2 text-sm font-bold text-blue-600 bg-blue-100 rounded-lg">
                  <IconInfo className="mr-2 text-2xl" />{" "}
                  {t(`errors.${globalError}`)}
                </div>
              )}
              <form
                className="flex flex-col w-full gap-3"
                onSubmit={formik.handleSubmit}
              >
                <div>
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
                  {displayError("email")}
                  <p className="text-sm text-black dark:text-white">
                    {t("login.emailHelper")}
                  </p>
                </div>
                <div>
                  <div className="block mb-2">
                    <Label htmlFor="password">{t("login.password")}</Label>
                  </div>

                  {/* Contenedor para el Input y el Botón de Toggle */}
                  <div className="relative">
                    <TextInput
                      id="password"
                      type={inputType}
                      icon={InputIcon}
                      placeholder="••••••••"
                      required
                      {...formik.getFieldProps("password")}
                      color={
                        passwordError ||
                        (formik.touched.password && formik.errors.password)
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
                  </div>
                  {displayError("password")}
                </div>
                {passwordError && (
                  <p className="px-4 py-3 mt-2 text-sm font-semibold text-center text-red-600 bg-red-200 rounded-lg">

                    {t(`errors.${passwordError}`, {
                      minutes: retryAfter
                        ? Math.ceil(retryAfter / 60)
                        : undefined,
                    })}
                  </p>
                )}

                <div className="*:pt-1 flex flex-col">
                  <Link
                    className="text-sm font-semibold text-stone-900 dark:text-white "
                    to="/request-reset-password"
                  >
                    {t("login.forgottenPassword")}{" "}
                    <span className="font-medium text-blue-600 hover:underline">
                      {t("login.recuperateIt")}
                    </span>
                  </Link>
                </div>

                <Button
                  className="my-3 bg-blue-600"
                  type="submit"
                  disabled={isButtonDisabled}
                >
                  {formik.isSubmitting
                    ? t("login.sending")
                    : t("login.login")}{" "}
                </Button>
              </form>
              <p className="text-sm text-gray-900 dark:text-white">
                {t("login.tabulationOrder")}: {t("login.mail")} &rarr;{" "}
                {t("login.password")} &rarr; {t("login.sent")}
              </p>
            </div>

            {/* ===== MFA ===== */}
            {step === "mfa" && (
              <div className="w-1/2 px-5 shrink-0">
                <MfaForm
                  email={formik.values.email}
                  password={formik.values.password}
                  onBack={() => setStep("login")}
                  onSuccess={(tokens) => {
                    setTokens(tokens);

                    setAlert({
                      message: "login.loginSuccess",
                      type: "success",
                    });
                  }}
                />
              </div>
            )}
          </div>
        </Card>

       <p className="mt-4 text-xs text-center text-gray-700 dark:text-gray-500">

          &copy; {anioActual} AgroFusion. {t("common.rightsReserved")}
        </p>
        {alert && (
          <AlertSimple
            message={t(alert.message)}
            type={alert.type}
            onClose={() => {
              loginStore.login(
                tokens.access_token ?? "",
                tokens.refresh_token ?? "",
                formik.values.email,
              );

              navigate("/dashboard");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
