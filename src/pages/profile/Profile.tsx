/* eslint-disable @typescript-eslint/no-explicit-any */
import ProfileView from "./ProfileView";
import ModalEditProfile from "./ModalEditProfile";
import { useState, useEffect } from "react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import type { ListUserResponse } from "../../dto/response/listUsers-response.dto";
import type { ExternalProject } from "../../dto/shared/external-project.dto";
import type { ToastData } from "../../components/layout/ToastSimple";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/auth.store";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  changeFDoubleAService,
  changePasswordService,
  editProfileService,
  getExternalProjects,
  getProfileService,
} from "../../services/agrofusion/auth.service";
import {
  handleChangePasswordEP,
  handleEditUserProfileEP,
  handleGetUserByEmailEP,
} from "../../services/orchestrator/userOrchestrator.services";
import { projectsLinks } from "../../services/orchestrator/authOrchestrator.service";
import TitleTarget from "../../components/layout/TitleTarget";
import ToastSimple from "../../components/layout/ToastSimple";
import ModalChangePassword from "./ModalChangePassword";
import AlertSimple, { type AlertState } from "../../components/layout/AlertSimple";

const documentTypes = {
  DISRIEGO: {
    1: "C.C",
    2: "T.I",
    3: "C.E",
  },
  SIGMA: {
    1: "Registro civil",
    2: "Tarjeta de identidad",
    3: "Cédula de ciudadanía",
    4: "Tarjeta de extranjería",
    5: "Cédula de extranjería",
    6: "NIT",
    7: "Pasaporte",
    8: "Documento de identificación extranjero",
    9: "PEP",
    10: "NIT otro país",
    11: "NUIP",
  },
};
const Profile = () => {
  const [modalEdit, setModalEdit] = useState(false);
  const [modalChangePass, setModalChangePass] = useState(false);

  const [userDetails, setUserDetails] = useState<ListUserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [projects, setProjects] = useState<ExternalProject[] | undefined>(
    undefined,
  );
  
const [alert, setAlert] = useState<AlertState>(null);
  const [isUpdatingMFA, setIsUpdatingMFA] = useState(false);

  const [externalUsers, setExternalUsers] = useState<Record<
    string,
    any
  > | null>(null);
  const firstExternalUser = externalUsers
    ? externalUsers[Object.keys(externalUsers)[0]]
    : null;

  const hasExternal = !!firstExternalUser;
useEffect(() => {
  if (modalChangePass) {
    formikChangePassword.setStatus(null);
    
  }
}, [modalChangePass]);
  const { t } = useTranslation();

  const userId = useAuthStore((state) => state.id);

  const profileValidationSchema = Yup.object().shape({
    name: Yup.string()
      .required("validation.completeField")
      .min(3, "validation.nameMin"),

    first_last_name: Yup.string().when("hasExternal", {
      is: true,
      then: (schema) => schema.required("validation.completeField"),
    }),

    second_last_name: Yup.string().nullable(),

    document_number: Yup.string().required("validation.completeField"),

    gender_id: Yup.number().when("hasExternal", {
      is: true,
      then: (schema) => schema.required("validation.completeField"),
    }),

    birthday: Yup.date().when("hasExternal", {
      is: true,
      then: (schema) => schema.required("validation.completeField"),
    }),

    date_issuance_document: Yup.date().when("hasExternal", {
      is: true,
      then: (schema) => schema.required("validation.completeField"),
    }),
  });

  const handleCloseChangePassword = () => {
  formikChangePassword.resetForm()
  formikChangePassword.setStatus(null);
  setModalChangePass(false);
};

 const handleCloseModalEdit = () => {
  formikEdit.resetForm()
  setModalEdit(false);
};
  const changePasswordSchema = Yup.object({
    old_password: Yup.string().required("validation.completeField"),

    new_password: Yup.string()
      .min(12, t("validation.passwordMin", { min: 12 }))
      .required(t("validation.completeField"))
      .matches(/[a-z]/, t("validation.passwordLowercase"))
      .matches(/[A-Z]/, t("validation.passwordUppercase"))
      .matches(/\d/, t("validation.passwordNumber"))
      .matches(
        /[!@#$%^&*()_\-+=.{};:'",<>/?\\|]/,
        t("validation.passwordSpecialCharacter"),
      ),

    confirm_password: Yup.string()
      .required("validation.completeField")
      .oneOf([Yup.ref("new_password")], "validation.passwordsMustMatch"),
  });

  const showSuccessToast = () => {
    setToasts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        messageKey: "profile.editSuccess",
        type: "success",
      },
    ]);
  };

   
  const formikEdit = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: hasExternal
        ? (firstExternalUser?.name ?? "")
        : (userDetails?.name ?? ""),

      first_last_name: firstExternalUser?.first_last_name ?? "",
      second_last_name: firstExternalUser?.second_last_name ?? "",

      type_document_id: firstExternalUser?.type_document_id ?? "",
      document_number: userDetails?.identity_number ?? "",

      birthday: firstExternalUser?.birthday?.split("T")[0] ?? "",
      date_issuance_document:
        firstExternalUser?.date_issuance_document?.split("T")[0] ?? "",

      gender_id: firstExternalUser?.gender_id ?? "",

      hasExternal: hasExternal,
    },

    validationSchema: profileValidationSchema,

    onSubmit: async (values) => {
        if (!formikEdit.dirty) {
          setAlert({message: "profile.noChanges",
          type: "warning"})
          return;
        }
      await handleSaveProfile(values);
      getUserDetails();
    },
  });

  const formikChangePassword = useFormik({
    initialValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },

    validationSchema: changePasswordSchema,

    onSubmit: async (values, { resetForm }) => {
  const success = await handleChangePassword(values);
  if (success) resetForm();
}
  });
  const handleSaveProfile = async (values: any) => {
    if (!userId) return;

    setLoading(true);

    try {
      /* ===========================
       1️ ACTUALIZAR CORE
    ============================ */

      await editProfileService(
        userId,
        firstExternalUser
          ? values.name +
              " " +
              values.first_last_name +
              " " +
              values.second_last_name
          : values.name,
        values.document_number,
      );
      /* ===========================
       2️ SI NO HAY EXTERNOS
    ============================ */

      if (!projects || !userDetails?.email) {
        showSuccessToast();
        setModalEdit(false);
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
        setModalEdit(false);
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
      setModalEdit(false);
    } catch (error) {
      console.log(error);
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "profile.editFailed",
          type: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  
  const handleToggleMFA = async (newValue: boolean) => {
    if (!userId || !userDetails) return;
    
    setIsUpdatingMFA(true);
    try {
      console.log(userId)
      await changeFDoubleAService(userId, newValue);
      
      setUserDetails(prev => prev ? { ...prev, mfa_active: newValue } : null);
      
      setAlert({
        type: "success",
        message: "profile.mfaUpdateSuccess"
      });
    } catch (error) {
      console.log(error);
      setAlert({
        type: "error",
        message: "profile.mfaUpdateError"
      });
    } finally {
      setIsUpdatingMFA(false);
    }
  };
const handleChangePassword = async (values: {
  old_password: string;
  new_password: string;
  confirm_password: string;
}) => {
  if (!userId) return;


  try {
    const payload = {
      old_password: values.old_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    };

    /* ===========================
       1️⃣ CAMBIO CORE
    ============================ */

    await changePasswordService(userId, payload);

    /* ===========================
       2️⃣ SIN PROYECTOS EXTERNOS
    ============================ */

    if (!projects || !userDetails?.email) {
      showSuccessToast();
      return;
    }

    /* ===========================
       3️⃣ EXTERNOS
    ============================ */

    const { users: externalUsersResponse } =
      await handleGetUserByEmailEP(userDetails.email, projects);

    if (!externalUsersResponse) {
      setModalChangePass(false);
      setAlert({
  message: "profile.changePasswordSuccess",
  type: "success",
});
      return;
    }

    await Promise.all(
      Object.entries(externalUsersResponse).map(([service, user]) =>
        handleChangePasswordEP(
          payload,
          user.id,
          projects.filter((p) => p.instance_code === service),
        ),
      ),
    );
setModalChangePass(false);
   setAlert({
  message: "profile.changePasswordSuccess",
  type: "success",
});

     return true;
  } catch (error: any) {
    console.log(error);

    const backendCode = error?.response?.data?.detail?.code;
    if (backendCode) {
      formikChangePassword.setStatus({
        type: "error",
        messageKey: `errors.${backendCode}`,
      });
      return;
    }

    formikChangePassword.setStatus({
      type: "error",
      messageKey: "profile.passwordChangeFailed",
    });
     return false;
  } 
};
  const firstProjectKey = externalUsers ? Object.keys(externalUsers)[0] : null;
  const formatDate = (date?: string | null) => {
    if (!date) return "";

    return new Date(date)
      .toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replaceAll("/", "-");
  };
  const formatGender = (genderId?: number) => {
    if (genderId === 1) return "Masculino";
    if (genderId === 2) return "Femenino";
    return "";
  };

  const formatDocumentType = (typeId?: number) => {
    if (!typeId || !firstProjectKey) return "";

    const projectDocs =
      documentTypes[firstProjectKey as keyof typeof documentTypes];
    return projectDocs?.[typeId as keyof typeof projectDocs] ?? "";
  };
  const getUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getProfileService(userId || "");
      setUserDetails(response);
      const data = await getExternalProjects();
      setProjects(data);
    } catch (error) {
      console.log(error);
      setError("Error al cargar detalles de usuario");
    }finally{
      setLoading(false)
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userDetails) return;


  }, [userDetails, externalUsers]);

  return (
    <>
      <AppLayoutSB>
        <TitleTarget title="profile.title" description="profile.description" />
        {loading && (
          <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
            {" "}
            <p className="text-3xl font-bold">{t("profile.loading")}</p>{" "}
          </div>
        )}{" "}
        {error && (
          <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
            {" "}
            <p className="text-3xl font-bold">{t("profile.error")}</p>{" "}
          </div>
        )}{" "}
        {!loading && !error && (
          <>
            <ProfileView
              t={t}
              userDetails={userDetails}
              firstExternalUser={firstExternalUser}
              mfaActive={userDetails?.mfa_active ?? false}
              hasExternal={hasExternal}
              formatDate={formatDate}
              formatGender={formatGender}
              formatDocumentType={formatDocumentType}
              onEdit={() => setModalEdit(true)}
              onChangePassword={() => setModalChangePass(true)}
              onToggleMFA={handleToggleMFA}
              isUpdatingMFA={isUpdatingMFA}

            />

            <ModalEditProfile
              show={modalEdit}
              onClose={handleCloseModalEdit}
              formik={formikEdit}
              t={t}
              hasExternal={hasExternal}
              firstExternalUser={firstExternalUser}
              userDetails={userDetails}
            />


          </>
        )}
                    <ModalChangePassword
              show={modalChangePass}
              onClose={handleCloseChangePassword}
              formik={formikChangePassword}
              t={t}
            />
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
    onClose={() => {setAlert(null)
    }}
  />
)}
      </AppLayoutSB>
    </>
  );
};

export default Profile;
