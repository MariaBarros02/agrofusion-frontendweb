"use client";
import { useEffect, useState } from "react";
import AppLayoutSB from "../components/layout/AppLayoutSB";
import TitleTarget from "../components/layout/TitleTarget";
import ModuleInactive from "./ModuleInactive";
import { useModuleAccessStore } from "../store/moduleAccess.store";
import { getExternalProjects } from "../services/agrofusion/auth.service";
import type { ExternalProject } from "../dto/shared/external-project.dto";
import { useTranslation } from "react-i18next";
import { handleSSOLoginEP } from "../services/orchestrator/authOrchestrator.service";
import { GiBigGear } from "react-icons/gi";
import { Button } from "flowbite-react";
import { HiOutlineArrowRight } from "react-icons/hi";
import ToastSimple, { type ToastData } from "../components/layout/ToastSimple";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { iconMapper } from "../utils/iconMapper";
import { FiLink, FiTool } from "react-icons/fi";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ExternalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Lista de notificaciones activas en pantalla */
  const [toast, setToast] = useState<ToastData[]>([]);

  useEffect(() => {
    /**
     * Obtiene los proyectos externos activos.
     */
    const getProjects = async () => {
      try {
        setLoading(true);
        const data = await getExternalProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar proyectos");
      } finally {
        setLoading(false);
      }
    };

    getProjects();
  }, []);

  /**
   * Orquestador de Single Sign-On (SSO).
   * Gestiona la obtención del token y la redirección a proyectos externos.
   * @param {string} project - Identificador del proyecto destino ('DISRIEGO' | 'SIGMA').
   */
  const ssoLogin = async (project: ExternalProject) => {
    const result = await handleSSOLoginEP(project.instance_code);

    // CASO ÉXITO: Redirección externa con token de intercambio
    if ("sso_token" in result && result.sso_token) {
      setSSOLogged(project.instance_code);
      window.open(
        `${project.client_name}sso?token=${result.sso_token}`,
        "_blank",
      );
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

  const goToModule = async (project: ExternalProject, moduleUrl: string) => {
    if (!isSSOLogged(project.instance_code)) {
      // No asumime sesión  dispara SSO primero
      await ssoLogin(project);

      setTimeout(() => {
        window.location.href = moduleUrl;
      }, 1500);
    } else {
      // asume sesión
      window.location.href = moduleUrl;
    }
  };

  const setSSOLogged = (project: string) => {
    localStorage.setItem(
      `sso_logged_${project}`,
      JSON.stringify({
        logged: true,
        at: Date.now(),
      }),
    );
  };

  const isSSOLogged = (project: string, ttlMs = 8 * 60 * 60 * 1000) => {
    const raw = localStorage.getItem(`sso_logged_${project}`);
    if (!raw) return false;

    try {
      const data = JSON.parse(raw);
      return Date.now() - data.at < ttlMs;
    } catch {
      return false;
    }
  };

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  if (!canAccessModule("DASHBOARD")) {
    return (
      <AppLayoutSB>
        <TitleTarget title="dashboard.title" description="dashboard.description" />
        <ModuleInactive />
      </AppLayoutSB>
    );
  }

  return (
    <AppLayoutSB>
      <div className="flex flex-col h-full">
        <TitleTarget
          title="dashboard.title"
          description="dashboard.description"
        />
        {loading && (
          <div className="flex items-center justify-center p-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
            {" "}
            <p className="text-3xl font-bold">{t("dashboard.loading")}</p>{" "}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
            {" "}
            <p className="text-3xl font-bold">{t("dashboard.loading")}</p>{" "}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3 max-h-[calc(100vh-135px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {t("dashboard.noProjects")}
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.external_project_id}
                  className="flex items-center gap-3 p-5 bg-white border shadow-sm dark:border-gray-600 rounded-2xl dark:bg-gray-700 "
                >
                  <div className="flex-shrink-0 w-48 h-64 overflow-hidden md:w-60 rounded-2xl">
                    <img
                      src={`${import.meta.env.VITE_API_AUTH_AF_URL}${project.project_image_url}`}
                      alt={project.project_name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="flex mb-1 items-center justify-center w-8 h-8 bg-[#E1E8F5]  rounded-xl">
                      <GiBigGear size={25} className="dark:text-gray-800" />
                    </p>
                    <p className="text-lg font-bold md:w-2/3 md:text-xl ">
                      {project.project_name} - {project.instance_code}
                    </p>
                    <p className="my-1 text-xs text-gray-700 md:text-sm dark:text-gray-300">
                      {project.description}
                    </p>

                    <Button
                      className="my-3 text-left"
                      size="md"
                      color="blue"
                      onClick={() => ssoLogin(project)}
                    >
                      {" "}
                      <HiOutlineArrowRight size={24} className="mr-1" />
                      {t("common.goTo")} <br /> {project.instance_code}
                    </Button>

                    <div className="grid gap-2 md:grid-cols-3">
                      {project.systems.map((module) => {
                        const Icon = iconMapper[module.module_icon] ?? FiTool;
                        return (
                          <div
                            key={module.ext_id}
                            className="bg-[#E1E8F5] dark:bg-gray-800 dark:border-gray-600 rounded-xl p-2 border border-gray-300 flex md:justify-between items-center gap-2"
                          >
                            <Icon className="text-2xl md:text-3xl dark:text-gray-200" />
                            <div className="">
                              <p className="text-xs font-bold ">
                                {module.name}
                              </p>
                              <p className="hidden text-xs text-gray-800 md:block dark:text-gray-200">
                                {module.description}
                              </p>
                            </div>
                            <a
                              className="flex items-center ml-auto font-bold hover:cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                goToModule(
                                  project,
                                  project.client_name + module.base_url,
                                );
                              }}
                            >
                              <p>{t("common.go")}</p>
                              <MdOutlineKeyboardArrowRight />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                    <Link
                      className="flex items-center gap-1 mt-1 text-xs font-semibold text-gray-700 hover:underline"
                      to="/dashboard"
                    >
                      <FiLink />
                      {t("dashboard.integrate")}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
      </div>
    </AppLayoutSB>
  );
};

export default Dashboard;
