import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useModuleAccessStore } from "../store/moduleAccess.store";
import AppLayoutSB from "../components/layout/AppLayoutSB";

interface ModuleRouteGuardProps {
  moduleCode: string;
  children: ReactNode;
}

/**
 * Solo muestra loading hasta que se carguen los módulos activos.
 * La lógica de "módulo inactivo" (mostrar mensaje en el componente central) la hace cada página.
 */
export function ModuleRouteGuard({ moduleCode, children }: ModuleRouteGuardProps) {
  const { t } = useTranslation();
  const loaded = useModuleAccessStore((s) => s.loaded);

  if (!loaded) {
    return (
      <AppLayoutSB>
        <div className="flex items-center justify-center p-8 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
        </div>
      </AppLayoutSB>
    );
  }

  return <>{children}</>;
}
