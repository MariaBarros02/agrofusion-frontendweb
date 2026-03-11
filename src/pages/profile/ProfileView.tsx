/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ToggleSwitch } from "flowbite-react";
import { BiEdit } from "react-icons/bi";


interface Props {
  t: any;
  userDetails: any;
  firstExternalUser: any;
  mfaActive: boolean;
  hasExternal: boolean;
  formatDate: (d?: string | null) => string;
  formatGender: (g?: number) => string;
  formatDocumentType: (t?: number) => string;
  onEdit: () => void;
  onChangePassword: () => void;
  onToggleMFA: (newValue: boolean) => void; 
  isUpdatingMFA?: boolean;

}

export default function ProfileView({
  t,
  userDetails,
  firstExternalUser,
  mfaActive,
  hasExternal,
  formatDate,
  formatGender,
  formatDocumentType,
  onEdit,
  onChangePassword,
  onToggleMFA,
  isUpdatingMFA = false,

}: Props) {
 

  return (
   
    <div className="p-4 m-0 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
      <div className="flex items-center justify-between gap-3 ">
        <p className="text-xl font-bold">{t("profile.personalInformation")}</p>
        {hasExternal && (
          <Button onClick={() => onEdit()} color="alternative">
            <BiEdit size={22} className="mr-1" />
            {t("profile.edit")}
          </Button>
        )}
      </div>
      <div className="grid items-center justify-between grid-cols-2 gap-3 mt-5">
        <div className="mt-5">
          <p className="text-lg font-bold">{t("profile.name")}</p>
          <p>{userDetails?.name}</p>
        </div>
        <div className="mt-5">
          <p className="text-lg font-bold">{t("profile.role")}</p>
          <p>{userDetails?.rol}</p>
        </div>
      </div>

      <div className="grid items-center justify-between grid-cols-2 gap-3 mt-5">
        {hasExternal && (
          <div>
            <p className="text-lg font-bold">{t("profile.documentType")}</p>
            <p>{formatDocumentType(firstExternalUser.type_document_id)}</p>
          </div>
        )}
        <div>
          <p className="text-lg font-bold">{t("profile.documentNumber")}</p>
          <p>{userDetails?.identity_number}</p>
        </div>

        {hasExternal && (
          <div>
            <p className="text-lg font-bold">{t("profile.birthday")}</p>
            <p>{formatDate(firstExternalUser.birthday)}</p>
          </div>
        )}
        {hasExternal && (
          <div>
            <p className="text-lg font-bold">{t("profile.dateIssuanceDoc")}</p>
            <p>{formatDate(firstExternalUser.date_issuance_document)}</p>
          </div>
        )}
        {hasExternal && (
          <div>
            <p className="text-lg font-bold">{t("profile.gender")}</p>
            <p>{formatGender(firstExternalUser.gender_id)}</p>
          </div>
        )}
        {hasExternal && (
          <div>
            <p className="text-lg font-bold">{t("profile.telephone")}</p>
            <p>{firstExternalUser.phone}</p>
          </div>
        )}
        <div>
          <p className="text-lg font-bold">{t("profile.email")}</p>
          <p>{userDetails?.email}</p>
        </div>
        {hasExternal && (
          <div>
            <p className="text-lg font-bold">{t("profile.address")}</p>
            <p>{firstExternalUser.address}</p>
          </div>
        )}
      </div>
             <div className="w-full ">
          <p className="text-lg font-bold mt-2">
            {t("profile.factorDoubleAuth")}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <ToggleSwitch
              checked={mfaActive}
              onChange={() => onToggleMFA(!mfaActive)}
              color="red"
              disabled={isUpdatingMFA}
            />
            {isUpdatingMFA && (
              <span className="text-sm text-gray-500">{t("profile.updating")}</span>
            )}
          </div>
      <div className="flex items-center justify-end gap-3 mt-3">
        <Button color="alternative" onClick={() => onChangePassword()}>
          {t("profile.changePassword")}
        </Button>
      </div>
    

    </div>
  </div>

    
  );
}
