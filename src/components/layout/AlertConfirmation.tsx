import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Checkbox, Label } from "flowbite-react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FaCheck, FaExclamationTriangle} from "react-icons/fa";

type AlertType = "success" | "error" | "warning";

interface AlertConfirmationProps {
  show: boolean;
  type?: AlertType;

  title: string;
  message: string;
  description?: string;

  checkboxLabel?: string;
  checkboxChecked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;

  confirmText: string;
  cancelText?: string;

  confirmDisabled?: boolean;

  onConfirm: () => void;
  onClose: () => void;
}

const alertStyles = {
  success: {
    bg: "bg-green-600",
    button: "bg-green-600 hover:bg-green-700 focus:ring-green-300",
    icon: <FaCheck className="w-6 h-6 text-white" />,
  },
  error: {
    bg: "bg-red-600",
    button: "bg-red-600 hover:bg-red-700 focus:ring-red-300",
    icon: <Trash2 className="w-6 h-6 text-white" />,
  },
  warning: {
    bg: "bg-yellow-500",
    button: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300",
    icon: <FaExclamationTriangle className="w-6 h-6 text-white" />,
  },
};

const AlertConfirmation = ({
  show,
  type = "warning",
  title,
  message,
  description,
  checkboxLabel,
  checkboxChecked = false,
  onCheckboxChange,
  confirmText,
  cancelText,
  confirmDisabled,
  onConfirm,
  onClose,
}: AlertConfirmationProps) => {
  const { t } = useTranslation();
  const style = alertStyles[type];

  return (
    <Modal show={show} onClose={onClose} size="md">
      <ModalHeader as="div">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-lg shrink-0 ${style.bg}`}
          >
            {style.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      </ModalHeader>

      <ModalBody className="pt-4">
        <p className="mb-2 font-bold text-gray-900 dark:text-white">
          {message}
        </p>

        {description && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}

        {checkboxLabel && onCheckboxChange && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="alert-confirm-checkbox"
              checked={checkboxChecked}
              onChange={(e) => onCheckboxChange(e.target.checked)}
            />
            <Label
              htmlFor="alert-confirm-checkbox"
              className="text-sm font-bold cursor-pointer dark:text-gray-300"
            >
              {checkboxLabel}
            </Label>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex justify-end pt-4 border-t">
        <Button color="gray" onClick={onClose}>
          {cancelText ?? t("common.cancel")}
        </Button>

        <Button
          className={`text-white ${style.button}`}
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AlertConfirmation;