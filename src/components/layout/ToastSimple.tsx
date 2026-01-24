import { Toast, ToastToggle } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";
import { useTranslation } from "react-i18next";

type ToastType = "success" | "error" | "warning";

export type ToastData = {
  id: string;
  messageKey: string;
  messageParams?: Record<string, string>;
  type: ToastType;
  to?: string;
  linkText?: string;
};


/** Propiedades para el componente de Toast */
interface ToastSimpleProps {
  /** Clave de traducción para el cuerpo del mensaje */
  messageKey: string;
  /** Parámetros dinámicos para la traducción (opcional) */
  messageParams?: Record<string, string>;
  /** Tipo visual: success (verde), error (rojo), warning (naranja) */
  type?: ToastType;
  /** Ruta para un link opcional dentro del toast */
  to?: string;
  /** Clave de traducción para el texto del link */
  linkText?: string;
  /** Función para disparar al cerrar el toast */
  onClose?: () => void;
}



export type ToastState = {
  message: string;
  type: ToastType;
  to?: string;
  linkText?: string;
} | null;

const toastStyles = {
  success: {
    bg: "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200",
    icon: <HiCheck className="w-5 h-5" />,
  },
  error: {
    bg: "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200",
    icon: <HiX className="w-5 h-5" />,
  },
  warning: {
    bg: "bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200",
    icon: <HiExclamation className="w-5 h-5" />,
  },
};


/**
 * Notificación tipo Toast.
 * Ideal para feedback rápido que no interrumpe el flujo del usuario.
 * Soporta internacionalización profunda y enlaces externos/internos.
 */
const ToastSimple = ({
  messageKey,
  messageParams,
  type = "success",
  to,
  linkText,
  onClose,
}: ToastSimpleProps) => {
  const style = toastStyles[type];
  const {t} = useTranslation();
  return (
    <Toast>
      <div
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${style.bg}`}
      >
        {style.icon}
      </div>

      <div className="ml-3 text-sm font-normal">
        <p>
          {/* Renderiza el mensaje traducido */}
          {t(messageKey, messageParams)}
          {/* Renderiza link opcional (ej: para ver un registro creado) */}
          {to && linkText && (
            <>
              {" "}
              <Link to={to} target="_blank" className="font-medium hover:underline">
                {t(linkText)}
              </Link>
            </>
          )}
        </p>
      </div>

      <ToastToggle onClick={onClose} />
    </Toast>
  );
};

export default ToastSimple;
