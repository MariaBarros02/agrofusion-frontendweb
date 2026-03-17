/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loginService, verifyMfaService } from "../../services/agrofusion/auth.service";

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
  
  onSuccess: (tokens: any) => void;
}
/** Tiempo de vida del código OTP (5 minutos) */
const OTP_TTL_SECONDS = 5 * 60; 

/**
 * Componente de formulario para la Verificación de Doble Factor (MFA).
 * Maneja la entrada de código de 6 dígitos, temporizador de expiración y reenvío.
 */
export default function MfaForm({ email, password, onBack, onSuccess }: Props) {
  const { t } = useTranslation();

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
    setLoading(true);
    setOtpError(null);
    try {
      
      const response = await verifyMfaService(email, enteredCode);
      onSuccess(response);

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
    }finally{
      setLoading(false);
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
    <div className="flex flex-col items-center w-full gap-5 sm:gap-6">
      <h2 className="text-xl font-bold text-center text-gray-800 sm:text-2xl dark:text-white">
        {t("login.mfaAuth")}
      </h2>

      <p className="text-xs text-center text-gray-600 sm:text-sm dark:text-gray-400 break-all">
        {t("login.mfaAuthHelper")} <br />
        <span className="font-medium">{email}</span>
      </p>

      {/* OTP boxes */}
      <div className="flex justify-center w-full gap-2 sm:gap-3">
        {code.map((value, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="tel"
            inputMode="numeric"

            maxLength={1}
            disabled={isExpired || isBlocked}
            value={value}
            onChange={(e) => handleChange(i, e.target.value)}
            className={`w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl text-center border rounded-lg
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
        className={`text-xs sm:text-sm font-medium text-center ${
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
        <div className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-center text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {t(`errors.${otpError}`)}
        </div>
      )}

      {/* Verify button */}
      <Button
        onClick={handleVerifyCode}
        className="w-full py-2 text-sm sm:text-base bg-blue-600"
        disabled={isExpired || isBlocked || loading}
      >
        {t("login.verify")}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="text-xs font-medium text-blue-600 sm:text-sm hover:underline"

      >
        {t("login.comeback")}
      </button>
    </div>
  );
}
