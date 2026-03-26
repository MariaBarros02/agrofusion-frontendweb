/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Label,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
//import { createProjectService } from "../../services/agrofusion/auth.service";
import * as yup from "yup";
import { useFormik } from "formik";
import type { AlertState } from "../../components/layout/AlertSimple";
import { FiSave, FiUploadCloud } from "react-icons/fi";
import AlertSimple from "../../components/layout/AlertSimple";
import { iconMapper } from "../../utils/iconMapper";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";
import type { CreateProjectRequest, CreateModuleRequest } from "../../dto/request/createProject-request.dto";
import { ProjectEndpointRegistrationSection } from "../../components/administration/ProjectEndpointRegistrationSection";

const MODULES_COUNT = 3;
const defaultModule: CreateModuleRequest = {
  name: "",
  base_url: "",
  module_icon: "",
  description: "",
};

const CreateSchema = (t: (key: string) => string) =>
  yup.object({
    instance_code: yup.string().required(t("project.create.validationRequired")).trim(),
    project_name: yup.string().required(t("project.create.validationRequired")).trim(),
    project_url: yup.string().required(t("project.create.validationRequired")).trim(),
    description: yup.string().required(t("project.create.validationRequired")).trim(),
    is_active: yup.boolean().required(),
    project_image: yup.string().required(t("project.create.validationRequired")),
    project_image_mime_type: yup.string().required(t("project.create.validationRequired")),
    api_url_base: yup.string().required(t("project.create.validationRequired")).trim(),
    modules: yup
      .array()
      .of(
        yup.object({
          name: yup.string().required(t("project.create.validationRequired")).trim(),
          base_url: yup.string().required(t("project.create.validationRequired")).trim(),
          module_icon: yup.string().required(t("project.create.validationRequired")).trim(),
          description: yup.string().required(t("project.create.validationRequired")).trim(),
        })
      )
      .length(MODULES_COUNT, t("project.create.validationExactlyThreeModules")),
  });

type FormValues = CreateProjectRequest;

