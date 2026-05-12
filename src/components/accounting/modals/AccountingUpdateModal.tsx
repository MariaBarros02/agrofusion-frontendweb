/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, Button, Modal, ModalBody } from "flowbite-react";
import React from "react";
import ComparisonColumn from "../comparison/ComparisonColumn";
import type { CheckRefreshResponse } from "../../../dto/response/accountingDiff-response.dto";
import { HiX } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { FiSend } from "react-icons/fi";
import { useState } from "react";
import type { AlertState } from "../../layout/AlertSimple";
import { updateVoucherService } from "../../../services/agrofusion/integration.service";
import AlertSimple from "../../layout/AlertSimple";

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  data: CheckRefreshResponse | null;
  transfer_id?: string;
};

const AccountingUpdateModal = ({ open, onClose, loading, data, transfer_id }: Props) => {
  const { t } = useTranslation();
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  
  const sendUpdateVoucher = async () => {
    try{
      setLoadingTransfer(true);

      console.log(data)
      await updateVoucherService(transfer_id as string, data);
      
      setAlert({
        message: t(`transfer.success`),
        type: "success",
        to: "/accounting-vouchers",
      });
    }catch(error: any){
      const errorCode = error.response?.data?.detail?.code ?? "UNKNOWN_ERROR";

      let meta = error.response?.data?.detail?.meta;

      // Si viene como texto, intenta convertirlo
      if (typeof meta === "string") {
        try {
          meta = JSON.parse(meta);
        } catch {
          // Si falla el parseo, deja el valor original
        }
      }

      console.log(error);
      console.log(meta?.message);

      setAlert({
        message: `${t(`errors.${errorCode}`)} ${meta?.message || ""}`,
        type:
          errorCode === "AUTH_INSUFFICIENT_PERMISSIONS" ? "warning" : "error",
      });
    } finally {
      setLoadingTransfer(false);
    }
  } 
  return (
    <Modal show={open} size="7xl" onClose={onClose}>
      {/* HEADER CUSTOM */}
      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {t("checks.update.comparison")}
        </h3>
        <div className="flex">
          <Button color="blue" disabled={loadingTransfer} onClick={() => {sendUpdateVoucher()}} className="mr-5">
            <FiSend className="mr-2" />
            {t("project.transferRequest.transfer")}
          </Button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ModalBody>
        {loading ? (
          <div className="py-10 text-xl font-bold text-center text-gray-700">
            {t("checks.update.consulting")}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* PREVIOUS */}
            <ComparisonColumn
              title={t("checks.update.previousInfo")}
              metadata={data.previous_metadata}
              summary={data.previous_summary}
              invoices={data.invoice_diffs}
              transactions={data.transaction_diffs}
              side="previous"
            />

            {/* CURRENT */}
            <ComparisonColumn
              title={t("checks.update.currentInfo")}
              metadata={data.current_metadata}
              summary={data.current_summary}
              invoices={data.invoice_diffs}
              transactions={data.transaction_diffs}
              side="current"
            />
          </div>
        ) : (
          <div className="py-10 text-xl font-bold text-center text-slate-500">
            {t("checks.update.noInfo")}
          </div>
        )}
      </ModalBody>
      
      {alert && (
        <AlertSimple
          message={alert.message}
          type={alert.type}
          to={alert.to}
          onClose={() => setAlert(null)}
        />
      )}
    </Modal>
  );
};

export default AccountingUpdateModal;
