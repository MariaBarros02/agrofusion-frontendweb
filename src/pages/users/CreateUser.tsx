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
import { getExternalProjects } from "../../services/agrofusion/auth.service";
import ToastSimple from "../../components/layout/ToastSimple";
import { handleGetRolesEP } from "../../services/orchestrator/userOrchestrator.services";

interface ProjectRole {
  role_id: number;
  role_name: string;
}

/*Estructura de datos para el formulario de inicio de sesión.
 */
interface RegisterValues {
  name: string;
  firstLastName: string;
  secondLastName?: string;
  typeDocument: number | null;
  documentNumber: number | null;
  dateIssuanceDoc: Date | null;
  birthday: Date | null;
  genderId: number | null;
  roles: number[];
  rolesByProject: Record<string, number[]>;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Esquema de validación dinámico.
 * Recibe la función 't' para localizar los mensajes de error.
 */
const RegisterSchema = (
  t: (key: string, options?: any) => string,
): yup.ObjectSchema<RegisterValues> =>
  yup.object({
    name: yup.string().required(t("validation.completeField")),

    firstLastName: yup.string().required(t("validation.completeField")),

    secondLastName: yup.string(),

    typeDocument: yup.number().required(t("validation.completeField")),

    documentNumber: yup.number().required(t("validation.completeField")),

    dateIssuanceDoc: yup
      .date()
      .nullable()
      .required(t("validation.completeField")),

    birthday: yup.date().nullable().required(t("validation.completeField")),

    genderId: yup.number().required(t("validation.completeField")),

    roles: yup
      .array()
      .of(yup.number().required())
      .required(t("validation.completeField")),
    rolesByProject: yup
      .object()
      .test(
        "at-least-one-role",
        t("validation.completeField"),
        (value) =>
          value &&
          Object.values(value).some(
            (roles) => Array.isArray(roles) && roles.length > 0,
          ),
      ),
    email: yup
      .string()
      .email(t("validation.emailInvalid"))
      .required(t("validation.completeField")),

    password: yup
      .string()
      .min(10, t("validation.passwordMin", { min: 10 }))
      .required(t("validation.completeField")),

    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("validation.passwordsMustMatch"))
      .required(t("validation.completeField")),
  });

const CreateUser = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ExternalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Lista de notificaciones activas en pantalla */
  const [toast, setToast] = useState<ToastData[]>([]);

  const [rolesByProject, setRolesByProject] = useState<
    Record<string, ProjectRole[]>
  >({});

  const buildInitialRoles = (projects: ExternalProject[]) =>
    projects.reduce<Record<string, number[]>>((acc, p) => {
      acc[p.instance_code] = [];
      return acc;
    }, {});

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

const rolesFetchedRef = useRef(false);

