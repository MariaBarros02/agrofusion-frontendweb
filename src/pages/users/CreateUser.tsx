/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Label, Select, TextInput } from "flowbite-react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { useFormik } from "formik";
import { useEffect, useState, useRef } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import type { ExternalProject } from "../../dto/shared/external-project.dto";
import type { ToastData } from "../../components/layout/ToastSimple";
import ToastSimple from "../../components/layout/ToastSimple";
import { useMemo } from "react";
import {
  createUserService,
  getBasicListRolesService,
  getExternalProjects,
  userExistsService,
} from "../../services/agrofusion/auth.service";
import {
  handleCreateUserEP,
  handleGetRolesEP,
  handleGetTypeDocumentsEP,
  projectsLinks,
} from "../../services/orchestrator/userOrchestrator.services";
import type { createUserRequest } from "../../dto/request/createUser-request.dto";
import { useNavigate } from "react-router-dom";
import { FiUserCheck } from "react-icons/fi";
import type { ListBasicRole } from "../../dto/response/listBasicRoles-response.dto";
interface ProjectRole {
  role_id: number;
  role_name: string;
}

interface ProjectTypeDocument {
  id: number;
  name: string;
}

/*Estructura de datos para el formulario de inicio de sesión.
 */
interface RegisterValues {
  name: string;
  firstLastName: string;
  secondLastName: string;
  typeDocumentByProject: Record<string, string>;
  documentNumber: string;
  dateIssuanceDoc: string;
  birthday: string;
  genderId: string | null;
  roles: string | null;
  rolesByProject: Record<string, number[]>;
  email: string;
  password: string;
  confirmPassword: string;
}

const toDate = (value?: string | null) =>
  value ? new Date(value + "T00:00:00") : null;

const CreateUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [existUserError, setExistUserError] = useState<boolean | null>(null);
  const [userCreate, setUserCreate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ExternalProject[]>([]);

  /** Lista de notificaciones activas en pantalla */
  const [toast, setToast] = useState<ToastData[]>([]);
  const [basicRoles, setBasicRoles] = useState<ListBasicRole[]>([]);

  const [rolesByProject, setRolesByProject] = useState<
    Record<string, ProjectRole[]>
  >({});

  const [typeDocsByProject, setTypeDocsByProject] = useState<
    Record<string, ProjectTypeDocument[]>
  >({});

  const buildInitialRoles = (projects: ExternalProject[]) =>
    projects.reduce<Record<string, number[]>>((acc, p) => {
      acc[p.instance_code] = [];
      return acc;
    }, {});

  const buildInitialTypeDocs = (projects: ExternalProject[]) =>
    projects.reduce<Record<string, string>>((acc, p) => {
      acc[p.instance_code] = "";
      return acc;
    }, {});

  const initialRolesByProject = useMemo(
    () => buildInitialRoles(projects),
    [projects],
  );

  const initialTypeDocsByProject = useMemo(
    () => buildInitialTypeDocs(projects),
    [projects],
  );

  /**
   * Esquema de validación dinámico.
   * Recibe la función 't' para localizar los mensajes de error.
   */
  const hasProjects = projects.length > 0;
  const RegisterSchema = (
    t: (key: string, options?: any) => string,
    hasProjects: boolean,
  ): yup.ObjectSchema<RegisterValues> =>
    yup.object({
      name: yup.string().required(t("validation.completeField")),

      firstLastName: yup
        .string()
        .default("")
        .test(
          "required-if-projects",
          t("validation.completeField"),
          (value) => {
            if (!hasProjects) return true;
            return !!value;
          },
        ),

      secondLastName: yup
        .string()
        .default("")
        .test(
          "required-if-projects",
          t("validation.completeField"),
          (value) => {
            if (!hasProjects) return true;
            return !!value;
          },
        ),

      typeDocumentByProject: yup
        .object<Record<string, string>>()
        .default({})
        .test(
          "each-project-has-type-doc",
          t("validation.completeField"),
          (value) => {
            if (!hasProjects) return true;
            if (!value) return false;
            return Object.values(value).every((v) => !!v);
          },
        ),

      dateIssuanceDoc: yup
        .string()
        .default("")
        .test(
          "required-if-projects",
          t("validation.completeField"),
          (value) => {
            if (!hasProjects) return true;
            return !!value;
          },
        ),

      birthday: yup
        .string()
        .default("")
        .test(
          "required-if-projects",
          t("validation.completeField"),
          (value) => {
            if (!hasProjects) return true;
            return !!value;
          },
        ),

      genderId: yup
        .string()
        .default("")
        .test(
          "required-if-projects",
          t("validation.completeField"),
          (value) => {
            if (!hasProjects) return true;
            return !!value;
          },
        ),

      rolesByProject: yup
        .object<Record<string, number[]>>()
        .default({})
        .test(
          "each-project-has-at-least-one-role",
          t("validation.completeField"),
          (value) => {
            if (!hasProjects) return true;
            if (!value) return false;
            return Object.values(value).every(
              (roles) => Array.isArray(roles) && roles.length > 0,
            );
          },
        ),

      documentNumber: yup
        .string()
        .max(10, t("validation.documentNumberMax", { max: 10 }))
        .required(t("validation.completeField")),

      roles: yup.string().required(t("validation.completeField")),

      email: yup
        .string()
        .email(t("validation.emailInvalid"))
        .required(t("validation.completeField")),

      password: yup
        .string()
        .min(12, t("validation.passwordMin", { min: 12 }))
        .required(t("validation.completeField")),

      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], t("validation.passwordsMustMatch"))
        .required(t("validation.completeField")),
    });
  const getBasicRoles = async () => {
    try {
      const response = await getBasicListRolesService();
      setBasicRoles(response);
    } catch (error) {
      console.error("Error loading basic roles", error);
    }
  };

  useEffect(() => {
    getBasicRoles();
  }, []);

  useEffect(() => {
    /**
     * Obtiene los proyectos externos activos.
     */
    const getProjects = async () => {
      try {
        setLoading(true);
        const data = await getExternalProjects();
        console.log(data);
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

  const rolesFetchedRef = useRef(false);
  const typeDocsFetchedRef = useRef(false);

  useEffect(() => {
    if (projects.length === 0) return;
    if (rolesFetchedRef.current) return;
    rolesFetchedRef.current = true;
    fetchProjectRoles(projects);
    typeDocsFetchedRef.current = true;
    fetchProjectTypeDocs(projects);
  }, [projects]);

  /** Inicialización de Formik para la gestión del formulario.
   */
  const initialValues = useMemo<RegisterValues>(
    () => ({
      name: "",
      firstLastName: "",
      secondLastName: "",
      typeDocumentByProject: initialTypeDocsByProject,
      documentNumber: "",
      dateIssuanceDoc: "",
      birthday: "",
      genderId: "",
      roles: "",
      rolesByProject: initialRolesByProject,
      email: "",
      password: "",
      confirmPassword: "",
    }),
    [initialRolesByProject, initialTypeDocsByProject],
  );
  const formik = useFormik<RegisterValues>({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: RegisterSchema(t, hasProjects),
    onSubmit: async (values) => {
      setExistUserError(null);

      try {
        /* =========================================================
          VALIDAR SI EL USUARIO YA EXISTE
    ========================================================== */
        const userExist = await userExistsService(
          values.email,
          values.documentNumber?.toString() || "",
        );

        if (userExist) {
          setExistUserError(true);

          formik.setFieldError("email", t("createUser.userAlreadyExists"));
          formik.setFieldError(
            "documentNumber",
            t("createUser.userAlreadyExists"),
          );

          formik.setFieldTouched("email", true, false);
          formik.setFieldTouched("documentNumber", true, false);

          setToast((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: "error",
              messageKey: "createUser.userAlreadyExists",
            },
          ]);

          return;
        }

        if (projects.length === 0) {
          // Crear usuario solo en AgroFusion (sin externos)

          const createUserPayload: createUserRequest = {
            name:
              values.name +
              " " +
              values.firstLastName +
              " " +
              values.secondLastName,
            email: values.email,
            password: values.password,
            role_id: values.roles || "",
            confirm_password: values.confirmPassword,
            identity_number: values.documentNumber.toString(),
            tokens: {},
          };

          const user = await createUserService(createUserPayload);

          setToast((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: "success",
              messageKey: "createUser.userCreatedSuccessfully",
            },
          ]);
          setUserCreate(user);

          return;
        }

        /* =========================================================
       CONSTRUIR USUARIO BASE
    ========================================================== */
        const baseUser = {
          name: values.name,
          first_last_name: values.firstLastName,
          second_last_name: values.secondLastName,
          document_number: String(values.documentNumber),
          date_issuance_document: new Date(values.dateIssuanceDoc),
          birthday: new Date(values.birthday),
          gender_id: Number(values.genderId),
          email: values.email,
          password: values.password,
        };

        /* =========================================================
       CONSTRUIR USUARIOS POR PROYECTO
    ========================================================== */
        const usersByProject = projects.reduce((acc, project) => {
          acc[project.instance_code] = {
            ...baseUser,
            type_document_id: Number(
              values.typeDocumentByProject[project.instance_code],
            ),
            roles: values.rolesByProject[project.instance_code] ?? [],
          };

          return acc;
        }, {} as any);

        /* =========================================================
       CREAR USUARIO EN SISTEMAS EXTERNOS
    ========================================================== */
        const result = await handleCreateUserEP(usersByProject, projects);

        /* =========================================================
       MOSTRAR ERRORES POR SERVICIO (NEGOCIO)
    ========================================================== */
        if (result.errors.length > 0) {
          result.errors.forEach((err) => {
            const link = projectsLinks[err.project];

            setToast((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                type: err.type ?? "error",
                messageKey: err.messageKey,
                messageParams: err.messageParams,
                ...(link ?? {}),
              },
            ]);
          });
        }

        /* =========================================================
        SI NO HUBO TOKENS → CREACIÓN FALLÓ TOTALMENTE
    ========================================================== */
        const hasTokens = Object.keys(result.tokens).length > 0;

        if (!hasTokens) {
          return;
        }

        /* =========================================================
        ÉXITO → USAR TOKENS (LO QUE NECESITES)
    ========================================================== */

        const createUserPayload: createUserRequest = {
          name:
            values.name +
            " " +
            values.firstLastName +
            " " +
            values.secondLastName,
          email: values.email,
          password: values.password,
          role_id: values.roles || "",
          confirm_password: values.confirmPassword,
          identity_number: values.documentNumber.toString(),
          tokens: result.tokens,
        };
        const user = await createUserService(createUserPayload);
        setUserCreate(user);

        /* =========================================================
        TOAST DE ÉXITO GENERAL
    ========================================================== */
        // if(user){

        // }
        setToast((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "success",
            messageKey: "createUser.userCreatedSuccessfully",
          },
        ]);
      } catch (error: any) {
        setToast((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "error",
            messageKey: error?.messageKey || "createUser.errorCreatingUser",
            messageParams: error?.messageParams,
          },
        ]);
      }
    },
  });
  /** Helper para renderizar errores de validación local (Yup) */
  const displayError = (name: keyof RegisterValues) => {
    const touched = formik.touched[name];
    const error = formik.errors[name];

    if (!touched || !error) return null;

    if (typeof error === "string") {
      return <p className="mt-1 text-sm text-red-500">{error}</p>;
    }

    return null;
  };

  const handleCancel = () => {
    formik.resetForm();
  };

  const fetchProjectRoles = async (projects: ExternalProject[]) => {
    try {
      const { roles, errors } = await handleGetRolesEP(projects);

      setRolesByProject(roles);

      if (errors.length > 0) {
        setToast((prev) => [
          ...prev,
          ...errors.map((e) => ({
            id: crypto.randomUUID(),
            type: e.type ?? "error",
            messageKey: e.messageKey,
            messageParams: e.messageParams,
            to: e.to,
            linkText: e.linkText,
          })),
        ]);
      }
    } catch (err) {
      console.log(err);
      setToast([
        {
          id: crypto.randomUUID(),
          type: "error",
          messageKey: "createUser.errorLoadingRoles",
        },
      ]);
    }
  };

  const fetchProjectTypeDocs = async (projects: ExternalProject[]) => {
    try {
      const { typeDocuments, errors } =
        await handleGetTypeDocumentsEP(projects);

      setTypeDocsByProject(typeDocuments);

      if (errors.length > 0) {
        setToast((prev) => [
          ...prev,
          ...errors.map((e) => ({
            id: crypto.randomUUID(),
            type: e.type ?? "error",
            messageKey: e.messageKey,
            messageParams: e.messageParams,
          })),
        ]);
      }
    } catch (err) {
      console.log(err);
      setToast([
        {
          id: crypto.randomUUID(),
          type: "error",
          messageKey: "createUser.errorLoadingTypeDocs",
        },
      ]);
    }
  };

  const generatePassword = () => {
    const base = "agrofusion";

    // Mezclar mayúsculas y minúsculas
    const mixedBase = base
      .split("")
      .map((char) =>
        Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase(),
      )
      .join("");

    const separator = Math.random() > 0.5 ? "." : "_";

    const numbers = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 10),
    ).join("");

    return `${mixedBase}${separator}${numbers}`;
  };
  const isButtonDisabled = formik.isSubmitting;
  return (
    <AppLayoutSB>
      <TitleTarget title="users.title" description="users.description" />

      <div className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <div className={!userCreate ? "block mb-5" : "hidden mb-5"}>
          <h1 className="text-xl font-bold ">{t("createUser.title")}</h1>
          <p className="text-sm text-gray-700">{t("createUser.description")}</p>
        </div>
        <form className={userCreate ? "hidden" : "block"}>
          <fieldset disabled={loading}>
            {!hasProjects ? (
              /* ===============================
     🔹 FORMULARIO SIMPLE (sin proyectos)
     =============================== */
              <>
                {/* Nombre completo */}
                <div className="gap-5 md:grid md:grid-cols-2">
                  <div className="w-full">
                    <Label htmlFor="name">{t("createUser.name")}*</Label>
                    <TextInput
                      id="name"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("name")}
                    />
                  </div>

                  <div className="w-full">
                    <Label htmlFor="documentNumber">
                      {t("createUser.documentNumber")}*
                    </Label>
                    <TextInput
                      id="documentNumber"
                      type="number"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("documentNumber")}
                    />
                  </div>
                </div>

                {/* Email + Rol */}
                <div className="gap-5 mt-2 md:grid md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">{t("createUser.email")}*</Label>
                    <TextInput
                      id="email"
                      type="email"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("email")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="roles">{t("createUser.role")}*</Label>
                    <Select
                      id="roles"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("roles")}
                    >
                      <option value="" disabled>
                        {t("createUser.placeholderRole")}
                      </option>
                      {basicRoles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Password */}
                <div className="gap-5 mt-2 md:grid md:grid-cols-2">
                  <div className="w-full">
                    <div className="block ">
                      <Label htmlFor="password">
                        {t("createUser.password")}*
                      </Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <TextInput
                        className="w-full"
                        id="password"
                        type="text"
                        sizing="sm"
                        required
                        {...formik.getFieldProps("password")}
                        color={
                          formik.touched.password && formik.errors.password
                            ? "failure"
                            : "gray"
                        }
                      />
                      <Button
                        type="button"
                        color="alternative"
                        onClick={() => {
                          const password = generatePassword();

                          formik.setFieldValue("password", password);
                        }}
                      >
                        {t("createUser.regenerate")}
                      </Button>
                    </div>

                    {displayError("password")}
                    <p className="text-xs text-black dark:text-white">
                      {t("createUser.helperPassword")}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      {t("createUser.confirmPassword")}*
                    </Label>
                    <TextInput
                      id="confirmPassword"
                      type="text"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("confirmPassword")}
                      color={
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                          ? "failure"
                          : "gray"
                      }
                    />
                  </div>
                  {displayError("confirmPassword")}
                </div>
              </>
            ) : (
              /* ===============================
     🔹 FORMULARIO COMPLETO (con proyectos)
     =============================== */
              <>
                {" "}
                <div className="gap-5 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="name">{t("createUser.name")}*</Label>
                    </div>
                    <TextInput
                      id="name"
                      type="text"
                      sizing="sm"
                      placeholder={t("createUser.namePlaceholder")}
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
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="firstLastName">
                        {t("createUser.first")} {t("createUser.lastName")}*
                      </Label>
                    </div>
                    <TextInput
                      id="firstLastName"
                      type="text"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("firstLastName")}
                      color={
                        formik.touched.firstLastName &&
                        formik.errors.firstLastName
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("firstLastName")}
                  </div>
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="secondLastName">
                        {t("createUser.second")} {t("createUser.lastName")}*
                      </Label>
                    </div>
                    <TextInput
                      id="secondLastName"
                      sizing="sm"
                      type="text"
                      required
                      {...formik.getFieldProps("secondLastName")}
                      color={
                        formik.touched.secondLastName &&
                        formik.errors.secondLastName
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("secondLastName")}
                  </div>
                </div>
                <div className="gap-5 mt-2 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                  {projects.map((project) => (
                    <div key={project.instance_code} className="w-full">
                      <Label className="block mb-2">
                        {t("createUser.typeDocNumber")} –{" "}
                        {project.instance_code}*
                      </Label>

                      <Select
                        sizing="sm"
                        value={
                          formik.values.typeDocumentByProject[
                            project.instance_code
                          ] || ""
                        }
                        onChange={(e) =>
                          formik.setFieldValue(
                            `typeDocumentByProject.${project.instance_code}`,
                            e.target.value,
                          )
                        }
                      >
                        <option value="" disabled>
                          {t("createUser.placeholderTypDoc")}
                        </option>

                        {(typeDocsByProject[project.instance_code] ?? []).map(
                          (doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name}
                            </option>
                          ),
                        )}
                      </Select>
                    </div>
                  ))}
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="documentNumber">
                        {t("createUser.documentNumber")}*
                      </Label>
                    </div>
                    <TextInput
                      id="documentNumber"
                      type="number"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("documentNumber")}
                      color={
                        formik.touched.documentNumber &&
                        formik.errors.documentNumber
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("documentNumber")}
                  </div>
                </div>
                <div className="flex gap-2 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] mt-2">
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="dateIssuanceDoc">
                        {t("createUser.dateIssuanceDoc")}*
                      </Label>
                    </div>
                    <TextInput
                      id="dateIssuanceDoc"
                      sizing="sm"
                      type="date"
                      required
                      {...formik.getFieldProps("dateIssuanceDoc")}
                      color={
                        formik.touched.dateIssuanceDoc &&
                        formik.errors.dateIssuanceDoc
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("dateIssuanceDoc")}
                  </div>
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="birthday">
                        {t("createUser.birthday")}*
                      </Label>
                    </div>
                    <TextInput
                      id="birthday"
                      sizing="sm"
                      type="date"
                      required
                      {...formik.getFieldProps("birthday")}
                      color={
                        formik.touched.birthday && formik.errors.birthday
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("birthday")}
                  </div>
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="genderId">
                        {t("createUser.gender")}*
                      </Label>
                    </div>
                    <Select
                      id="genderId"
                      required
                      sizing="sm"
                      {...formik.getFieldProps("genderId")}
                      color={
                        formik.touched.genderId && formik.errors.genderId
                          ? "failure"
                          : "gray"
                      }
                    >
                      <option value="" disabled>
                        {t("createUser.placeholderGender")}
                      </option>
                      <option value="1">{t("common.masculine")}</option>
                      <option value="2">{t("common.feminine")}</option>
                    </Select>
                    {displayError("genderId")}
                  </div>
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="roles">{t("createUser.role")}*</Label>
                    </div>
                    <Select
                      id="roles"
                      required
                      sizing="sm"
                      {...formik.getFieldProps("roles")}
                      color={
                        formik.touched.roles && formik.errors.roles
                          ? "failure"
                          : "gray"
                      }
                    >
                      <option value="" disabled>
                        {t("createUser.placeholderRole")}
                      </option>

                      {basicRoles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.name}
                        </option>
                      ))}
                    </Select>
                    {displayError("roles")}
                  </div>
                </div>
                <div className="flex gap-5 mt-2 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] ">
                  {projects.map((project) => (
                    <div key={project.external_project_id} className="w-full ">
                      <Label className="block mb-2 font-semibold">
                        {t("createUser.role")} – {project.instance_code}
                      </Label>

                      <div className="flex flex-col w-full h-24 gap-2 overflow-auto">
                        {(rolesByProject[project.instance_code] ?? []).map(
                          (role) => {
                            const checked = formik.values.rolesByProject[
                              project.instance_code
                            ]?.includes(role.role_id);

                            return (
                              <label
                                key={role.role_id}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  className="dark:bg-transparent"
                                  onChange={(e) => {
                                    const currentRoles =
                                      formik.values.rolesByProject[
                                        project.instance_code
                                      ] ?? [];

                                    const updatedRoles = e.target.checked
                                      ? [...currentRoles, role.role_id]
                                      : currentRoles.filter(
                                          (id) => id !== role.role_id,
                                        );

                                    formik.setFieldValue(
                                      `rolesByProject.${project.instance_code}`,
                                      updatedRoles,
                                    );
                                  }}
                                />
                                <span className="text-sm capitalize">
                                  {role.role_name}
                                </span>
                              </label>
                            );
                          },
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="gap-5 mt-2 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="email">{t("createUser.email")}*</Label>
                    </div>
                    <TextInput
                      id="email"
                      type="email"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("email")}
                      color={
                        formik.touched.email && formik.errors.email
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("email")}
                  </div>

                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="password">
                        {t("createUser.password")}*
                      </Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <TextInput
                        className="w-full"
                        id="password"
                        type="text"
                        sizing="sm"
                        required
                        {...formik.getFieldProps("password")}
                        color={
                          formik.touched.password && formik.errors.password
                            ? "failure"
                            : "gray"
                        }
                      />
                      <Button
                        type="button"
                        color="alternative"
                        onClick={() => {
                          const password = generatePassword();

                          formik.setFieldValue("password", password);
                        }}
                      >
                        {t("createUser.regenerate")}
                      </Button>
                    </div>

                    {displayError("password")}
                    <p className="text-xs text-black dark:text-white">
                      {t("createUser.helperPassword")}
                    </p>
                  </div>
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="confirmPassword">
                        {t("createUser.confirmPassword")}*
                      </Label>
                    </div>
                    <TextInput
                      id="confirmPassword"
                      type="text"
                      sizing="sm"
                      required
                      {...formik.getFieldProps("confirmPassword")}
                      color={
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("confirmPassword")}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 mt-3">
              <Button color="alternative" onClick={handleCancel}>
                {t("common.cancel")}
              </Button>
              <Button
                color="blue"
                disabled={isButtonDisabled}
                onClick={() => formik.handleSubmit()}
              >
                {formik.isSubmitting
                  ? t("createUser.loadUserRegister")
                  : t("createUser.userRegister")}{" "}
                <MdKeyboardArrowRight size={25} />
              </Button>
            </div>
          </fieldset>
        </form>
        {userCreate && (
          <div className="flex flex-col items-center justify-center h-full gap-2 m-auto text-center">
            <FiUserCheck size={100} className="text-green-500 " />
            <p className="text-2xl font-bold">
              {t("createUser.successMessage")}
            </p>
            <p className="text-sm text-gray-700">
              {t("createUser.successMessageDetails")}
            </p>
            <Button
              className="mt-2"
              color="dark"
              onClick={() => navigate("/administration/users")}
            >
              {t("createUser.goToUsers")}
            </Button>
          </div>
        )}
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
    </AppLayoutSB>
  );
};

export default CreateUser;
