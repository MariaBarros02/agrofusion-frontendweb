/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import ToastSimple, {
  type ToastData,
} from "../../components/layout/ToastSimple";
import { Button, Label, Select, TextInput } from "flowbite-react";
import type { ListUserResponse } from "../../dto/response/listUsers-response.dto";
import {
  editUserService,
  getBasicListRolesService,
  getExternalProjects,
  getUserDetailsService,
} from "../../services/agrofusion/auth.service";
import type { ExternalProject } from "../../dto/shared/external-project.dto";
import {
  handleChangeUserStatusEP,
  handleEditUserProfileEP,
  handleGetUserByEmailEP,
} from "../../services/orchestrator/userOrchestrator.services";
import { projectsLinks } from "../../services/orchestrator/authOrchestrator.service";
import * as yup from "yup";
import { useFormik } from "formik";
import type { AlertState } from "../../components/layout/AlertSimple";
import AlertSimple from "../../components/layout/AlertSimple";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";
import { FiSave } from "react-icons/fi";
import type { ListBasicRole } from "../../dto/response/listBasicRoles-response.dto";
interface EditValues {
  name: string;
  first_last_name: string;
  second_last_name: string;
  document_number: string;
  birthday?: string;
  date_issuance_document?: string;
  gender_id?: number;
  state?: string;
  rol?: string;
}
const STATUS_VOCABULARY: Record<number, string> = {
  1: "ACTIVE",
  2: "INACTIVE",
  3: "DELETED",
  4: "PENDING"
};

const mapStatusToText = (status?: number | string) => {
  if (!status) return "";

  if (typeof status === "number") {
    return STATUS_VOCABULARY[status] || "";
  }

  // Si ya viene como string válido
  if (["ACTIVE", "INACTIVE", "DELETED", "PENDING"].includes(status)) {
    return status;
  }

  return "";
};

const getStatusNumber = (statusText: string) => {
  const entry = Object.entries(STATUS_VOCABULARY).find(
    ([, value]) => value === statusText,
  );
  return entry ? Number(entry[0]) : undefined;
};

const EditSchema = (t: any, hasExternal: boolean) =>
  yup.object({
    name: yup.string().required(t("validation.completeField")),

    state: yup.string().required(t("validation.completeField")),

    rol: yup.string().required(t("validation.completeField")),

    first_last_name: hasExternal
      ? yup.string().required(t("validation.completeField"))
      : yup.string().nullable(),

    second_last_name: hasExternal
      ? yup.string().required(t("validation.completeField"))
      : yup.string().nullable(),

    gender_id: hasExternal
      ? yup.number().required(t("validation.completeField"))
      : yup.number().nullable(),

    document_number: yup.string().required(t("validation.completeField")),

    birthday: hasExternal
      ? yup.string().required(t("validation.completeField"))
      : yup.string().nullable(),

    date_issuance_document: hasExternal
      ? yup.string().required(t("validation.completeField"))
      : yup.string().nullable(),
  });

const EditUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [userDetails, setUserDetails] = useState<ListUserResponse | null>(null);
  const [projects, setProjects] = useState<ExternalProject[] | undefined>(
    undefined,
  );
  const isAdmin =
  userId === "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const [basicRoles, setBasicRoles] = useState<ListBasicRole[]>([]);
  

  const [alert, setAlert] = useState<AlertState>(null);

  const [externalLoaded, setExternalLoaded] = useState(false);
  const [externalUsers, setExternalUsers] = useState<Record<
    string,
    any
  > | null>(null);

  const firstExternalUser = externalUsers
    ? externalUsers[Object.keys(externalUsers)[0]]
    : null;

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

  const getFormValues = (
    userDetails: any,
    externalUsers: any,
    externalLoaded: any,
  ) => {
    if (!userDetails || !externalLoaded) {
      return {
        name: "",
        first_last_name: "",
        second_last_name: "",
        gender_id: undefined,
        rol: undefined,
        state: "",
        document_number: "",
        birthday: "",
        date_issuance_document: "",
      };
    }

    const hasExternal = externalUsers && Object.keys(externalUsers).length > 0;
    const agrofusionState = mapStatusToText(userDetails.state);

    if (hasExternal) {
      const firstProjectKey = Object.keys(externalUsers)[0];
      const firstUser = externalUsers[firstProjectKey];

      return {
        name: firstUser.name || "",
        rol: String(userDetails.rol_id || ""), // Asegurar que coincida con los values del Select
        document_number: userDetails.identity_number || "",
        state: agrofusionState,
        birthday: firstUser.birthday?.split("T")[0] || "",
        date_issuance_document:
          firstUser.date_issuance_document?.split("T")[0] || "",
        first_last_name: firstUser.first_last_name || "",
        second_last_name: firstUser.second_last_name || "",
        gender_id: firstUser.gender_id || "",
      };
    }

    return {
      name: userDetails.name || "",
      rol: String(userDetails.rol || ""),
      document_number: userDetails.identity_number || "",
      birthday: "",
      state: agrofusionState,
      first_last_name: "",
      second_last_name: "",
      gender_id: "",
      date_issuance_document: "",
    };
  };
  const dynamicInitialValues = getFormValues(
    userDetails,
    externalUsers,
    externalLoaded,
  );
  const getExternalUsers = async () => {
    try {
      setLoading(true);

      const { users: externalUsersResponse, errors: getUserErrors } =
        await handleGetUserByEmailEP(userDetails?.email || "", projects);

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
      setExternalLoaded(true);
    }
  };
  const showSuccessToast = () => {
    setToasts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        messageKey: "editUser.editSuccess",
        type: "success",
      },
    ]);
  };

  const formik = useFormik<EditValues>({
    initialValues: dynamicInitialValues,
    enableReinitialize: true,
    validationSchema: EditSchema(t, !!externalUsers),
    onSubmit: async (values) => {
      if (!formik.dirty) {
        setAlert({ message: "editUser.noChanges", type: "warning" });
        return;
      }
      console.log(values)
      await handleSaveProfile(values);
    },
  });

  const handleSaveProfile = async (values: any) => {
    if (!userId) return;

    try {
      /* ===========================
         1️ ACTUALIZAR CORE
      ============================ */
      await editUserService(
        userId,
        firstExternalUser
          ? values.name +
              " " +
              values.first_last_name +
              " " +
              values.second_last_name
          : values.name,
        values.document_number,
        values.state,
        values.rol,
      );
      /* ===========================
         2️ SI NO HAY EXTERNOS
      ============================ */

      if (!projects || !userDetails?.email) {
        showSuccessToast();
        setAlert({
          message: "editUser.editSuccess",
          type: "success",
          to: `/administration/users/${userDetails?.user_id}`,
        });
        return;
      }

      /* ===========================
         3️ BUSCAR USUARIOS EXTERNOS
      ============================ */

      const { users: externalUsersResponse, errors: getUserErrors } =
        await handleGetUserByEmailEP(userDetails.email, projects);

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

      if (!externalUsersResponse) {
        showSuccessToast();

        return;
      }

      /* ===========================
         4️ PAYLOAD EXTERNO
      ============================ */

      const editResults = await Promise.all(
        Object.entries(externalUsersResponse).map(([service, user]) => {
          const externalPayload = {
            name: values.name,
            first_last_name: values.first_last_name,
            second_last_name: values.second_last_name,
            document_number: values.document_number,
            type_document_id: user.type_document_id,
            date_issuance_document: values.date_issuance_document,
            birthday: values.birthday,
            gender_id: Number(values.gender_id),
            roles: user.roles ?? [],
          };

          return handleEditUserProfileEP(
            externalPayload,
            user.id,
            projects.filter((p) => p.instance_code === service),
          );
        }),
      );

      console.log(editResults);

      /* ===========================
         6️ TOAST ERRORES
      ============================ */

      editResults.forEach(({ errors }) => {
        console.log(errors);
        errors.forEach((err) => {
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
      });

      const newStatusNumber = getStatusNumber(values.state);

      const changeResults = await Promise.all(
        Object.entries(externalUsersResponse).map(([service, user]) =>
          handleChangeUserStatusEP(
            {
              user_id: user.id,
              new_status: newStatusNumber || 1,
            },
            projects.filter((p) => p.instance_code === service),
          ),
        ),
      );
      // Mostrar errores de cambio de estado
      changeResults.forEach(({ errors }) => {
        errors.forEach((err) => {
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
      });

      showSuccessToast();
      setAlert({
        message: "editUser.editSuccess",
        type: "success",
        to: `/administration/users/${userDetails?.user_id}`,
      });
    } catch (error) {
      console.log(error);
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "editUser.editFailed",
          type: "error",
        },
      ]);
    }
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

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  if (!canAccessModule("ADMINISTRATION")) {
    return (
      <AppLayoutSB>
        <TitleTarget title="editUser.title" />
        <ModuleInactive />
      </AppLayoutSB>
    );
  }

  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore((s) => s.canAccessSubmodule);
  if (!canAccessSubmodule("USERS")) {
    return (
      <AppLayoutSB>
        <TitleTarget title="editUser.title" />
        <SubmoduleInactive />
      </AppLayoutSB>
    );
  }

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

          <form onSubmit={formik.handleSubmit}>
            <div className="p-4 py-10 mt-2 font-semibold border dark:border-gray-600 rounded-2xl">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
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
                        <Label htmlFor="first_last_name">
                          {t("editUser.first")} {t("editUser.lastName")}*
                        </Label>
                      </div>
                      <TextInput
                        id="first_last_name"
                        type="text"
                        sizing="sm"
                        required
                        {...formik.getFieldProps("first_last_name")}
                        color={
                          formik.touched.first_last_name &&
                          formik.errors.first_last_name
                            ? "failure"
                            : "gray"
                        }
                      />
                      {displayError("first_last_name")}
                    </div>
                    <div className="w-full">
                      <div className="block mb-2">
                        <Label htmlFor="second_last_name">
                          {t("editUser.second")} {t("editUser.lastName")}*
                        </Label>
                      </div>
                      <TextInput
                        id="second_last_name"
                        sizing="sm"
                        type="text"
                        required
                        {...formik.getFieldProps("second_last_name")}
                        color={
                          formik.touched.second_last_name &&
                          formik.errors.second_last_name
                            ? "failure"
                            : "gray"
                        }
                      />
                      {displayError("second_last_name")}
                    </div>
                  </>
                )}
                {externalUsers && (
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="document_number">
                        {t("editUser.documentNumber")}
                      </Label>
                    </div>
                    <TextInput
                      id="document_number"
                      type="text"
                      sizing="sm"
                      {...formik.getFieldProps("document_number")}
                      color={
                        formik.touched.document_number &&
                        formik.errors.document_number
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("document_number")}
                  </div>
                )}
                {externalUsers && (
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="gender">{t("editUser.gender")}</Label>
                    </div>
                    <Select
                      id="gender"
                      required
                      sizing="sm"
                      {...formik.getFieldProps("gender_id")}
                      color={
                        formik.touched.gender_id && formik.errors.gender_id
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
                    {displayError("gender_id")}
                  </div>
                )}
                {externalUsers && (
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="birthday">{t("editUser.birthday")}</Label>
                    </div>
                    <TextInput
                      id="birthday"
                      type="date"
                      sizing="sm"
                      {...formik.getFieldProps("birthday")}
                      color={
                        formik.touched.birthday && formik.errors.birthday
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("birthday")}
                  </div>
                )}

                {externalUsers && (
                  <div className="w-full">
                    <div className="block mb-2">
                      <Label htmlFor="date_issuance_document">
                        {t("editUser.dateIssuanceDoc")}
                      </Label>
                    </div>
                    <TextInput
                      id="date_issuance_document"
                      type="date"
                      sizing="sm"
                      {...formik.getFieldProps("date_issuance_document")}
                      color={
                        formik.touched.date_issuance_document &&
                        formik.errors.date_issuance_document
                          ? "failure"
                          : "gray"
                      }
                    />
                    {displayError("date_issuance_document")}
                  </div>
                )}
                {!isAdmin  && (
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
                      {
                        userDetails?.state === "PENDING" && (
                           <option value="PENDING">{t("common.pending")}</option>
                        )
                      }
                    </Select>
                    {displayError("state")}
                  </div>
                )}
                {!isAdmin && (
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
                        {basicRoles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.name}
                        </option>
                      ))}
                    </Select>
                    {displayError("rol")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-3">
              <Button
                onClick={() => navigate(`/administration/users/${userId}`)}
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
                      message: "editUser.noChanges",
                      type: "warning",
                    });
                    return;
                  }
                  formik.handleSubmit();
                }}
              >
                 <FiSave size={22} className="mr-1" />
                {t("editUser.saveChange")}
              </Button>
            </div>
          </form>
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

export default EditUser;
