import { useState, useEffect } from "react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { ListRolesResponse } from "../../dto/response/listRoles-response.dto";
import { Button, Badge } from "flowbite-react";
import { getDetailsRoleService } from "../../services/agrofusion/auth.service";
import { Pencil } from "lucide-react";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";


const actionColors: Record<string, string> = {
  CREATE: "success",
  READ: "info",
  UPDATE: "warning",
  DELETE: "failure",
};
const RoleView = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { roleId } = useParams<{ roleId: string }>();
  const [roleDetails, setRoleDetails] = useState<ListRolesResponse | null>(
    null,
  );
  const navigate = useNavigate();

  const getRoleDetails = async () => {
    try {
      setLoading(true);
      const response = await getDetailsRoleService(roleId || "");
      setRoleDetails(response);
    } catch (error) {
      console.log(error);
      setError("Error al cargar detalles de usuario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleId) {
      getRoleDetails();
    }
  }, [roleId]);

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore(
    (s) => s.canAccessSubmodule,
  );
  const showModuleInactive = !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive =
    canAccessModule("ADMINISTRATION") && !canAccessSubmodule("ROLES");
  const showContent =
    canAccessModule("ADMINISTRATION") && canAccessSubmodule("ROLES");
  const groupedPermissions = roleDetails?.permissions?.reduce(
    (acc, perm) => {
      const module = perm.module_code || "unknown";

      if (!acc[module]) {
        acc[module] = {
          module_name: perm.module_name || t("common.unknownModule"),
          permissions: [],
        };
      }

      acc[module].permissions.push(perm);
      return acc;
    },
    {} as Record<
      string,
      { module_name: string; permissions: typeof roleDetails.permissions }
    >,
  );
  return (
    <AppLayoutSB>
      <TitleTarget title="viewRole.title" description="viewRole.description" />
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              {" "}
              <p className="text-3xl font-bold">{t("viewRole.loading")}</p>{" "}
            </div>
          )}{" "}
          {error && (
            <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
              {" "}
              <p className="text-3xl font-bold">{t("viewRole.error")}</p>{" "}
            </div>
          )}{" "}
          {!loading && !error && roleDetails && (
            <div className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
              <div className="flex justify-between mt-3">
                <h1 className="text-xl font-bold">
                  {t("viewRole.generalInformation")}
                </h1>
                <Button
                  onClick={() => navigate("/administration/roles")}
                  color="alternative"
                >
                  {t("viewRole.goBack")}
                </Button>
              </div>
              <div className="p-4 py-5 mt-2 font-semibold border dark:border-gray-600 rounded-2xl">
                <div className="justify-between text-sm md:grid-cols-2 md:grid">
                  <div>
                    <p className="font-bold text-gray-500">
                      {t("viewRole.id")}
                    </p>
                    <p>{roleDetails?.role_id}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-500">
                      {t("viewRole.code")}
                    </p>
                    <p>{roleDetails?.code}</p>
                  </div>
                </div>
                <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid ">
                  <div>
                    <p className="font-bold text-gray-500">
                      {t("viewRole.name")}
                    </p>
                    <p>{roleDetails?.name}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-500 ">
                      {t("viewRole.descriptionDetail")}
                    </p>
                    <p>{roleDetails?.description}</p>
                  </div>
                </div>
                <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid">
                  <div>
                    <p className="font-bold text-gray-500">
                      {t("viewRole.state")}
                    </p>
                    <p>{t(`common.${roleDetails?.state.toLowerCase()}`)}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-500">
                      {t("viewRole.countUsers")}
                    </p>
                    <p>{roleDetails?.count_users}</p>
                  </div>
                </div>
                <div className="mt-5 ">
                  <div className="flex justify-between">
                  <p className="mb-2 text-sm font-bold text-gray-500">
                    {t("viewRole.permissions")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-gray-500">
                      {t("viewRole.actionLegend")}:
                    </span>

                    {Object.entries(actionColors).map(([action, color]) => (
                      <Badge key={action} color={color}>
                        {t(`common.${action}`)}
                      </Badge>
                    ))}
                  </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(groupedPermissions || {}).map(
                      ([moduleCode, moduleData]) => (
                        <div key={moduleCode} className="">
                          {/* Nombre del módulo */}
                          <h2 className="mb-2 text-xs font-bold text-gray-500 dark:text-gray-300">
                            {moduleData.module_name}
                          </h2>

                          {/* Permisos */}
                          <div className="flex flex-wrap gap-2">
                            {moduleData.permissions.map((permission) => (
                              <Badge
                                key={permission.permission_id}
                                color={
                                  actionColors[permission.action_name || ""] ||
                                  "gray"
                                }
                              >
                                {permission.permission_name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
              {roleId !== "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1" && (
                <div className="flex justify-end gap-3 mt-3">
                  <Button
                    onClick={() =>
                      navigate(`/administration/roles/edit-role/${roleId}`)
                    }
                    color="blue"
                  >
                    <Pencil size={18} className="mr-2" />
                    {t("viewRole.editRole")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AppLayoutSB>
  );
};

export default RoleView;
