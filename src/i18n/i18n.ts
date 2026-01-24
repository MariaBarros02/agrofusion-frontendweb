/**
 * Configuración central de internacionalización (i18n) para AgroFusion.
 * Utiliza i18next para gestionar traducciones, detección de idioma y persistencia.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Archivos de traducción por idioma
import es from "./locales/es.json";
import en from "./locales/en.json";

/**
 * Inicialización y configuración de i18next.
 * * Flujo de ejecución:
 * 1. .use(LanguageDetector): Busca el idioma en localStorage ('i18nextLng'), 
 * cookies, o el lenguaje del sistema del navegador.
 * 2. .use(initReactI18next): Vincula la instancia a React (permitiendo el uso de hooks como useTranslation).
 * 3. .init({...}): Establece las reglas de negocio para el manejo de idiomas.
 */
i18n

  /** * Plugin para detectar automáticamente el idioma del usuario.
   * Orden de detección por defecto: querystring -> cookie -> localStorage -> navigator -> path -> htmlTag.
   */
  .use(LanguageDetector)

  /** * Pasa la instancia de i18n a react-i18next para que esté disponible en toda la app.
   */
  .use(initReactI18next)

  .init({
    /** * Recursos (traducciones) cargados en memoria.
     * Cada clave (es, en) contiene un objeto 'translation' con los textos.
     */
    resources: {
      es: { translation: es },
      en: { translation: en },
    },

/** * Idioma de respaldo si el detector no encuentra coincidencia o si falta una clave.
     * @default "es"
     */
    fallbackLng: "es",

    /** * Configuración de visualización y seguridad.
     */
    interpolation: {
      /** * React ya protege contra ataques XSS por defecto (escapado de caracteres), 
       * por lo que desactivamos el escapado adicional de i18next.
       */
      escapeValue: false,
    },
    /** * Evita problemas con lenguajes que tienen variantes (ej: 'es-MX' pasará a 'es').
     */
    load: 'languageOnly',

    /** * Permite debug en consola durante el desarrollo (opcional, útil para detectar claves faltantes).
     */
    debug: false,
  });

export default i18n;
