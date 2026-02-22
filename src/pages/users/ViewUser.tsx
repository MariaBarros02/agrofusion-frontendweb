import { Button } from "flowbite-react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteUserService, getUserDetailsService } from "../../services/agrofusion/auth.service";
import type { ListUserResponse } from "../../dto/response/listUsers-response.dto";

const ViewUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [userDetails, setUserDetails] = useState<ListUserResponse | null>(null)
  const [loading, setLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("es-CO");
  };


  const getUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetailsService(userId || "")
      setUserDetails(response);
    } catch (error) {
      console.log(error)
      setError("Error al cargar detalles de usuario")
    }
    finally {
      setLoading(false);
    }
  }

  const deleteUser = async () => {
    try {
      setLoading(true);
      await deleteUserService(userId || '');
      
      getUserDetails();
      
    } catch (error) {
      console.log(error)
      setError("Error al eliminar usuario")
    }
    finally {
      setLoading(false);
      setDeletingUser(false);
    }
  }

  
  useEffect(() => {
    if (userId) {
      getUserDetails();
    }
  }, [userId]);
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
          <p className="text-3xl font-bold">{t("viewUser.loading")}</p>{" "}
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
            <div >
              <p className="font-bold text-gray-500">{t("viewUser.code")}</p>
              <p>{userDetails?.user_id}</p>
            </div>
            <div >
              <p className="font-bold text-gray-500">{t("viewUser.name")}</p>
              <p>{userDetails?.name}</p>
            </div>
          </div>
          <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid ">
            <div >
              <p className="font-bold text-gray-500">{t("viewUser.email")}</p>
              <p>{userDetails?.email}</p>
            </div>
            <div >
              <p className="font-bold text-gray-500 ">{t("viewUser.role")}</p>
              <p>{userDetails?.rol}</p>
            </div>
          </div>
          <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid">
            <div >
              <p className="font-bold text-gray-500">{t("viewUser.state")}</p>
              <p>{t(`common.${userDetails?.state.toLowerCase()}`)}</p>
            </div>
            <div >
              <p className="font-bold text-gray-500">{t("viewUser.createdAt")}</p>
              <p>{formatDate(userDetails?.created_at ?? "")}</p>
              
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-3">
            <Button onClick={()=> navigate(`/administration/edit-user/`)} color="alternative" >{t("viewUser.editUser")}</Button>
            <Button disabled={userDetails?.state == 'DELETED'} onClick={()=> setDeletingUser(true)} color="red" >{t("viewUser.deleteUser")}</Button>

        </div>
      </div>
      )}
      { deletingUser && (
        <div className="flex flex-col items-center justify-center py-10 bg-white border h-[calc(100vh-130px)]  dark:bg-gray-700 dark:border-gray-600 rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-4 p-16 px-0 text-center bg-white border dark:bg-gray-700 dark:border-gray-600 rounded-2xl">
            <h2 className="text-2xl font-bold">{t("viewUser.deleteUserQuestion")}</h2>
          <p className="text-gray-700 md:w-2/3">{t("viewUser.deleteFDescription")} <span className="font-bold text-gray-900">{userDetails?.name}</span> . {t("viewUser.deleteSDescription")}</p>
          <div className="flex gap-3">
          <Button type="button" color="alternative" onClick={() => setDeletingUser(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="button" disabled={userDetails?.state == 'DELETED'}  color="red" onClick={()=> deleteUser()}>
            {t("viewUser.confirmDeleted")}
          </Button>
          </div>
          </div>
        </div>
      )}
      
    </AppLayoutSB>
  );
};

export default ViewUser;
