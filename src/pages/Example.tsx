import React, { useState } from "react";
import { Button, Card } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { logoutService } from "../services/agrofusion/auth.service";
import { handleSSOLoginEP } from "../services/orchestrator/authOrchestrator.service";
import i18n from "i18next";
import ThemeToggle from "../components/ThemeToggle";
import type { ToastData } from "../components/layout/ToastSimple";
import ToastSimple from "../components/layout/ToastSimple";
import { useAuthStore } from "../store/auth.store";
/**
 * Props del componente Example.
 */
export interface ExampleProps {
/** Valor inicial del contador (por defecto 0) */
  initial?: number;
}

/**
 * Componente de demostración técnica.
 * * Este componente sirve como sandbox para probar:
 * 1. Autenticación (Logout) y Persistencia (Zustand).
 * 2. Flujo de SSO hacia proyectos externos (Disriego/Sigma).
 * 3. Sistema de notificaciones flotantes (Toasts).
 * 4. Reactividad de temas y multi-idioma.
 */
const Example: React.FC<ExampleProps> = ({ initial = 0 }) => {
  // Estado local para el contador
  const [count, setCount] = useState<number>(initial);
  /** Lista de notificaciones activas en pantalla */
  const [toast, setToast] = useState<ToastData[]>([]);
  const authStore = useAuthStore();
  // Hook de traducción
  const { t } = useTranslation();

  /**
   * Cierra la sesión del usuario.
   * Intenta invalidar el token en el backend y limpia el estado local
   * independientemente del resultado de la red.
   */
  const logout = async () => {

    try {
      if (authStore.accessToken) {
        await logoutService();
      }
    } catch (error) {
      console.error("Logout backend failed", error);
    } finally {
      authStore.logout();

      localStorage.removeItem("auth-storage");

      //window.location.href = "/login";
    }
  };

  /**
   * Orquestador de Single Sign-On (SSO).
   * Gestiona la obtención del token y la redirección a proyectos externos.
   * @param {string} project - Identificador del proyecto destino ('DISRIEGO' | 'SIGMA').
   */
  const ssoLogin = async (project: string) => {
    const result = await handleSSOLoginEP(project);

    // CASO ÉXITO: Redirección externa con token de intercambio
    if ("sso_token" in result && result.sso_token) {
      window.location.href = `https://www.inmero.co/${project.toLowerCase()}/sso?token=${result.sso_token}`;
      return;
    }
    // CASO ERROR: Mapeo de errores del orquestador a la cola de Toasts
    if ("errors" in result) {
      setToast((prev) => [
        ...prev,
        ...result.errors.map((e) => ({
          id: crypto.randomUUID(),
          messageKey: e.messageKey,
          messageParams: e.messageParams,
          type: e.type ?? "error",
          to: e.to,
          linkText: e.linkText,
        })),
      ]);
    }
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-green-100">
        {/* Botones para cambiar el idioma manualmente */}
        <button onClick={() => i18n.changeLanguage("es")}>ES</button>
        <button onClick={() => i18n.changeLanguage("en")}>EN</button>

        {/* Texto traducido */}
        <h2 className="text-2xl font-bold">{t("example.welcome")}</h2>

        {/* Mostrar valor actual del contador */}
        <p className="text-lg">
          {t("example.currentValue")}: {count}
        </p>

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

        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-white bg-green-600 rounded"
            onClick={() => ssoLogin("DISRIEGO")}
          >
            {t("common.goToDisriego")}
          </button>

          <button
            className="px-4 py-2 text-white bg-red-500 rounded"
            onClick={() => ssoLogin("SIGMA")}
          >
            {t("common.goToSigma")}
          </button>
        </div>
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

        <button
          className="px-4 py-2 text-white bg-red-600 rounded"
          onClick={() => logout()}
        >
          {t("common.logout")}
        </button>
      </div>
      <div className="fixed z-50 flex flex-col gap-2 top-4 right-4">
        {toast.map((t) => (
          <ToastSimple
            key={t.id}
            messageKey={t.messageKey}
            messageParams={t.messageParams}
            type={t.type}
            to={t.to}
            linkText={t.linkText}
            onClose={() =>
              setToast((prev) => prev.filter((toast) => toast.id !== t.id))
            }
          />
        ))}
      </div>
    </>
  );
};

export default Example;
