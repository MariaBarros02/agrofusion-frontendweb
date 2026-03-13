import { type ReactNode, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useModuleAccessStore } from "../store/moduleAccess.store";
import { useSubmoduleAccessStore } from "../store/submoduleAccess.store";
import AppLayoutSB from "../components/layout/AppLayoutSB";

/** Tiempo mínimo que se muestra la pantalla de carga (ms). */
const MIN_LOADING_MS = 700;

interface ModuleRouteGuardProps {
  moduleCode: string;
  children: ReactNode;
}

/**
 * Muestra loading hasta que estén cargados módulos y submódulos activos.
 * La transición termina solo cuando todo está listo y ha pasado el tiempo mínimo.
 * La lógica de "módulo inactivo" (mostrar mensaje en el componente central) la hace cada página.
 */
export function ModuleRouteGuard({ moduleCode: _moduleCode, children }: ModuleRouteGuardProps) {
  const { t } = useTranslation();
  const modulesLoaded = useModuleAccessStore((s) => s.loaded);
  const submodulesLoaded = useSubmoduleAccessStore((s) => s.loaded);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinTimeElapsed(true), MIN_LOADING_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const showContent = modulesLoaded && submodulesLoaded && minTimeElapsed;

  if (!showContent) {
    return (
      <AppLayoutSB>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-8">
          <div
            className="relative w-14 h-14 mb-5"
            aria-hidden
          >
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-600" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin"
              style={{ animationDuration: "0.9s" }}
            />
            <div
              className="absolute inset-1 rounded-full border-2 border-transparent border-t-blue-500 dark:border-t-blue-300 animate-spin"
              style={{ animationDuration: "1.2s", animationDirection: "reverse" }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium tracking-wide">
            {t("common.loading")}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            {t("moduleRouteGuard.preparing", "Preparando contenido...")}
          </p>
        </div>
      </AppLayoutSB>
    );
  }

  return <>{children}</>;
}
