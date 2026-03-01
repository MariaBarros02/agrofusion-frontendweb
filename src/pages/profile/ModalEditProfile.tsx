/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, ModalBody, ModalHeader, Button, Label, TextInput, Select } from "flowbite-react";
import { FiSave } from "react-icons/fi";
import type { ListUserResponse } from "../../dto/response/listUsers-response.dto";

interface Props {
  show: boolean;
  onClose: () => void;
  formik: any;
  t: any;
  hasExternal: boolean;
  firstExternalUser: Record<
    string,
    any
  >;
  userDetails: ListUserResponse | null;
}

export default function ModalEditProfile({
  show,
  onClose,
  formik,
  t,
  hasExternal,
  firstExternalUser,
  userDetails
}: Props) {
  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>{t("profile.editProfile")}</ModalHeader>

        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              {/* ================================================= */}
              {/* SOLO USERDETAILS (SIN USUARIOS EXTERNOS) */}
              {/* ================================================= */}
              {!hasExternal && (
                <>
                  {/* Nombre completo */}
                  <div>
                    <Label htmlFor="name">{t("profile.name")} </Label>
                    <TextInput
                      id="name"

                      {...formik.getFieldProps("name")}
                      sizing="sm"
                      value={formik.values.name}
                      color={
                        formik.touched.name && formik.errors.name
                          ? "failure"
                          : "gray"
                      }
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-sm text-red-500">
                        {t(formik.errors.name)}
                      </p>
                    )}
                  </div>
                
                </>
              )}

              {/* ================================================= */}
              {/* CON USUARIOS EXTERNOS */}
              {/* ================================================= */}
              {hasExternal && firstExternalUser && (
                <>
                  {/* Nombre */}
                  <div>
                    <Label htmlFor="firstName">{t("profile.name")}</Label>
                    <TextInput
                      id="firstName"
                      defaultValue={firstExternalUser.name ?? ""}  
                      {...formik.getFieldProps("name")}
                      sizing="sm"
                      value={formik.values.name}
                      color={
                        formik.touched.name && formik.errors.name
                          ? "failure"
                          : "gray"
                      }
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-sm text-red-500">
                        {t(formik.errors.name)}
                      </p>
                    )}
                    
                  </div>

                  {/* Primer apellido */}
                  <div>
                    <Label htmlFor="firstLastName">
                      {t("profile.firstLastName")}{" "}
                    </Label>
                    <TextInput
                      id="firstLastName"
                      sizing="sm"
                      defaultValue={firstExternalUser.first_last_name ?? ""}
                    {...formik.getFieldProps("first_last_name")}
                      value={formik.values.first_last_name}
                      color={
                        formik.touched.first_last_name && formik.errors.first_last_name
                          ? "failure"
                          : "gray"
                      }
                    />
                    {formik.touched.first_last_name && formik.errors.first_last_name && (
                      <p className="text-sm text-red-500">
                        {t(formik.errors.first_last_name)}
                      </p>
                    )}
                  </div>

                  {/* Segundo apellido */}
                  <div>
                    <Label htmlFor="secondLastName">
                      {t("profile.secondLastName")}
                    </Label>
                    <TextInput
                      id="secondLastName"
                      sizing="sm"
                      defaultValue={firstExternalUser.second_last_name ?? ""}
                      {...formik.getFieldProps("second_last_name")}
                      value={formik.values.second_last_name}
                      color={
                        formik.touched.second_last_name && formik.errors.second_last_name
                          ? "failure"
                          : "gray"
                      }
                    />
                    {formik.touched.second_last_name && formik.errors.second_last_name && (
                      <p className="text-sm text-red-500">
                        {t(formik.errors.second_last_name)}
                      </p>
                      )}
                  </div>

             

    

                  {/* Género */}
                  <div>
                    <Label htmlFor="gender">{t("profile.gender")}</Label>
                    <Select
                      id="gender"
                      sizing="sm"
                      defaultValue={firstExternalUser.gender_id}
                      {...formik.getFieldProps("gender_id")}
                    >
                      <option value="">{t("profile.placeholderGender")}</option>
                      <option value={1}>{t("common.masculine")}</option>
                      <option value={2}>{t("common.feminine")}</option>
                    </Select>
                  </div>

                  {/* Fecha nacimiento */}
                  <div>
                    <Label htmlFor="birthday">{t("profile.birthday")}</Label>
                    <TextInput
                      id="birthday"
                      type="date"
                      sizing="sm"
                      defaultValue={firstExternalUser.birthday?.split("T")[0]}
                    {...formik.getFieldProps("birthday")}
                      value={formik.values.birthday}
                      color={
                        formik.touched.birthday && formik.errors.birthday
                          ? "failure"
                          : "gray"
                      }
                    />
                    {formik.touched.birthday && formik.errors.birthday && (
                      <p className="text-sm text-red-500">
                        {t(formik.errors.birthday)}
                      </p>
                      )}
                  </div>

                  {/* Fecha expedición documento */}
                  <div>
                    <Label htmlFor="date_issuance_document">
                      {t("profile.dateIssuanceDoc")}
                    </Label>
                    <TextInput
                      id="date_issuance_document"
                      type="date"
                      sizing="sm"
                      defaultValue={
                        firstExternalUser.date_issuance_document?.split("T")[0]
                      }{...formik.getFieldProps("date_issuance_document")}
                      value={formik.values.date_issuance_document}
                      color={
                        formik.touched.date_issuance_document && formik.errors.date_issuance_document
                          ? "failure"
                          : "gray"
                      }
                    />
                    {formik.touched.date_issuance_document && formik.errors.date_issuance_document && (
                      <p className="text-sm text-red-500">
                        {t(formik.errors.date_issuance_document)}
                      </p>
                      )}
                  </div>
                </>
              )}
            </div>

            {/* BOTONES */}
            <div className="flex justify-center gap-3 mt-6">
              <Button onClick={() => onClose()} color="alternative">
                {t("common.cancel")}
              </Button>
              <Button color="blue" disabled={formik.isSubmitting || !formik.dirty} type="submit">
                <FiSave size={22} className="mr-1" />
                {t("profile.save")}
              </Button>
            </div>
          </form>
        </ModalBody>
    </Modal>
  );
}