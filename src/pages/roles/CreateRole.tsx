/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Label,
  Textarea,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
import { createRoleService } from "../../services/agrofusion/auth.service";
import * as yup from "yup";
import { useFormik } from "formik";
import type { AlertState } from "../../components/layout/AlertSimple";
import { FiSave } from "react-icons/fi";
import AlertSimple from "../../components/layout/AlertSimple";
import { getPermissionsBasicService } from "../../services/agrofusion/auth.service";
import type { PermissionBasicResponse } from "../../dto/response/listPermissions-response.dto";
interface CreateValues {
  name: string;
  description: string;
  state: string;
  code: string;
  permissions: PermissionBasicResponse[];
}

const badgeColors = [
  "info",
  "failure",
  "success",
  "warning",
  "indigo",
  "purple",
  "pink",
] as const;
const CreateRole = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [alert, setAlert] = useState<AlertState>(null);
  const [availablePermissions, setAvailablePermissions] = useState<
    PermissionBasicResponse[]
  >([]);
  const [rolePermissions, setRolePermissions] = useState<
    PermissionBasicResponse[]
  >([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const allPermissions = await getPermissionsBasicService();

        setAvailablePermissions(allPermissions);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPermissions();
  }, []);

  const handleAddPermission = (permission: PermissionBasicResponse) => {
    const updated = [...rolePermissions, permission];
    setRolePermissions(updated);
    formik.setFieldValue("permissions", updated);
  };
  const handleRemovePermission = (permissionId: string) => {
    const updated = rolePermissions.filter(
      (perm) => perm.permission_id !== permissionId,
    );

    setRolePermissions(updated);
    formik.setFieldValue("permissions", updated);
  };
  const CreateSchema = (t: any) =>
    yup.object({
      name: yup
        .string()
        .required(t("validation.completeField"))
        .min(3, t("validation.nameMin")),

      state: yup.string().required(t("validation.completeField")),

      permissions: yup
        .array()
        .min(1, t("validation.minOnePermission"))
        .required(),
      code: yup
        .string()
        .required(t("validation.completeField"))
        .min(3, t("validation.codeMin")),
    });

  const formik = useFormik<CreateValues>({
    initialValues: {
      name: "",
      description: "",
      state: "ACTIVE",
      code: "",
      permissions: [],
    },
    validationSchema: CreateSchema(t),
    onSubmit: async (values) => {
      try {
        await createRoleService(values);
        setAlert({
          message: "createRole.successEdit",
          type: "success",
          to: "/administration/roles",
        });
      } catch (error: any) {
        const errorCode = error.response?.data?.detail?.code ?? "UNKNOWN_ERROR";

        setAlert({
          message: t(`errors.${errorCode}`, {
      code: values.code,
    }),
          type: "error",
        });
      }
    },
  });

  const handleToggleState = (checked: boolean) => {
    formik.setFieldValue("state", checked ? "ACTIVE" : "INACTIVE");
  };
  /** Helper para renderizar errores de validación local (Yup) */
  const displayError = (name: keyof CreateValues) => {
    const touched = formik.touched[name];
    const error = formik.errors[name];

    if (!touched || !error) return null;

    if (typeof error === "string") {
      return <p className="mt-1 text-sm text-red-500">{error}</p>;
    }

    return null;
  };

  const filteredAvailablePermissions = availablePermissions.filter(
    (available) =>
      !rolePermissions.some(
        (assigned) => assigned.permission_id === available.permission_id,
      ),
  );

  return (
    <AppLayoutSB>
      <TitleTarget
        title="createRole.title"
        description="createRole.descriptionTitle"
      />
      {loading && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("createRole.loading")}</p>{" "}
        </div>
      )}{" "}
      {error && (
        <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("createRole.error")}</p>{" "}
        </div>
      )}{" "}
      {!loading && !error && (
        <form
          onSubmit={formik.handleSubmit}
          className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700"
        >
          <div className="w-full">
            <div className="block mb-2">
              <Label htmlFor="name">{t("createRole.name")}</Label>
            </div>
            <TextInput
              id="name"
              type="text"
              sizing="sm"
              placeholder={t("createRole.namePlaceholder")}
              required
              {...formik.getFieldProps("name")}
              color={
                formik.touched.name && formik.errors.name ? "failure" : "gray"
              }
            />
            {displayError("name")}
          </div>

          <div className="w-full mt-2">
            <div className="block mb-2">
              <Label htmlFor="description">{t("createRole.description")}</Label>
            </div>
            <Textarea
              id="description"
              placeholder={t("createRole.descripPlaceholder")}
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
                <Label htmlFor="code">{t("createRole.code")}</Label>
              </div>

              <TextInput
                id="code"
                type="text"
                sizing="sm"
                placeholder={t("createRole.codePlaceholder")}
                required
                {...formik.getFieldProps("code")}
                color={
                  formik.touched.code && formik.errors.code ? "failure" : "gray"
                }
              />

              {displayError("code")}
            </div>

            <div className="w-full ">
              <Label htmlFor="state">{t("createRole.state")}</Label>

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
            </div>
          </div>
          <div className="w-full mt-4">
            <Label>{t("createRole.permissionsAssigned")}</Label>

            <div className="flex flex-wrap gap-2 mt-2">
              {rolePermissions.map((permission, index) => (
                <Badge
                  key={permission.permission_id}
                  color={badgeColors[index % badgeColors.length]}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {permission.permission_name}
                  <span
                    onClick={() =>
                      handleRemovePermission(permission.permission_id)
                    }
                    className="ml-1 font-bold cursor-pointer"
                  >
                    ✕
                  </span>
                </Badge>
              ))}
            </div>
            {formik.touched.permissions && formik.errors.permissions && (
              <p className="mt-1 text-sm text-red-500">
                {formik.errors.permissions as string}
              </p>
            )}

            <Label className="block mt-4">
              {t("createRole.permissionsAvailable")}
            </Label>

            <div className="flex flex-wrap gap-2 mt-2">
              {filteredAvailablePermissions.map((permission) => (
                <Badge
                  key={permission.permission_id}
                  color="gray"
                  className="cursor-pointer"
                  onClick={() => handleAddPermission(permission)}
                >
                  + {permission.permission_name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <Button
              onClick={() => navigate(`/administration/roles`)}
              color="alternative"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              <FiSave size={22} className="mr-1" />
              {t("createRole.save")}
            </Button>
          </div>
        </form>
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
    </AppLayoutSB>
  );
};

export default CreateRole;