const AddProject = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      instance_code: "",
      project_name: "",
      project_url: "",
      description: "",
      is_active: true,
      project_image: "",
      project_image_mime_type: "",
      api_url_base: "",
      modules: Array.from({ length: MODULES_COUNT }, () => ({ ...defaultModule })),
    },
    validationSchema: CreateSchema(t),
    onSubmit: async (values) => {
      setLoading(true);
      setAlert(null);
      try {
        // await createProjectService({
        //   ...values,
        // });
        // setAlert({
        //   message: "project.create.success",
        //   type: "success",
        //   to: "/administration/projects",
        // });
      } catch (err: any) {
        const code = err.response?.data?.detail?.code;
        if (code === "EXTERNAL_PROJECT_INSTANCE_CODE_EXISTS") {
          setAlert({ message: "project.create.errorDuplicateCode", type: "error" });
          return;
        }
        if (code === "EXTERNAL_PROJECT_MODULES_COUNT") {
          setAlert({ message: "project.create.errorModulesCount", type: "error" });
          return;
        }
        if (code === "AUTH_INSUFFICIENT_PERMISSIONS") {
          setAlert({ message: "project.create.errorNoPermission", type: "warning" });
          return;
        }
        setAlert({ message: "project.create.errorGeneric", type: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  const imageSectionTouched =
    formik.touched.project_image || formik.touched.project_image_mime_type;

  const imageSectionError =
    (imageSectionTouched && formik.errors.project_image) ||
    (imageSectionTouched && formik.errors.project_image_mime_type) ||
    null;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
  
      if (!file) {
        formik.setFieldValue("project_image", "");
        formik.setFieldValue("project_image_mime_type", "");
        formik.setFieldTouched("project_image", true, false);
        formik.setFieldTouched("project_image_mime_type", true, false);
        setImagePreview(null);
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        formik.setFieldValue("project_image", result);
        formik.setFieldValue("project_image_mime_type", file.type || "");
        formik.setFieldTouched("project_image", true, false);
        formik.setFieldTouched("project_image_mime_type", true, false);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleToggleActive = (checked: boolean) => {
    formik.setFieldValue("is_active", checked);
  };

  const displayError = (field: string) => {
    const touched = (formik.touched as any)[field];
    const error = (formik.errors as any)[field];
    if (!touched || !error) return null;
    if (typeof error === "string") return <p className="mt-1 text-sm text-red-500">{error}</p>;
    return null;
  };

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  const canAccessSubmodule = useSubmoduleAccessStore((s) => s.canAccessSubmodule);
  const showModuleInactive = !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive =
    canAccessModule("ADMINISTRATION") && !canAccessSubmodule("PROJECTS");
  const showContent = canAccessModule("ADMINISTRATION") && canAccessSubmodule("PROJECTS");

  return (
    <AppLayoutSB>
      <TitleTarget
        title="project.create.title"
        description="project.create.description"
      />
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          <form
            onSubmit={formik.handleSubmit}
            className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700"
          >
            {/* Información principal */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
            {/* Código del proyecto */}
            <div>
              <Label htmlFor="instance_code">
                {t("project.create.instanceCode")} <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="instance_code"
                className="mt-1"
                placeholder="Ej. xxxxxXXXXXXXXXX"
                {...formik.getFieldProps("instance_code")}
                color={formik.touched.instance_code && formik.errors.instance_code ? "failure" : "gray"}
                sizing="sm"
              />
              {displayError("instance_code")}
            </div>

            {/* Nombre del proyecto */}
            <div>
              <Label htmlFor="project_name">
                {t("project.create.projectName")} <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="project_name"
                className="mt-1"
                placeholder="Ej. Administrador de Contabilidad"
                {...formik.getFieldProps("project_name")}
                color={formik.touched.project_name && formik.errors.project_name ? "failure" : "gray"}
                sizing="sm"
              />
              {displayError("project_name")}
            </div>

            {/* Ruta del frontend */}
            <div>
              <Label htmlFor="project_url">
                {t("project.create.projectUrl")} <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="project_url"
                className="mt-1"
                placeholder="Ej. /Nombre_del_proyecto"
                {...formik.getFieldProps("project_url")}
                color={formik.touched.project_url && formik.errors.project_url ? "failure" : "gray"}
                sizing="sm"
              />
              {displayError("project_url")}
            </div>

            {/* Base de la API */}
            <div>
              <Label htmlFor="api_url_base">
                {t("project.create.apiUrlBase")} <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="api_url_base"
                className="mt-1"
                placeholder="Ej. /nombre_del_proyecto/api"
                {...formik.getFieldProps("api_url_base")}
                color={formik.touched.api_url_base && formik.errors.api_url_base ? "failure" : "gray"}
                sizing="sm"
              />
              {displayError("api_url_base")}
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="description">
              {t("project.create.descriptionInput")}
            </Label>

            <TextInput
              id="description"
              className="mt-1"
              placeholder={t("project.create.descriptionPlaceholder")}
              {...formik.getFieldProps("description")}
              color={formik.touched.description && formik.errors.description ? "failure" : "gray"}
            />

            {displayError("description")}
          </div>

            <div className="mb-6">
              <Label className="block mb-2">
                {t("project.create.status")}
              </Label>

              <div className="inline-flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-xl dark:border-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <ToggleSwitch
                  checked={formik.values.is_active}
                  label={formik.values.is_active ? t("common.active") : t("common.inactive")}
                  disabled={loading}
                  onChange={handleToggleActive}
                  color="success"
                />
              </div>
            </div>
            
            {/* Imagen */}
            <div className="mb-6">
              <Label className="block">
                {t("project.create.imageUpload")} <span className="text-red-500">*</span>
              </Label>
              <div
                className="flex flex-col items-center justify-center p-6 mt-1 border-2 border-gray-300 border-dashed rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
              >
                <FiUploadCloud className="w-10 h-10 mb-2 text-blue-500" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="project_image_file"
                  onChange={handleFileChange}
                />
                <label htmlFor="project_image_file">
                  <Button color="green" size="sm" as="span">
                    {t("project.create.chooseFiles")}
                  </Button>
                </label>
                <p className="mt-1 text-sm text-gray-500">{t("project.create.dragAndDrop")}</p>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 rounded max-h-24"
                  />
                )}
              </div>

              {imageSectionError && (
                <p className="mt-1 text-sm text-red-500">{imageSectionError}</p>
              )}
            </div>

            {/* Módulos de acceso rápido */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {t("project.create.quickAccessModules")}
              </h3>

              {formik.values.modules.map((_, index) => (
                <div
                  key={index}
                  className="p-4 mb-4 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                >
                  <h4 className="mb-3 font-medium text-gray-700 dark:text-gray-300">
                    {t("project.create.module")} {index + 1}
                  </h4>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* Fila 1: Nombre del módulo | Ruta o endpoint */}
                    <div>
                      <Label>
                        {t("project.create.moduleName")} <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        className="mt-1"
                        sizing="sm"
                        {...formik.getFieldProps(`modules.${index}.name`)}
                        color={
                          (formik.touched.modules as any)?.[index]?.name &&
                          (formik.errors.modules as any)?.[index]?.name
                            ? "failure"
                            : "gray"
                        }
                      />
                      {(formik.touched.modules as any)?.[index]?.name &&
                        (formik.errors.modules as any)?.[index]?.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {(formik.errors.modules as any)[index].name}
                          </p>
                        )}
                    </div>

                    <div>
                      <Label>
                        {t("project.create.moduleBaseUrl")} <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        className="mt-1"
                        sizing="sm"
                        {...formik.getFieldProps(`modules.${index}.base_url`)}
                        color={
                          (formik.touched.modules as any)?.[index]?.base_url &&
                          (formik.errors.modules as any)?.[index]?.base_url
                            ? "failure"
                            : "gray"
                        }
                        placeholder={t("project.create.moduleBaseUrlPlaceholder")}
                      />
                      {(formik.touched.modules as any)?.[index]?.base_url &&
                        (formik.errors.modules as any)?.[index]?.base_url && (
                          <p className="mt-1 text-sm text-red-500">
                            {(formik.errors.modules as any)[index].base_url}
                          </p>
                        )}
                    </div>

                    {/* Fila 2: Descripción del módulo | Seleccionar icono */}
                    <div>
                      <Label>
                        {t("project.create.moduleDescription")} <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        className="mt-1"
                        sizing="sm"
                        {...formik.getFieldProps(`modules.${index}.description`)}
                        color={
                          (formik.touched.modules as any)?.[index]?.description &&
                          (formik.errors.modules as any)?.[index]?.description
                            ? "failure"
                            : "gray"
                        }
                      />
                      {(formik.touched.modules as any)?.[index]?.description &&
                        (formik.errors.modules as any)?.[index]?.description && (
                          <p className="mt-1 text-sm text-red-500">
                            {(formik.errors.modules as any)[index].description}
                          </p>
                        )}
                    </div>

                    <div>
                      <Label>
                        {t("project.create.moduleSelectIcon")} <span className="text-red-500">*</span>
                      </Label>

                      <div className="flex flex-wrap items-center gap-2 mt-1 min-h-[2.25rem]">
                        {Object.entries(iconMapper).map(([key, IconComponent]) => {
                          const isSelected = formik.values.modules[index]?.module_icon === key;
                          const hasError =
                            (formik.touched.modules as any)?.[index]?.module_icon &&
                            (formik.errors.modules as any)?.[index]?.module_icon;

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                formik.setFieldValue(`modules.${index}.module_icon`, key);
                                formik.setFieldTouched(`modules.${index}.module_icon`, true, false);
                              }}
                              className={`flex items-center justify-center min-h-[2.25rem] w-[2.25rem] flex-shrink-0 rounded-lg border-2 transition-colors ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                                  : hasError
                                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400"
                                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                              }`}
                              title={key}
                            >
                              <IconComponent className="text-lg text-gray-700 dark:text-gray-200" />
                            </button>
                          );
                        })}
                      </div>

                      {(formik.touched.modules as any)?.[index]?.module_icon &&
                        (formik.errors.modules as any)?.[index]?.module_icon && (
                          <p className="mt-1 text-sm text-red-500">
                            {(formik.errors.modules as any)[index].module_icon}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              {formik.touched.modules && typeof formik.errors.modules === "string" && (
                <p className="mt-1 text-sm text-red-500">{formik.errors.modules}</p>
              )}
            </div>

            <ProjectEndpointRegistrationSection apiUrlBase={formik.values.api_url_base} />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                color="alternative"
                onClick={() => navigate("/administration/projects")}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                color="blue"
                disabled={loading || !formik.isValid}
              >
                <FiSave className="inline mr-2" size={18} />
                {t("example.save")}
              </Button>
            </div>
          </form>

          {alert && (
            <AlertSimple
              message={t(alert.message)}
              type={alert.type}
              to={alert.to}
              onClose={() => setAlert(null)}
            />
          )}
        </>
      )}
    </AppLayoutSB>
  );
};

export default AddProject;
