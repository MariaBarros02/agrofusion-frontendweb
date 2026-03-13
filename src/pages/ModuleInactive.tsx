import { useTranslation } from "react-i18next";
import { HiExclamation } from "react-icons/hi";

/**
 * Bloque de contenido mostrado en el área principal cuando el módulo está inactivo.
 * Se muestra dentro del layout (sidebar visible); solo el recuadro de contenido muestra este mensaje.
 */
export default function ModuleInactive() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
          <HiExclamation className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t("moduleInactive.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t("moduleInactive.message")}
        </p>
      </div>
    </div>
  );
}