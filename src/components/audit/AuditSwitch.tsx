import { useNavigate } from "react-router-dom";
import { HiOutlineClipboardList } from "react-icons/hi";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";

interface Props {
  active: "audit" | "errors";
}

const AuditSwitch = ({ active }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="absolute right-6 top-6">
      <div className="flex items-center p-1 border rounded-xl bg-gray-700 border-gray-600">

        {/* Auditoría */}
        <button
          onClick={() => navigate("/audit")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            active === "audit"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-300 hover:bg-gray-600"
          }`}
        >
          <HiOutlineClipboardList size={18} />
          {t("audit.switch.audit")}
        </button>

        {/* Errores */}
        <button
          onClick={() => navigate("/audit/errors")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            active === "errors"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-300 hover:bg-gray-600"
          }`}
        >
          <HiOutlineExclamationCircle size={18} />
          {t("audit.switch.errors")}
        </button>

      </div>
    </div>
  );
};

export default AuditSwitch;