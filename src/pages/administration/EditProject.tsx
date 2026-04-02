/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
  Button,
  Label,
  Select,
  TextInput,
  ToggleSwitch,
} from "flowbite-react";
//import { getProjectDetailsService, updateProjectService } from "../../services/agrofusion/auth.service";
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
import type {
  CreateProjectRequest,
  CreateModuleRequest,
  EndpointFormValues,
  VariableType,
  ResponseBodyFieldSpec,
} from "../../dto/request/createProject-request.dto";
import { PROJECT_EXTERNAL_ENDPOINT_SPECS } from "../../dto/request/createProject-request.dto";

const MODULES_COUNT = 3;
const defaultModule: CreateModuleRequest = {
  name: "",
  base_url: "",
  module_icon: "",
  description: "",
};

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const VARIABLE_TYPE_I18N_KEY: Record<VariableType, string> = {
  string: "project.create.endpointResponseBodyTypeString",
  number: "project.create.endpointResponseBodyTypeNumber",
  array: "project.create.endpointResponseBodyTypeArray",
  datetime: "project.create.endpointResponseBodyTypeDatetime",
};

function buildEndpointInitialValues(): EndpointFormValues[] {
  return PROJECT_EXTERNAL_ENDPOINT_SPECS.map((spec) => ({
    url: "",
    method: spec.method,
    auth_with: spec.requiresAuth,
    request_params: (spec.requestParamFields ?? []).map((f) => ({
      key: f.disabled ? "-" : "",
      variable_type: f.allowedTypes[0],
    })),
    request_body: (spec.requestBodyFields ?? []).map((f) => ({
      key: "",
      variable_type: f.allowedTypes[0],
    })),
    response_body: (spec.responseBodyFields ?? []).map((f) => ({
      key: "",
      variable_type: f.allowedTypes[0],
    })),
  }));
}

const endpointFieldMappingSchema = (msg: string) =>
  yup.object({
    key: yup.string().required(msg).trim(),
    variable_type: yup.string().required(msg),
  });

const EditSchema = (t: (key: string) => string) => {
  const msg = t("project.create.validationRequired");
  return yup.object({
    instance_code: yup.string().required(msg).trim(),
    project_name: yup.string().required(msg).trim(),
    project_url: yup.string().required(msg).trim(),
    description: yup.string().required(msg).trim(),
    is_active: yup.boolean().required(),
    project_image: yup.string().required(msg),
    project_image_mime_type: yup.string().required(msg),
    api_url_base: yup.string().required(msg).trim(),
    users_api_path: yup.string().required(msg).trim(),
    modules: yup
      .array()
      .of(
        yup.object({
          name: yup.string().required(msg).trim(),
          base_url: yup.string().required(msg).trim(),
          module_icon: yup.string().required(msg).trim(),
          description: yup.string().required(msg).trim(),
        })
      )
      .length(MODULES_COUNT, t("project.create.validationExactlyThreeModules")),
    endpoints: yup.array().of(
      yup.object({
        url: yup.string().required(msg).trim(),
        method: yup.string().required(msg),
        auth_with: yup.boolean().required(),
        request_params: yup.array().of(endpointFieldMappingSchema(msg)),
        request_body: yup.array().of(endpointFieldMappingSchema(msg)),
        response_body: yup.array().of(endpointFieldMappingSchema(msg)),
      })
    ),
  });
};

type FormValues = CreateProjectRequest;

