import { useState, useEffect } from "react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { ListPermissionsResponse } from "../../dto/response/listPermissions-response.dto";
import { Button } from "flowbite-react";
import { getDetailsPermissionService } from "../../services/agrofusion/auth.service";

const PermissionsView = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { permId } = useParams<{ permId: string }>();
  const [permDetails, setPermDetails] =
    useState<ListPermissionsResponse | null>(null);
  const navigate = useNavigate();

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

  return (
    <AppLayoutSB>
      <TitleTarget
        title="viewPermission.title"
        description="viewPermission.description"
      />
      {loading && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          {" "}
          <p className="text-3xl font-bold">
            {t("viewPermission.loading")}
          </p>{" "}
        </div>
      )}{" "}
      {error && (
        <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("viewPermission.error")}</p>{" "}
        </div>
      )}{" "}
      {!loading && !error && permDetails && (
        <div className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
          <div className="flex justify-between mt-3">
            <h1 className="text-xl font-bold">
              {t("viewPermission.generalInformation")}
            </h1>
            <Button
              onClick={() => navigate("/administration/permissions")}
              color="alternative"
            >
              {t("viewPermission.goBack")}
            </Button>
          </div>
          <div className="p-4 py-5 mt-2 font-semibold border dark:border-gray-600 rounded-2xl">
            <div className="justify-between text-sm md:grid-cols-2 md:grid">
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewPermission.id")}
                </p>
                <p>{permDetails?.permission_id}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewPermission.code")}
                </p>
                <p>{permDetails?.code}</p>
              </div>
            </div>
            <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid ">
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewPermission.name")}
                </p>
                <p>{permDetails?.name}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500 ">
                  {t("viewPermission.descriptionDetail")}
                </p>
                <p>{permDetails?.description}</p>
              </div>
            </div>
            <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid">
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewPermission.state")}
                </p>
                <p>{t(`common.${permDetails?.state.toLowerCase()}`)}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewPermission.type")}
                </p>
                <p>{permDetails?.type}</p>
              </div>
            </div>
            <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid">
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewPermission.module")}
                </p>
                <p>{permDetails?.module}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewPermission.submodule")}
                </p>
                <p>{permDetails?.submodule}</p>
              </div>
            </div>
            <div className="justify-between mt-5 text-sm md:grid-cols-2 md:grid">
              <div>
                <p className="font-bold text-gray-500">
                  {t("viewPermission.action")}
                </p>
                <p>{t(`common.${permDetails?.action?.toLowerCase()}`)}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-3">
            <Button
              onClick={() =>
                navigate(`/administration/permissions/edit-perm/${permId}`)
              }
              color="alternative"
            >
              {t("viewPermission.editPermission")}
            </Button>
          </div>
        </div>
      )}
    </AppLayoutSB>
  );
};

export default PermissionsView;