useEffect(() => {
  if (projects.length === 0) return;
  if (rolesFetchedRef.current) return;

  rolesFetchedRef.current = true;
  fetchProjectRoles(projects);
}, [projects]);

   /** Inicialización de Formik para la gestión del formulario.
   */
  const formik = useFormik<RegisterValues>({
    initialValues: {
      name: "",
      firstLastName: "",
      secondLastName: "",
      typeDocument: null,
      documentNumber: null,
      dateIssuanceDoc: null,
      birthday: null,
      genderId: null,
      roles: [],
      rolesByProject: buildInitialRoles(projects),
      email: "",
      password: "",
      confirmPassword: "",
    },
    enableReinitialize: true,
    validationSchema: RegisterSchema(t),
    onSubmit: async (values) => {
      // try {

      //   const userExist = await 
      //   // setGlobalError(null);
      //   // setPasswordError(null);
      //   // const response = await loginService(values.email, values.password);
      //   // // Flujo A: Requiere Segundo Factor
      //   // if (response.mfa_required) {
      //   //   setStep("mfa");
      //   //   return;
      //   // }
      //   // // Flujo B: Acceso directo
      //   // loginStore.login(
      //   //   response.access_token ?? "",
      //   //   response.refresh_token ?? ""
      //   // );
      //   // navigate("/dashboard");
      //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // } catch (error: any) {
      //   // console.log(error);
      //   // const data = error?.response?.data;
      //   // const code = data?.detail.code as AuthErrorCode;
      //   // const meta = data?.detail.meta;
      //   // setRetryAfter(null);
      //   // if (code === "AUTH_USER_BLOCKED" && meta?.retry_after_seconds) {
      //   //   setRetryAfter(meta.retry_after_seconds);
      //   // }
      //   // handleAuthError(code ?? "AUTH_GENERIC");
      // }
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
      <div className="p-4 bg-white border shadow-sm rounded-2xl">
        <div className="my-5">
          <h1 className="text-xl font-bold ">{t("createUser.title")}</h1>
          <p className="text-sm text-gray-700">{t("createUser.description")}</p>
        </div>
        <form>
          <div className="gap-5 md:flex">
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
                  formik.touched.name && formik.errors.name ? "failure" : "gray"
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
                  formik.touched.firstLastName && formik.errors.firstLastName
                    ? "failure"
                    : "gray"
                }
              />
              {displayError("firstLastName")}
            </div>
            <div className="w-full">
              <div className="block mb-2">
                <Label htmlFor="secondLastName">
                  {t("createUser.second")} {t("createUser.lastName")}
                </Label>
              </div>
              <TextInput
                id="secondLastName"
                sizing="sm"
                type="text"
                required
                {...formik.getFieldProps("secondLastName")}
                color={
                  formik.touched.secondLastName && formik.errors.secondLastName
                    ? "failure"
                    : "gray"
                }
              />
              {displayError("secondLastName")}
            </div>
          </div>

          <div className="flex gap-5 mt-2">
            <div className="w-full">
              <div className="block mb-2">
                <Label htmlFor="typeDocument">
                  {t("createUser.typeDocNumber")}*
                </Label>
              </div>
              <Select
                id="typeDocument"
                required
                defaultValue=""
                
                sizing="sm"
                {...formik.getFieldProps("typeDocument")}
                color={
                  formik.touched.typeDocument && formik.errors.typeDocument
                    ? "failure"
                    : "gray"
                }
              >
                <option value="" disabled>
                  {t("createUser.placeholderTypDoc")}
                </option>
                <option value="1">{t("common.civilReg")}</option>
                <option value="2">{t("common.identTarget")}</option>
                <option value="3">{t("common.ID")}</option>
                <option value="4">{t("common.foreingerTar")}</option>
                <option value="5">{t("common.foreingerID")}</option>
                <option value="6">{t("common.nit")}</option>
                <option value="7">{t("common.passport")}</option>
                <option value="8">{t("common.forID")}</option>
                <option value="9">{t("common.pep")}</option>
                <option value="10">{t("common.nitOtherCountry")}</option>
                <option value="11">{t("common.nuip")}</option>
              </Select>
              {displayError("typeDocument")}
            </div>
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
                  formik.touched.documentNumber && formik.errors.documentNumber
                    ? "failure"
                    : "gray"
                }
              />
              {displayError("documentNumber")}
            </div>
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
          </div>

          <div className="flex gap-5 mt-2">
            <div className="w-full">
              <div className="block mb-2">
                <Label htmlFor="birthday">{t("createUser.birthday")}*</Label>
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
                <Label htmlFor="genderId">{t("createUser.gender")}*</Label>
              </div>
              <Select
                id="genderId"
                required
                defaultValue=""
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
                <option value="3">{t("common.other")}</option>
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
                defaultValue=""
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
                <option value="active">{t("common.active")}</option>
                <option value="inactive">{t("common.inactive")}</option>
              </Select>
              {displayError("roles")}
            </div>
          </div>
          <div className="flex gap-5 mt-2">
            {projects.map((project) => (
              <div key={project.external_project_id} className="w-full ">
                <Label className="block mb-1 font-semibold">
                  {t("createUser.role")} – {project.instance_code}
                </Label>

                <Select
                  sizing="sm"
                  value={(
                    formik.values.rolesByProject[project.instance_code] ?? []
                  ).map(String)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (o) => Number(o.value),
                    );

                    formik.setFieldValue(
                      `rolesByProject.${project.instance_code}`,
                      selected,
                    );
                  }}
                >
                  <option disabled value="">
                    {t("createUser.placeholderRole")}
                  </option>

                  {(rolesByProject[project.instance_code] ?? []).map((role) => (
                    <option className="capitalize" key={role.role_id} value={String(role.role_name)}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
          <div className="gap-5 mt-2 md:flex">
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
                <Label htmlFor="password">{t("createUser.password")}*</Label>
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
          <div className="flex justify-end gap-3 mt-3">
            <Button color="alternative" onClick={handleCancel}>
              {t("common.cancel")}
            </Button>
            <Button color="blue" disabled={isButtonDisabled}>
               {formik.isSubmitting ? t("createUser.loadUserRegister"): t("createUser.userRegister") } <MdKeyboardArrowRight size={25} />
            </Button>
          </div>
        </form>
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
