/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { ListRolesResponse } from "../../dto/response/listRoles-response.dto";
import {
  Badge,
  Button,
  Label,
  Textarea,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
import {
  editRoleService,
  getDetailsRoleService,
} from "../../services/agrofusion/auth.service";
import * as yup from "yup";
import { useFormik } from "formik";
import type { AlertState } from "../../components/layout/AlertSimple";
import { FiSave } from "react-icons/fi";
import AlertSimple from "../../components/layout/AlertSimple";
import { getPermissionsBasicService } from "../../services/agrofusion/auth.service";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";
import type { PermissionBasicResponse } from "../../dto/response/listPermissions-response.dto";
interface EditValues {
  name: string;
  description: string;
  state: string;
  code: string;
  permissions: PermissionBasicResponse[];
}

const actionColors: Record<string, string> = {
  CREATE: "success",
  READ: "info",
  UPDATE: "warning",
  DELETE: "failure",
};
const EditRoles = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { roleId } = useParams<{ roleId: string }>();
  const [roleDetails, setRoleDetails] = useState<ListRolesResponse | null>(
    null,
  );
  const navigate = useNavigate();
  const [alert, setAlert] = useState<AlertState>(null);
  // const [availablePermissions, setAvailablePermissions] = useState<
  //   PermissionBasicResponse[]
  // >([]);
  const [allPermissions, setAllPermissions] = useState<PermissionBasicResponse[]>([]);

  const [rolePermissions, setRolePermissions] = useState<
    PermissionBasicResponse[]
  >([]);
  const getRoleDetails = async () => {
    try {
      setLoading(true);
      const response = await getDetailsRoleService(roleId || "");
      setRoleDetails(response);
      setRolePermissions(response.permissions || []);
    } catch (error) {
      console.log(error);
      setError("Error al cargar detalles de usuario");
    } finally {
      setLoading(false);
    }
  };
  const loadAvailablePermissions = async () => {
  try {
    const permissions = await getPermissionsBasicService();
    setAllPermissions(permissions);
  } catch (error) {
    console.log(error);
  }
};
  // const loadAvailablePermissions = async () => {
  //   try {
  //     const allPermissions = await getPermissionsBasicService();

  //     const filtered = allPermissions.filter(
  //       (perm) =>
  //         !rolePermissions.some(
  //           (rolePerm) =>
  //             String(rolePerm.permission_id) === String(perm.permission_id),
  //         ),
  //     );
  //     setAvailablePermissions(filtered);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    if (roleId) {
      getRoleDetails();
    }
  }, [roleId]);
  useEffect(() => {
    if (roleDetails) {
      loadAvailablePermissions();
    }
  }, [roleDetails]);
  const handleAddPermission = (permission: PermissionBasicResponse) => {
    const updated = [...rolePermissions, permission];
    setRolePermissions(updated);
    formik.setFieldValue("permissions", updated);
  };
    const availablePermissions = allPermissions.filter(
  (perm) =>
    !rolePermissions.some(
      (rolePerm) =>
        String(rolePerm.permission_id) === String(perm.permission_id),
    ),
);

  const groupedAvailablePermissions = availablePermissions.reduce(
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
      { module_name: string; permissions: typeof availablePermissions }
    >,
  );
  const handleRemovePermission = (permissionId: string) => {
    if (rolePermissions.length === 1) {
      setAlert({
        message: "editRole.warningEdit",
        type: "warning",
      });
      return;
    }

    const updated = rolePermissions.filter(
      (perm) => perm.permission_id !== permissionId,
    );

    setRolePermissions(updated);
    formik.setFieldValue("permissions", updated);
  };
  const EditSchema = (t: any) =>
    yup.object({
      name: yup
        .string()
        .required(t("validation.completeField"))
        .min(3, t("validation.nameMin")),

      state: yup.string().required(t("validation.completeField")),

      description: yup.string().min(8, t("validation.descriptionMin")),
    });

  const formik = useFormik<EditValues>({
    initialValues: {
      name: "",
      description: "",
      state: "",
      code: "",
      permissions: [],
    },
    validationSchema: EditSchema(t),
    onSubmit: async (values) => {
      if (!formik.dirty) {
        setAlert({ message: "editRole.noChanges", type: "warning" });
        return;
      }

      try {
        await editRoleService(roleId || "", values);
        setAlert({
          message: "editRole.successEdit",
          type: "success",
          to: "/administration/roles",
        });
      } catch (error: any) {
        const errorCode = error.response?.data?.detail?.code ?? "UNKNOWN_ERROR";
        setAlert({
          message: t(`errors.${errorCode}`),
          type:
            errorCode == "AUTH_INSUFFICIENT_PERMISSIONS" ? "warning" : "error",
        });
      }
    },
  });
  const isDeleted = formik.values.state === "DELETED";

  const handleToggleState = (checked: boolean) => {
    const newState = checked ? "ACTIVE" : "INACTIVE";

    // Bloquear inactivación si tiene usuarios
    if (
      newState === "INACTIVE" &&
      roleDetails?.count_users &&
      roleDetails.count_users >= 1
    ) {
      setAlert({
        message: "editRole.cannotDeactivateWithUsers",
        type: "warning",
      });

      return; // no cambia el estado
    }

    formik.setFieldValue("state", newState);
  };
  /** Helper para renderizar errores de validación local (Yup) */
  const displayError = (name: keyof EditValues) => {
    const touched = formik.touched[name];
    const error = formik.errors[name];

    if (!touched || !error) return null;

    if (typeof error === "string") {
      return <p className="mt-1 text-sm text-red-500">{error}</p>;
    }

    return null;
  };

  useEffect(() => {
    if (roleDetails) {
      const formValues = {
        name: roleDetails.name,
        description: roleDetails.description || "",
        state: roleDetails.state,
        code: roleDetails.code,
        permissions: roleDetails.permissions || [],
      };

      formik.resetForm({ values: formValues });
      setRolePermissions(roleDetails.permissions || []);
    }
  }, [roleDetails]);

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
  const groupedRolePermissions = rolePermissions.reduce(
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
      { module_name: string; permissions: typeof rolePermissions }
    >,
  );

  return (
    <AppLayoutSB>
      <TitleTarget title="editRole.title" />
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              {" "}
              <p className="text-3xl font-bold">{t("editRole.loading")}</p>{" "}
            </div>
          )}{" "}
          {error && (
            <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
              {" "}
              <p className="text-3xl font-bold">{t("editRole.error")}</p>{" "}
            </div>
          )}{" "}
          {!loading && !error && roleDetails && (
            <div className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
              <div className="w-full">
                <div className="block mb-2">
                  <Label htmlFor="name">{t("editRole.name")}</Label>
                </div>
                <TextInput
                  id="name"
                  type="text"
                  sizing="sm"
                  placeholder={t("editRole.namePlaceholder")}
                  required
                  {...formik.getFieldProps("name")}
                  color={
                    formik.touched.name && formik.errors.name
                      ? "failure"
                      : "gray"
                  }
                />
                {displayError("name")}
              </div>

              <div className="w-full mt-2">
                <div className="block mb-2">
                  <Label htmlFor="description">
                    {t("editRole.description")}
                  </Label>
                </div>
                <Textarea
                  id="description"
                  placeholder={t("editRole.descripPlaceholder")}
                  required
                  {...formik.getFieldProps("description")}
                  color={
                    formik.touched.description && formik.errors.description
                      ? "failure"
                      : "gray"
                  }
                />
                {displayError("description")}
              </div>
              <div className="flex items-end gap-5 mt-2">
                <div className="w-full">
                  <div className="block mb-2">
                    <Label htmlFor="name">{t("editRole.code")}</Label>
                  </div>
                  <TextInput
                    id="code"
                    type="text"
                    sizing="sm"
                    placeholder={t("editRole.namePlaceholder")}
                    required
                    value={roleDetails.code}
                    disabled
                  />
                </div>

                <div className="w-full ">
                  <Label htmlFor="state">{t("editRole.state")}</Label>

                  {isDeleted ? (
                    <div className="flex items-center gap-3 mt-1">
                      <Badge color="failure" size="xl">
                        {t("common.deleted")}
                      </Badge>

                      <Button
                        size="xs"
                        color="green"
                        onClick={() =>
                          formik.setFieldValue("state", "INACTIVE")
                        }
                      >
                        {t("editRole.restore")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-2">
                      <ToggleSwitch
                        checked={formik.values.state === "ACTIVE"}
                        label={
                          formik.values.state === "ACTIVE"
                            ? t("common.active")
                            : t("common.inactive")
                        }
                        disabled={loading}
                        onChange={handleToggleState}
                        color="red"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full mt-4">
                <div className="flex justify-between">
                  <Label>{t("editRole.permissionsAssigned")}</Label>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-gray-600">
                      {t("viewRole.actionLegend")}:
                    </span>

                    {Object.entries(actionColors).map(([action, color]) => (
                      <Badge key={action} color={color}>
                        {t(`common.${action}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-3 space-y-4">
                  {Object.entries(groupedRolePermissions || {}).map(
                    ([moduleCode, moduleData]) => (
                      <div key={moduleCode}>
                        {/* Módulo */}
                        <h3 className="mb-2 text-xs font-bold text-gray-500 dark:text-gray-300">
                          {moduleData.module_name}
                        </h3>

                        {/* Permisos del módulo */}
                        <div className="flex flex-wrap gap-2">
                          {moduleData.permissions.map((permission) => (
                            <Badge
                              key={permission.permission_id}
                              color={
                                actionColors[permission.action_name || ""] ||
                                "gray"
                              }
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              {permission.permission_name}

                              {/* remover */}
                              <span
                                onClick={() =>
                                  handleRemovePermission(
                                    permission.permission_id,
                                  )
                                }
                                className="ml-1 font-bold cursor-pointer"
                              >
                                ✕
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <Label className="block mt-10">
                {t("editRole.permissionsAvailable")}
              </Label>

              <div className="mt-5 space-y-4">
                {Object.entries(groupedAvailablePermissions || {}).map(
                  ([moduleCode, moduleData]) => (
                    <div key={moduleCode}>
                      <h3 className="mb-2 text-xs font-bold text-gray-500 dark:text-gray-300">
                        {moduleData.module_name}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {moduleData.permissions.map((permission) => (
                          <Badge
                            key={permission.permission_id}
                            color={
                              actionColors[permission.action_name || ""] ||
                              "gray"
                            }
                            className="cursor-pointer"
                            onClick={() => handleAddPermission(permission)}
                          >
                            + {permission.permission_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <Button
                  onClick={() => navigate(`/administration/roles`)}
                  color="alternative"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  color="blue"
                  disabled={!formik.dirty || formik.isSubmitting}
                  onClick={() => {
                    if (!formik.dirty) {
                      setAlert({
                        message: "editRole.noChanges",
                        type: "warning",
                      });
                      return;
                    }
                    formik.handleSubmit();
                  }}
                >
                  <FiSave size={22} className="mr-1" />
                  {t("editRole.save")}
                </Button>
              </div>
            </div>
          )}
          {alert && (
            <AlertSimple
              message={t(alert.message)}
              type={alert.type}
              to={alert.to}
              onClose={() => {
                setAlert(null);
              }}
            />
          )}
        </>
      )}
    </AppLayoutSB>
  );
};

export default EditRoles;
