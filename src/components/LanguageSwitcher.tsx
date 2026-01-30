import React from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";


/**
 * Selector de idioma tipo toggle.
 * Permite al usuario conmutar entre Español e Inglés utilizando i18next.
 */
const LanguageSwitcher: React.FC = () => {
  const { i18n: i18nInstance } = useTranslation();

  /** Obtiene el código del lenguaje actual (ej: 'es-ES' o 'en-US') */
  const currentLang = i18nInstance.language;

  /**
   * Cambia el idioma global de la aplicación.
   * @param {string} lang - Código del idioma ('es' | 'en').
   */
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex gap-2 p-1 bg-gray-200 rounded-lg dark:bg-gray-700">
      <button
        onClick={() => changeLanguage("es")}
        className={`flex items-center gap-2 px-2 py-1 rounded-md transition text-xs
          ${
            currentLang.startsWith("es")
              ? "bg-white dark:bg-gray-900 dark:text-white font-semibold"
              : "opacity-70 hover:opacity-100"
          }`}
      >
        ES
      </button>

      <button
        onClick={() => changeLanguage("en")}
        className={`flex items-center gap-2 px-2 py-1 rounded-md transition text-xs
          ${
            currentLang.startsWith("en")
              ? "bg-white dark:bg-gray-900 dark:text-white font-semibold"
              : "opacity-70 hover:opacity-100"
          }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
