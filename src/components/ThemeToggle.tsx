import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { BsSun, BsMoon } from "react-icons/bs";

/**
 * Componente de interfaz para alternar el tema (Modo Oscuro/Claro).
 * * Funcionalidad:
 * - Utiliza un Contexto Global (`useTheme`) para persistir la preferencia.
 * - Cambia dinámicamente el ícono basándose en el estado actual.
 * - Aplica clases de Tailwind para transiciones suaves y estados de enfoque (focus).
 *
 * @returns {JSX.Element} Un botón circular con un ícono que representa el estado del tema.
 */
export default function ThemeToggle() {
  /** @type {{ theme: 'light' | 'dark', toggleTheme: Function }} */
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  // Si el tema actual es 'light' (claro), mostramos la luna (para cambiar a oscuro).
  // Si el tema actual es 'dark' (oscuro), mostramos el sol (para cambiar a claro).
  const Icon = theme === "light" ? BsMoon : BsSun;
  
  /** * Color del ícono basado en el tema actual para asegurar contraste.
   */
  const iconColor = theme === "light" ? "text-gray-800" : "text-gray-100";

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 transition bg-gray-200 rounded-full dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
      aria-label={t("toggleTheme")} 
    >
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </button>
  );
}

