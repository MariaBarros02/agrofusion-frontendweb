/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import ToastSimple, {
  type ToastData,
} from "../../components/layout/ToastSimple";
import { Button, Label, Select, TextInput } from "flowbite-react";
import type { ListUserResponse } from "../../dto/response/listUsers-response.dto";
import {
  getExternalProjects,
  getUserDetailsService,
} from "../../services/agrofusion/auth.service";
import type { ExternalProject } from "../../dto/shared/external-project.dto";
import { handleGetUserByEmailEP } from "../../services/orchestrator/userOrchestrator.services";
import { projectsLinks } from "../../services/orchestrator/authOrchestrator.service";
import * as yup from "yup";
import { useFormik } from "formik";
interface EditValues {
  name: string;
  firstLastName: string;
  secondLastName: string;
  gender?: number;
  state?: string;
  rol?: string;
}
const STATUS_VOCABULARY: Record<number, string> = {
  1: "ACTIVE",
  2: "INACTIVE",
  3: "DELETED",
};

const mapStatusToText = (status?: number | string) => {
  if (!status) return "";

  if (typeof status === "number") {
    return STATUS_VOCABULARY[status] || "";
  }

  // Si ya viene como string válido
  if (["ACTIVE", "INACTIVE", "DELETED"].includes(status)) {
    return status;
  }

  return "";
};

const EditSchema = (t: any, hasExternal: boolean) =>
  yup.object({
    name: yup.string().required(t("validation.completedField")),
    rol: hasExternal
      ? yup.string().required(t("validation.completedField"))
      : yup.string().nullable(),
    state: yup.string().required(t("validation.completedField")),
    firstLastName: hasExternal
      ? yup.string().required(t("validation.completeField"))
      : yup.string().nullable(),
    secondLastName: hasExternal
      ? yup.string().required(t("validation.completeField"))
      : yup.string().nullable(),
    gender: hasExternal
      ? yup.number().required(t("validation.completeField"))
      : yup.number().nullable(),
  });
const EditUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [userDetails, setUserDetails] = useState<ListUserResponse | null>(null);
  const [projects, setProjects] = useState<ExternalProject[] | undefined>(
    undefined,
  );
  const [fieldsProjects, setFieldsProjects] = useState(false);

  const [externalUsers, setExternalUsers] = useState<Record<string, any> | null>(null);
  const getUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetailsService(userId || "");
      setUserDetails(response);
      const data = await getExternalProjects();
      setProjects(data);
    } catch (error) {
      console.log(error);
      setError("Error al cargar detalles de usuario");
    }
  };
  useEffect(() => {
    if (userId) {
      getUserDetails();
    }
  }, [userId]);

useEffect(() => {
  if (projects && userDetails) {
    getExternalUsers();
  }
}, [projects, userDetails]);

useEffect(() => {
  if (!userDetails) return;

  const hasExternal =
    externalUsers && Object.keys(externalUsers).length > 0;

  const agrofusionState = mapStatusToText(userDetails.state);

  if (hasExternal) {
    const firstProjectKey = Object.keys(externalUsers!)[0];
    const firstProjectUser = externalUsers![firstProjectKey];

    formik.setValues({
      name: firstProjectUser.name || "",
      rol: userDetails.rol || "",
      state: agrofusionState, 
      firstLastName: firstProjectUser.first_last_name || "",
      secondLastName: firstProjectUser.second_last_name || "",
      gender: firstProjectUser.gender_id || undefined,
    });
  } else {
    formik.setValues({
      name: userDetails.name || "",
      rol: userDetails.rol || "",
      state: agrofusionState,
      firstLastName: "",
      secondLastName: "",
      gender: undefined,
    });
  }
}, [userDetails, externalUsers]);

