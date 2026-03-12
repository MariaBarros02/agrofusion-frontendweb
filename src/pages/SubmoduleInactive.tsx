import { useTranslation } from "react-i18next";
import { Card } from "flowbite-react";
import { HiOutlineExclamation } from "react-icons/hi";
import { Link } from "react-router-dom";

/**
 * Mensaje mostrado en el área central cuando el usuario no tiene acceso
 * porque el submódulo está inactivo. No oculta el navbar.
 */
export default function SubmoduleInactive() {
  const { t } = useTranslation();

  return (
    <Card className="max-w-xl mx-auto mt-6">
      <div className="flex flex-col items-center text-center gap-3">
        <HiOutlineExclamation className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          {t("submoduleInactive.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("submoduleInactive.message")}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("nav.dashboard", "Ir al inicio")}
        </Link>
      </div>
    </Card>
  );
}