const EditProject = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
      users_api_path: "",
      modules: Array.from({ length: MODULES_COUNT }, () => ({ ...defaultModule })),
      endpoints: buildEndpointInitialValues(),
    },
    validationSchema: EditSchema(t),
    onSubmit: async (values) => {
      setLoading(true);
      setAlert(null);
      try {
        // await updateProjectService(projectId || "", {
        //   ...values,
        // });
        // setAlert({
        //   message: "project.edit.success",
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

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoadingData(true);
        // const data = await getProjectDetailsService(projectId || "");
        // formik.setValues({
        //   instance_code: data.instance_code ?? "",
        //   project_name: data.project_name ?? "",
        //   project_url: data.project_url ?? "",
        //   description: data.description ?? "",
        //   is_active: data.is_active ?? true,
        //   project_image: data.project_image ?? "",
        //   project_image_mime_type: data.project_image_mime_type ?? "",
        //   api_url_base: data.api_url_base ?? "",
        //   users_api_path: data.users_api_path ?? "",
        //   modules: data.modules ?? Array.from({ length: MODULES_COUNT }, () => ({ ...defaultModule })),
        //   endpoints: data.endpoints ?? buildEndpointInitialValues(),
        // });
        // if (data.project_image) {
        //   setImagePreview(data.project_image);
        // }
      } catch (err: any) {
        console.error(err);
        setAlert({ message: "project.edit.loadError", type: "error" });
      } finally {
        setLoadingData(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

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

  const renderFieldsTable = (
    specIndex: number,
    fields: ResponseBodyFieldSpec[] | undefined,
    formikPath: "request_params" | "request_body" | "response_body",
    labelKey: string,
  ) => {
    if (!fields || fields.length === 0) return null;
    return (
      <div className="md:col-span-2">
        <Label className="text-gray-700 dark:text-gray-300">
          {t(`project.create.${labelKey}`)}
        </Label>
        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
          <table className="w-full min-w-[420px] table-fixed text-left text-sm">
            <thead className="bg-gray-50 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="w-[30%] px-3 py-2">{t("project.create.endpointResponseBodyName")}</th>
                <th className="w-[45%] px-3 py-2">{t("project.create.endpointResponseBodyKey")}</th>
                <th className="w-[25%] px-3 py-2">{t("project.create.endpointResponseBodyVariableType")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {fields.map((field, rowIdx) => {
                const isFixed = field.allowedTypes.length <= 1;
                const fp = `endpoints.${specIndex}.${formikPath}.${rowIdx}`;
                const touchedKey = (formik.touched.endpoints as any)?.[specIndex]?.[formikPath]?.[rowIdx]?.key;
                const errorKey = (formik.errors.endpoints as any)?.[specIndex]?.[formikPath]?.[rowIdx]?.key;
                return (
                  <tr key={`${field.displayName}-${rowIdx}`} className="bg-white dark:bg-gray-800">
                    <td className="px-3 py-2 text-gray-900 dark:text-white">
                      {t(`project.create.${field.displayName}`)}
                    </td>
                    <td className="px-3 py-2">
                      <TextInput
                        sizing="sm"
                        className="font-mono text-xs"
                        disabled={field.disabled}
                        {...formik.getFieldProps(`${fp}.key`)}
                        placeholder={
                          field.placeholderKey
                            ? t(`project.create.${field.placeholderKey}`)
                            : undefined
                        }
                        color={touchedKey && errorKey ? "failure" : "gray"}
                      />
                      {touchedKey && errorKey && (
                        <p className="mt-1 text-xs text-red-500">{errorKey}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        sizing="sm"
                        disabled={isFixed || field.disabled}
                        value={
                          (formik.values.endpoints[specIndex] as any)?.[formikPath]?.[rowIdx]?.variable_type
                          ?? field.allowedTypes[0]
                        }
                        onChange={(e) => formik.setFieldValue(`${fp}.variable_type`, e.target.value)}
                        onBlur={() => formik.setFieldTouched(`${fp}.variable_type`, true)}
                      >
                        {field.allowedTypes.map((vt) => (
                          <option key={vt} value={vt}>
                            {t(VARIABLE_TYPE_I18N_KEY[vt])}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
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
        title="project.edit.title"
        description="project.edit.description"
      />
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loadingData && (
            <div className="flex items-center justify-center p-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("project.edit.loading")}</p>
            </div>
          )}

          {!loadingData && (
          <form
            onSubmit={formik.handleSubmit}
            className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700"
          >
            {/* Información principal */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
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
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
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

              <div>
                <Label htmlFor="users_api_path">
                  {t("project.create.usersApiPath")} <span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="users_api_path"
                  className="mt-1"
                  placeholder="Ej. /users"
                  {...formik.getFieldProps("users_api_path")}
                  color={formik.touched.users_api_path && formik.errors.users_api_path ? "failure" : "gray"}
                  sizing="sm"
                />
                {displayError("users_api_path")}
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
                  id="project_image_file_edit"
                  onChange={handleFileChange}
                />
                <label htmlFor="project_image_file_edit">
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
                        placeholder={t(`project.create.moduleBaseUrlPlaceholder${index + 1}`)}
                      />
                      {(formik.touched.modules as any)?.[index]?.base_url &&
                        (formik.errors.modules as any)?.[index]?.base_url && (
                          <p className="mt-1 text-sm text-red-500">
                            {(formik.errors.modules as any)[index].base_url}
                          </p>
                        )}
                    </div>

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

            {/* Registro de endpoints */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {t("project.create.registerEndpoint")}
              </h3>

              <Accordion
                collapseAll
                className="border border-gray-200 divide-y rounded-lg dark:border-gray-600 dark:divide-gray-600"
              >
                {PROJECT_EXTERNAL_ENDPOINT_SPECS.map((spec, index) => (
                  <AccordionPanel key={spec.title}>
                    <AccordionTitle className="text-left text-sm font-medium focus:ring-0 dark:text-white">
                      {t(`project.create.${spec.title}`)}
                    </AccordionTitle>
                    <AccordionContent>
                      <div className="grid grid-cols-1 gap-3 pt-1 pb-3 text-sm md:grid-cols-2">
                        <div className="md:col-span-2">
                          <Label className="text-gray-700 dark:text-gray-300">
                            {t("project.create.endpointSpecDescription")}
                          </Label>
                          <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-400">
                            {t(`project.create.${spec.description}`)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-end">
                          <div className="min-w-0 flex-1">
                            <Label className="text-gray-700 dark:text-gray-300">
                              {t("project.create.endpointSpecUrl")} <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                              sizing="sm"
                              className="mt-1 font-mono text-xs"
                              {...formik.getFieldProps(`endpoints.${index}.url`)}
                              placeholder={
                                spec.urlEmptyWithPlaceholderKey
                                  ? t(`project.create.${spec.urlEmptyWithPlaceholderKey}`)
                                  : undefined
                              }
                              color={
                                (formik.touched.endpoints as any)?.[index]?.url &&
                                (formik.errors.endpoints as any)?.[index]?.url
                                  ? "failure"
                                  : "gray"
                              }
                            />
                            {(formik.touched.endpoints as any)?.[index]?.url &&
                              (formik.errors.endpoints as any)?.[index]?.url && (
                                <p className="mt-1 text-sm text-red-500">
                                  {(formik.errors.endpoints as any)[index].url}
                                </p>
                              )}
                          </div>
                          <div className="w-full shrink-0 md:w-32">
                            <Label className="text-gray-700 dark:text-gray-300">
                              {t("project.create.endpointSpecMethod")}
                            </Label>
                            <Select
                              sizing="sm"
                              className="mt-1"
                              value={formik.values.endpoints[index]?.method ?? "GET"}
                              onChange={(e) => formik.setFieldValue(`endpoints.${index}.method`, e.target.value)}
                              onBlur={() => formik.setFieldTouched(`endpoints.${index}.method`, true)}
                            >
                              {HTTP_METHODS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </Select>
                          </div>
                          <div className="w-full shrink-0 md:w-52">
                            <Label className="text-gray-700 dark:text-gray-300">
                              {t("project.create.endpointSpecAuth")}
                            </Label>
                            <Select
                              sizing="sm"
                              className="mt-1"
                              value={formik.values.endpoints[index]?.auth_with ? "with" : "without"}
                              onChange={(e) => formik.setFieldValue(`endpoints.${index}.auth_with`, e.target.value === "with")}
                            >
                              <option value="with">{t("project.create.endpointAuthWith")}</option>
                              <option value="without">{t("project.create.endpointAuthWithout")}</option>
                            </Select>
                          </div>
                        </div>
                        {renderFieldsTable(index, spec.requestParamFields, "request_params", "endpointRequestParams")}
                        {renderFieldsTable(index, spec.requestBodyFields, "request_body", "endpointRequestBody")}
                        {renderFieldsTable(index, spec.responseBodyFields, "response_body", "endpointResponseBody")}
                      </div>
                    </AccordionContent>
                  </AccordionPanel>
                ))}
              </Accordion>
            </div>

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
                {t("common.update")}
              </Button>
            </div>
          </form>
          )}

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

export default EditProject;
