/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, ModalBody } from "flowbite-react";
import React from "react";
import ComparisonColumn from "../comparison/ComparisonColumn";
import type { CheckRefreshResponse } from "../../../dto/response/accountingDiff-response.dto";
import { HiX } from "react-icons/hi";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  data: CheckRefreshResponse | null;
};

const AccountingUpdateModal = ({
  open,
  onClose,
  loading,
  data,
}: Props) => {

  const {t} = useTranslation();
  return (
    <Modal
      show={open}
      size="7xl"
      onClose={onClose}
    >
  {/* HEADER CUSTOM */}
  <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
    
    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
      {t("checks.update.comparison")}
    </h3>

    <button
      onClick={onClose}
      className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <HiX className="w-5 h-5" />
    </button>

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
    </Modal>
  );
};

export default AccountingUpdateModal;