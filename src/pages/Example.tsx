import React, { useState } from "react";
import { Button, Card } from "flowbite-react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import ThemeToggle from "../components/ThemeToggle";

/**
 * Props del componente Example.
 *
 * @property initial - Valor inicial del contador (opcional)
 */
export interface ExampleProps {
    /** Valor inicial del contador */
  initial?: number;
}

/**
 * Componente de ejemplo que demuestra:
 * - Uso de estado local con React
 * - Internacionalización con react-i18next
 * - Cambio dinámico de idioma
 * - Integración con Flowbite y Tailwind CSS
 * - Uso del toggle de tema (claro / oscuro)
 *
 */
const Example: React.FC<ExampleProps> = ({ initial = 0 }) => {
  // Estado local para el contador
  const [count, setCount] = useState<number>(initial);

  // Hook de traducción
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-green-100">
      {/* Botones para cambiar el idioma manualmente */}
      <button onClick={() => i18n.changeLanguage("es")}>ES</button>
      <button onClick={() => i18n.changeLanguage("en")}>EN</button>

      {/* Texto traducido */}
      <h2 className="text-2xl font-bold">
        {t("example.welcome")}
      </h2>

      {/* Mostrar valor actual del contador */}
      <p className="text-lg">{t("example.currentValue")}: {count}</p>

      {/* Controles del contador */}
      <div className="flex gap-2">
        <button
          className="px-4 py-2 text-white bg-green-600 rounded"
          onClick={() => setCount(count + 1)}
        >
          {t("example.increase")}
        </button>

        <button
          className="px-4 py-2 text-white bg-red-500 rounded"
          onClick={() => setCount(count - 1)}
        >
          {t("example.decrease")}
        </button>
      </div>

      {/* Botón de Flowbite */}
      <Button color="dark">{t("example.save")}</Button>

      {/* Card de ejemplo con soporte para modo oscuro */}
      <Card className="mt-6 bg-white dark:bg-gray-800">
        <h5 className="text-xl font-bold text-gray-900 dark:text-white">
          Flowbite + Tailwind
        </h5>
        <p className="text-gray-700 dark:text-gray-300">
        {t("example.modeDescription")}✨
        </p>
      </Card>

      {/* Botón para alternar el tema */}
      <ThemeToggle />
    </div>
  );
};

export default Example;
