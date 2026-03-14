/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { ListPermissionsResponse } from "../../dto/response/listPermissions-response.dto";
import {
  Badge,
  Button,
  Label,
  Select,
  Textarea,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
import { editPermissionService, getDetailsPermissionService } from "../../services/agrofusion/auth.service";
import * as yup from "yup";
import { useFormik } from "formik";
import type { AlertState } from "../../components/layout/AlertSimple";
import { FiFlag, FiSave } from "react-icons/fi";
import AlertSimple from "../../components/layout/AlertSimple";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";
interface EditValues {
  name: string;
  description: string;
  state: string;
}
const EditPermissions = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { permId } = useParams<{ permId: string }>();
  const [permDetails, setPermDetails] =
    useState<ListPermissionsResponse | null>(null);
  const navigate = useNavigate();
  const [alert, setAlert] = useState<AlertState>(null);

  const getPermDetails = async () => {
    try {
      setLoading(true);
      const response = await getDetailsPermissionService(permId || "");
      setPermDetails(response);
    } catch (error) {
      console.log(error);
      setError("Error al cargar detalles de usuario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permId) {
      getPermDetails();
    }
  }, [permId]);

  const EditSchema = (t: any) =>
    yup.object({
      name: yup
        .string()
        .required(t("validation.completeField"))
        .min(3, t("validation.nameMin")),

      state: yup.string().required(t("validation.completeField")),

     
    });

  const formik = useFormik<EditValues>({
    initialValues: {
      name: permDetails?.name || "",
      description: permDetails?.description || "",
      state: permDetails?.state || "",
    },
    enableReinitialize: true,
    validationSchema: EditSchema(t),
    onSubmit: async (values) => {
      if (!formik.dirty) {
        setAlert({ message: "editPermission.noChanges", type: "warning" });
        return;
      }

      try {
        await editPermissionService(permId || "", values);
        setAlert({
            message: "editPermission.successEdit",
            type: "success",
            to: '/administration/permissions'
        })
      } catch (error: any) {
        const errorCode = error.response?.data?.detail?.code ?? "UNKNOWN_ERROR";

        setAlert({
          message: t(`errors.${errorCode}`),
          type: errorCode == "AUTH_INSUFFICIENT_PERMISSIONS" ? "warning": "error",
        });
      
      }
      
    },
  });

  const handleToggleState = (checked: boolean) => {
    formik.setFieldValue("state", checked ? "ACTIVE" : "INACTIVE");
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

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore((s) => s.canAccessSubmodule);
  const showModuleInactive = !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive = canAccessModule("ADMINISTRATION") && !canAccessSubmodule("PERMISSIONS");
  const showContent = canAccessModule("ADMINISTRATION") && canAccessSubmodule("PERMISSIONS");

  return (
    <AppLayoutSB>
      <TitleTarget title="editPermission.title" />
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
      {loading && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          {" "}
          <p className="text-3xl font-bold">
            {t("editPermission.loading")}
          </p>{" "}
        </div>
      )}{" "}
      {error && (
        <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("editPermission.error")}</p>{" "}
        </div>
      )}{" "}
      {!loading && !error && permDetails && (
        <div className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
          <div className="w-full">
            <div className="block mb-2">
              <Label htmlFor="name">{t("editPermission.name")}</Label>
            </div>
            <TextInput
              id="name"
              type="text"
              sizing="sm"
              placeholder={t("editPermission.namePlaceholder")}
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
              <Label htmlFor="description">
                {t("editPermission.description")}
              </Label>
            </div>
            <Textarea
              id="description"
              placeholder={t("editPermission.descripPlaceholder")}
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
                <Label htmlFor="name">{t("editPermission.code")}</Label>
              </div>
              <TextInput
                id="code"
                type="text"
                sizing="sm"
                placeholder={t("editPermission.namePlaceholder")}
                required
                value={permDetails.code}
                disabled
              />
            </div>
            <div className="w-full mb-2">
              <Label htmlFor="state">{t("editPermission.state")}</Label>
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
                  color="failure"
                />
              </div>
            </div>
            <div className="w-full">
              <Label className="text-xs">{t("editPermission.type")}</Label>
              <Select
                icon={FiFlag}
                sizing="sm"
                value={permDetails.type}
                disabled
              >
                <option value="">GLOBAL / EXTERNAL</option>
                <option value="GLOBAL">GLOBAL</option>
                <option value="LOCAL">LOCAL</option>
                <option value="EXTERNAL">EXTERNAL</option>
              </Select>
            </div>
          </div>
          <div className="w-full mt-2">
            <div className="block mb-2">
              <Label htmlFor="modules-submodule">
                {t("editPermission.moduleSub")}
              </Label>
            </div>
            <div className="flex gap-3">
              <Badge color="info" className="p-2">
                {permDetails.module}
              </Badge>
              {permDetails.submodule && (
                <Badge color="success" className="p-2">
                  {permDetails.submodule}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <Button
              onClick={() => navigate(`/administration/permissions`)}
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
                    message: "editPermission.noChanges",
                    type: "warning",
                  });
                  return;
                }
                formik.handleSubmit();
              }}
            >
                <FiSave size={22} className="mr-1" />
              {t("editPermission.save")}
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

export default EditPermissions;
