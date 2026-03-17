import { Card } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { FaCheck, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/** Tipos de alerta permitidos */
type AlertType = "success" | "error" | "warning";

interface AlertSimpleProps {
  /** Mensaje literal a mostrar */
  message: string;
  /** Estilo visual de la alerta */
  type?: AlertType;
  /** Ruta opcional hacia donde navegar al aceptar */
  to?: string;
  /** Callback para cerrar el modal manualmente */
  onClose?: () => void;
}

/** Configuración de estilos e íconos por tipo de alerta */
export type AlertState = {
  message: string;
  type: "success" | "error" | "warning";
  to?: string;
} | null;


const alertStyles = {
  success: {
    bg: "bg-green-600",
    icon: <FaCheck className="text-white" />,
  },
  error: {
    bg: "bg-red-600",
    icon: <FaTimes className="text-white" />,
  },
  warning: {
    bg: "bg-yellow-500",
    icon: <FaExclamationTriangle className="text-white" />,
  },
};
/**
 * Modal de alerta simplificado.
 * Bloquea la interfaz (z-50) y requiere una acción del usuario.
 */
const AlertSimple = ({ message, type = "success", to, onClose }: AlertSimpleProps) => {
  const style = alertStyles[type];
  const { t } = useTranslation();
  const navigate = useNavigate();
  

  /**
   * Maneja el clic en el botón de aceptar.
   * Si existe 'to', redirige; de lo contrario, intenta cerrar el componente.
   */
  const handleAccept = () => {
    if (to) {
      navigate(to); 
      
    } else {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700/50">
      <Card className="w-[90%] max-w-md md:max-w-lg  p-1 ">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl ${style.bg}`}
          >
            {style.icon}
          </div>

          <p className="w-10/12 font-semibold text-gray-800 dark:text-white">
            {message}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAccept}
            className={`w-3/12 font-medium text-sm p-2 rounded-xl text-white ${style.bg} `}
          >
            {t("common.accept")}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AlertSimple;
