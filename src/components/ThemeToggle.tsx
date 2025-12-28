import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
/**
 * Botón para alternar el tema de la aplicación entre modo claro y oscuro.
 *
 * Este componente:
 * - Consume el contexto de tema mediante el hook `useTheme`
 * - Cambia el tema global al hacer click
 * - Actualiza la UI usando clases `dark:` de Tailwind CSS
 *
 * @example
 * <ThemeToggle />
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 text-gray-900 transition bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100"
    >
      {theme === "light" ? `🌙 ${t("theme.dark")}` : `☀️ ${t("theme.light")}`}
    </button>
  );
}

