/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  Label,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { FaLock, FaRegClock } from "react-icons/fa";
import { FiEye, FiEyeOff, FiSave } from "react-icons/fi";
import AlertInline from "../../components/layout/AlertInline";

interface Props {
  show: boolean;
  onClose: () => void;
  formik: any;
  t: any;
}

export default function ModalChangePassword({
  show,
  onClose,
  formik,
  t,
}: Props) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const InputIcon = FaLock;
  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>{t("profile.changePassword")}</ModalHeader>

      <ModalBody>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="mb-4">
            <div className="block mb-2">
              <Label htmlFor="oldPassword">{t("profile.oldPassword")}</Label>
            </div>

            <div className="relative">
              <TextInput
                id="old_password"
                name="old_password"
                type={showOldPassword ? "text" : "password"}
                icon={FaRegClock}
                placeholder="••••••••"
                value={formik.values.old_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                color={
                  formik.touched.old_password && formik.errors.old_password
                    ? "failure"
                    : "gray"
                }
              />

              {/* Botón de Toggle (Ojo) */}
              <Button
                type="button"
                onClick={() => setShowOldPassword((v) => !v)}
                color="gray"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full p-0 text-gray-500 bg-transparent border-0 hover:bg-transparent focus:ring-0 dark:text-gray-400 dark:hover:bg-transparent dark:bg-transparent"
              >
                {showOldPassword ? <FiEyeOff /> : <FiEye />}
              </Button>
              {formik.touched.old_password && formik.errors.old_password && (
                <p className="mt-1 text-sm text-red-600">
                  {t(formik.errors.old_password)}
                </p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <div className="block mb-2">
              <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
            </div>

            <div className="relative">
              <TextInput
                id="new_password"
                name="new_password"
                type={showNewPassword ? "text" : "password"}
                icon={InputIcon}
                placeholder="••••••••"
                value={formik.values.new_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                color={
                  formik.touched.new_password && formik.errors.new_password
                    ? "failure"
                    : "gray"
                }
              />

              {/* Botón de Toggle (Ojo) */}
              <Button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                color="gray"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full p-0 text-gray-500 bg-transparent border-0 hover:bg-transparent focus:ring-0 dark:text-gray-400 dark:hover:bg-transparent dark:bg-transparent"
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </Button>
              {formik.touched.new_password && formik.errors.new_password && (
                <p className="mt-1 text-sm text-red-600">
                  {t(formik.errors.new_password)}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="block mb-2">
              <Label htmlFor="confirmPassword">
                {t("profile.confirmPassword")}
              </Label>
            </div>

            <div className="relative">
              <TextInput
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                icon={InputIcon}
                placeholder="••••••••"
                value={formik.values.confirm_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                color={
                  formik.touched.confirm_password &&
                  formik.errors.confirm_password
                    ? "failure"
                    : "gray"
                }
              />

              {/* Botón de Toggle (Ojo) */}
              <Button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                color="gray"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full p-0 text-gray-500 bg-transparent border-0 hover:bg-transparent focus:ring-0 dark:text-gray-400 dark:hover:bg-transparent dark:bg-transparent"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </Button>

              {formik.touched.confirm_password &&
                formik.errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">
                    {t(formik.errors.confirm_password)}
                  </p>
                )}
            </div>
          </div>
          {formik.status && (
            <AlertInline
              message={t(formik.status.messageKey)}
              type={formik.status.type}
            />
          )}
          <div className="flex justify-center gap-3">
            <Button color="alternative" onClick={onClose}>
              {t("common.cancel")}
            </Button>

            <Button type="submit" disabled={formik.isSubmitting} color="blue">
              <FiSave className="mr-1" />
              {t("profile.save")}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