const getExternalUsers = async () => {
  try {
    setLoading(true);

    const { users: externalUsersResponse, errors: getUserErrors } =
      await handleGetUserByEmailEP(userDetails?.email || "", projects);

    console.log("ExternalUsers:", externalUsersResponse);

    if (
      externalUsersResponse &&
      Object.keys(externalUsersResponse).length > 0
    ) {
      setExternalUsers(externalUsersResponse);
    } else {
      setExternalUsers(null);
    }

    getUserErrors.forEach((err) => {
      const link = projectsLinks[err.project];

      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: err.messageKey,
          messageParams: err.messageParams,
          type: err.type ?? "error",
          ...(link ?? {}),
        },
      ]);
    });
  } catch (error) {
    console.log(error);
    setError("Error al eliminar usuario");
  } finally {
    setLoading(false);
  }
};

  const initialValues = {
    name: "",
    firstLastName: "",
    secondLastName: "",
    gender: undefined,
    rol: "",
    state: "",
  };

  const formik = useFormik<EditValues>({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: EditSchema(t, !!externalUsers),
    onSubmit: async (values) => {
      console.log(values);
    },
  });

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

  return (
    <AppLayoutSB>
      <TitleTarget title="editUser.title" />
      {loading && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("editUser.loading")}</p>{" "}
        </div>
      )}{" "}
      {error && (
        <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("editUser.error")}</p>{" "}
        </div>
      )}{" "}
      {!loading && !error && (
        <div className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
          <div className="flex justify-between mt-6">
            <h1 className="text-xl font-bold">
              {t("editUser.editInformation")}
            </h1>
            <div></div>
            <Button
              onClick={() => navigate("/administration/users")}
              color="alternative"
            >
              {t("editUser.goBack")}
            </Button>
          </div>
          <div className="p-4 py-10 mt-2 font-semibold border dark:border-gray-600 rounded-2xl">
            <form>
              <div className="gap-5 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                <div className="w-full">
                  <div className="block mb-2">
                    <Label htmlFor="name">{t("editUser.name")}*</Label>
                  </div>
                  <TextInput
                    id="name"
                    type="text"
                    sizing="sm"
                    placeholder={t("editUser.namePlaceholder")}
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
                {externalUsers && (
                  <>
                <div className="w-full">
                  <div className="block mb-2">
                    <Label htmlFor="firstLastName">
                      {t("editUser.first")} {t("editUser.lastName")}*
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
                      {t("editUser.second")} {t("editUser.lastName")}*
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
                </>
                )}
              </div>
              <div className="gap-5 mt-3 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                {externalUsers && (
                <div className="w-full">
                  <div className="block mb-2">
                    <Label htmlFor="gender">{t("editUser.gender")}</Label>
                  </div>
                  <Select
                    id="gender"
                    required
                    sizing="sm"
                    {...formik.getFieldProps("gender")}
                    color={
                      formik.touched.gender && formik.errors.gender
                        ? "failure"
                        : "gray"
                    }
                  >
                    <option value="" disabled>
                      {t("editUser.placeholderGender")}
                    </option>
                    <option value="1">{t("common.masculine")}</option>
                    <option value="2">{t("common.feminine")}</option>
                  </Select>
                  {displayError("gender")}
                </div>
                )}
                <div className="w-full">
                  <div className="block mb-2">
                    <Label htmlFor="state">{t("editUser.state")}</Label>
                  </div>
                  <Select
                    id="state"
                    required
                    sizing="sm"
                    {...formik.getFieldProps("state")}
                    color={
                      formik.touched.state && formik.errors.state
                        ? "failure"
                        : "gray"
                    }
                  >
                    <option value="" disabled>
                      {t("editUser.placeholderState")}
                    </option>
                    <option value="ACTIVE">{t("common.active")}</option>
                    <option value="INACTIVE">{t("common.inactive")}</option>
                    <option value="DELETED">{t("common.deleted")}</option>
                  </Select>
                  {displayError("state")}
                </div>
                <div className="w-full">
                  <div className="block mb-2">
                    <Label htmlFor="rol">{t("editUser.role")}</Label>
                  </div>
                  <Select
                    id="rol"
                    required
                    sizing="sm"
                    {...formik.getFieldProps("rol")}
                    color={
                      formik.touched.rol && formik.errors.rol
                        ? "failure"
                        : "gray"
                    }
                  >
                    <option value="SIN ROL">{t("editUser.noRole")}</option>
                    <option value="1">{t("common.active")}</option>
                    <option value="2">{t("common.inactive")}</option>
                  </Select>
                  {displayError("rol")}
                </div>
              </div>
            </form>
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <Button onClick={() => navigate(`/administration/users/${userId}`)} color="alternative">
              {t("common.cancel")}
            </Button>
            <Button onClick={() => setDeletingUser(true)} color="blue">
              {t("editUser.saveChange")}
            </Button>
          </div>
        </div>
      )}

      <div className="fixed z-50 flex flex-col gap-3 bottom-4 right-4">
  {toasts.map((toast) => (
    <ToastSimple
      key={toast.id}
      messageKey={toast.messageKey}
      messageParams={toast.messageParams}
      type={toast.type}
      to={toast.to}
      linkText={toast.linkText}
      onClose={() =>
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }
    />
  ))}
</div>
    </AppLayoutSB>
  );
};

export default EditUser;
