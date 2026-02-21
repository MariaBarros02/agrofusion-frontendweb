/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loginService, verifyMfaService } from "../../services/agrofusion/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router-dom";
import {
  isOtpAuthError,
  type AuthErrorCode,
  type OptAuthError,
} from "../../scope/auth/authError.scope";

/**
 * Propiedades del componente MfaForm.
 */
interface Props {
  /** Correo del usuario para reenvío de códigos y visualización */
  email: string;
  /** Contraseña temporal necesaria para re-autenticar en caso de reenvío */
  password: string;
  /** Función para regresar al paso anterior (Login) */
  onBack: () => void;
}
/** Tiempo de vida del código OTP (5 minutos) */
const OTP_TTL_SECONDS = 5 * 60; 

/**
 * Componente de formulario para la Verificación de Doble Factor (MFA).
 * Maneja la entrada de código de 6 dígitos, temporizador de expiración y reenvío.
 */
export default function MfaForm({ email, password, onBack }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginStore = useAuthStore();
// --- ESTADO ---
  /** Arreglo de 6 strings para manejar cada caja del input individualmente */
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  /** Segundos restantes para que expire el código actual */
  const [secondsLeft, setSecondsLeft] = useState<number>(OTP_TTL_SECONDS);
  /** Error específico de OTP (si existe) */
  const [otpError, setOtpError] = useState<OptAuthError | null>(null);
  /** Estado de bloqueo por demasiados intentos fallidos */
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false); 
  const isExpired = secondsLeft <= 0;

  /**
   * ⏱️ Countdown: Maneja la cuenta regresiva del OTP.
   */
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  /**
   * Gestiona el cambio en los inputs del código.
   * Valida que sea numérico y mueve el foco automáticamente al siguiente input.
   */
  const handleChange = (index: number, value: string) => {
    

    const next = [...code];
    next[index] = value;
    setCode(next);

    const nextInput = document.getElementById(`otp-${index + 1}`);
    if (value && nextInput) nextInput.focus();
  };

  /**
   * Solicita un nuevo código OTP reutilizando las credenciales de login.
   */
  const handleResendCode = async () => {
    try {
      setLoading(true);
      await loginService(email, password);
      setOtpError(null);
      setIsBlocked(false);
      setCode(Array(6).fill(""));
      setSecondsLeft(OTP_TTL_SECONDS);
    } catch (error) {
      console.error("Error resending MFA code:", error);
    }finally{
      setLoading(false)
    }
  };

  
  /**
   * Envía el código completo al servidor para validar la sesión.
   */ 
  const handleVerifyCode = async () => {
    const enteredCode = code.join("");
    setOtpError(null);
    try {
      
      const response = await verifyMfaService(email, enteredCode);
      loginStore.login(
        response.access_token ?? "",
        response.refresh_token ?? "",
        email
      );
      navigate("/");
    } catch (error: any) {
      const data = error?.response?.data;
      const code = data?.detail.code as AuthErrorCode;
      if (isOtpAuthError(code)) {
        setOtpError(code);

        if (code === "AUTH_OTP_BLOCKED") {
          setIsBlocked(true);
        }
        return;
      }

      setOtpError("AUTH_INVALID_OTP");
      console.error("Error verifying MFA code:", error);
    }
  };
  /**
   * Convierte segundos a formato MM:SS.
   */
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };


  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
        {t("login.mfaAuth")}
      </h2>

      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        {t("login.mfaAuthHelper")} <br />
        <span className="font-medium">{email}</span>
      </p>

      {/* OTP boxes */}
      <div className="flex gap-2">
        {code.map((value, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            maxLength={1}
            disabled={isExpired || isBlocked}
            value={value}
            onChange={(e) => handleChange(i, e.target.value)}
            className={`w-12 h-12 text-xl text-center border rounded-lg
              ${
                isExpired || isBlocked
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white"
              }
            `}
          />
        ))}
      </div>

      <p
        className={`text-sm font-medium ${
          isExpired ? "text-red-600" : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {isExpired ? (
          <>
            {t("login.codeExpired")}{" "}
            <button
              type="button"
              onClick={handleResendCode}
              className="text-blue-600 hover:underline"
            >
              {t("login.resendCode")}.
            </button>
          </>
        ) : (
          <>
            {t("login.timeoutWarning")} {formatTime(secondsLeft)}
          </>
        )}
      </p>

      {otpError && (
        <div className="w-full p-3 text-sm font-medium text-center text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {t(`errors.${otpError}`)}
        </div>
      )}

      {/* Verify button */}
      <Button
        onClick={handleVerifyCode}
        className="w-full bg-blue-600"
        disabled={isExpired || isBlocked || loading}
      >
        {t("login.verify")}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        {t("login.comeback")}
      </button>
    </div>
  );
}
