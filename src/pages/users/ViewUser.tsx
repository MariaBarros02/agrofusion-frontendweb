/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "flowbite-react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  deleteUserService,
  getExternalProjects,
  getUserDetailsService,
} from "../../services/agrofusion/auth.service";
import type { ListUserResponse } from "../../dto/response/listUsers-response.dto";
import {
  handleChangeUserStatusEP,
  handleGetUserByEmailEP,
} from "../../services/orchestrator/userOrchestrator.services";
import ToastSimple, { type ToastData } from "../../components/layout/ToastSimple";
import { projectsLinks } from "../../services/orchestrator/authOrchestrator.service";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";

const ViewUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [userDetails, setUserDetails] = useState<ListUserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("es-CO");
  };

  const getUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetailsService(userId || "");
      setUserDetails(response);
    } catch (error) {
      console.log(error);
      setError("Error al cargar detalles de usuario");
    } finally {
      setLoading(false);
    }
  };

const deleteUser = async () => {

  try {
    await deleteUserService(userId || "");
  } catch (error) {
    console.log(error)
    setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          messageKey: "viewUser.errorUserAdministrator",
          messageParams: {},
          type:  "error",
        },
      ]);
    return;
  }
  try {
    setLoading(true);
    
    const data = await getExternalProjects();

    const { users: externalUsersResponse, errors: getUserErrors } =
      await handleGetUserByEmailEP(
        userDetails?.email || "",
        data,
      );

    // Mostrar errores de búsqueda externa
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

    // Cambiar estado externo
    const changeResults = await Promise.all(
      Object.entries(externalUsersResponse).map(([service, user]) =>
        handleChangeUserStatusEP(
          {
            user_id: user.id,
            new_status: 3,
          },
          data.filter((p) => p.instance_code === service),
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

    

    getUserDetails();
  } catch (error) {
    console.log(error);
    setError("Error al eliminar usuario");
  } finally {
    setLoading(false);
    setDeletingUser(false);
  }
};
  useEffect(() => {
    if (userId) {
      getUserDetails();
    }
  }, [userId]);

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  if (!canAccessModule("ADMINISTRATION")) {
    return (
      <AppLayoutSB>
        <TitleTarget title="viewUser.title" description="viewUser.description" />
        <ModuleInactive />
      </AppLayoutSB>
    );
  }

  return (
    <AppLayoutSB>
      <TitleTarget title="viewUser.title" description="viewUser.description" />
      {loading && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("viewUser.loading")}</p>{" "}
        </div>
      )}{" "}
      {error && (
        <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("viewUser.error")}</p>{" "}
        </div>
      )}{" "}
      {!loading && !error && !deletingUser && userDetails && (
        <div className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
          <div className="flex justify-between mt-6">
            <h1 className="text-xl font-bold">
              {t("viewUser.generalInformation")}
            </h1>
            <Button
              onClick={() => navigate("/administration/users")}
              color="alternative"
            >
              {t("viewUser.goBack")}
            </Button>
          </div>
          <div className="p-4 py-10 mt-2 font-semibold border dark:border-gray-600 rounded-2xl">
            <div className="justify-between text-sm md:grid-cols-2 md:grid">
              <div>
                <p className="font-bold text-gray-500">{t("viewUser.code")}</p>
                <p>{userDetails?.user_id}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500">{t("viewUser.name")}</p>
                <p>{userDetails?.name}</p>
              </div>
            </div>
            <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid ">
              <div>
                <p className="font-bold text-gray-500">{t("viewUser.email")}</p>
                <p>{userDetails?.email}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500 ">{t("viewUser.role")}</p>
                <p>{userDetails?.rol}</p>
              </div>
            </div>
            <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid">
              <div>
                <p className="font-bold text-gray-500">{t("viewUser.state")}</p>
                <p>{t(`common.${userDetails?.state.toLowerCase()}`)}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewUser.createdAt")}
                </p>
                <p>{formatDate(userDetails?.created_at ?? "")}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-3">
            <Button
              onClick={() => navigate(`/administration/users/edit-user/${userId}`)}
              color="alternative"
            >
              {t("viewUser.editUser")}
            </Button>
            <Button
              disabled={userDetails?.state == "DELETED"}
              onClick={() => setDeletingUser(true)}
              color="red"
            >
              {t("viewUser.deleteUser")}
            </Button>
          </div>
        </div>
      )}
      {deletingUser && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-10 bg-white border h-[calc(100vh-130px)]  dark:bg-gray-700 dark:border-gray-600 rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-4 p-16 px-0 text-center bg-white border dark:bg-gray-700 dark:border-gray-600 rounded-2xl">
            <h2 className="text-2xl font-bold">
              {t("viewUser.deleteUserQuestion")}
            </h2>
            <p className="text-gray-700 dark:text-white md:w-2/3">
              {t("viewUser.deleteFDescription")}{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {userDetails?.name}.
              </span>{" "}
               {t("viewUser.deleteSDescription")}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                color="alternative"
                onClick={() => setDeletingUser(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                disabled={userDetails?.state == "DELETED"}
                color="red"
                onClick={() => deleteUser()}
              >
                {t("viewUser.confirmDeleted")}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed z-50 flex flex-col gap-3 top-4 right-4">
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

export default ViewUser;
