// Configuración central de internacionalización (i18n)

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Archivos de traducción por idioma
import es from "./locales/es.json";
import en from "./locales/en.json";

/**
 * Inicializa la configuración de i18next para la aplicación.
 *
 * Características:
 * - Detección automática del idioma del navegador
 * - Soporte para React mediante `react-i18next`
 * - Idioma de respaldo en español
 * - Interpolación segura para React
 */
i18n
  // Detecta el idioma del usuario (navigator, localStorage, etc.)
  .use(LanguageDetector)

  // Conecta i18next con React
  .use(initReactI18next)

  // Inicialización principal
  .init({
    // Recursos de traducción disponibles
    resources: {
      es: { translation: es },
      en: { translation: en },
    },

    // Idioma por defecto si no se detecta ninguno válido
    fallbackLng: "es",

    // Configuración de interpolación
    interpolation: {
      // React ya escapa valores por defecto
      escapeValue: false,
    },
  });

export default i18n;
