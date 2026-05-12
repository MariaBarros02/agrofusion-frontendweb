/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate, getDiffBadge, getDiffClasses, getStatusBadgeClasses, getTranslatedStatus } from "../helpers/accountingDiffHelpers";
import InfoItem from "./InfoItem";

type DiffTransactionsProps = {
  transactions: any[];
  side: "previous" | "current";
};

const DiffTransactions = ({
  transactions,
  side,
}: DiffTransactionsProps) => {
  const {t} = useTranslation();
  return (
    <div className="p-5 bg-white border shadow-sm rounded-2xl border-slate-200 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200 dark:border-gray-700">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {t("checks.update.transactions")}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-300">
            {t("checks.update.transactionsDescription")}
            
          </p>
        </div>

        <span className="px-3 py-1 text-xs font-medium tracking-wide uppercase rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
          {transactions?.length || 0} {t("checks.update.records")}
        </span>
      </div>

      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((item: any, index: number) => {
            const transaction =
              side === "previous"
                ? item.previous
                : item.current;

            if (!transaction) return null;

            const badge = getDiffBadge(item.change_type);

            return (
              <div
                key={index}
                className={`border rounded-2xl p-4 transition-colors ${getDiffClasses(
                  item.change_type,
                )}`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold break-all text-slate-900 dark:text-white">
                      {transaction.DocumentId}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                      {transaction.Type?.Name || "-"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoItem
                    label={t("checks.update.date")}
                    value={formatDate(transaction.Date)}
                  />

                  <InfoItem
                    label={t("checks.update.paymentMethod")}
                    value={transaction.PaymentMethod?.Code || "-"}
                  />

                  <InfoItem
                    label={t("checks.update.amount")}
                    value={formatCurrency(
                      transaction.Amount,
                      transaction.Currency || "COP",
                    )}
                  />

                  <InfoItem
                    label={t("checks.update.status")}
                    value={
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClasses(
                          transaction.Status,
                        )}`}
                      >
                        {getTranslatedStatus(transaction.Status)}
                      </span>
                    }
                  />
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-2">
                  <InfoItem
                    label={t("checks.update.relatedInvoice")}
                    value={transaction.RelatedInvoiceId || "-"}
                  />

                  <InfoItem
                    label={t("checks.update.thirdParty")}
                    value={transaction.ThirdParty?.Name || "-"}
                  />
                </div>

                {transaction.Notes && (
                  <div className="p-4 mt-4 border rounded-xl border-slate-200 dark:border-gray-600">
                    <p className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-300">
                      {t("checks.update.notes")}
                    </p>

                    <p className="mt-2 text-sm break-words text-slate-700 dark:text-slate-200">
                      {transaction.Notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-sm text-center border border-dashed rounded-xl border-slate-300 text-slate-500 dark:border-gray-600 dark:text-slate-300">
            {t("checks.update.noTransactions")}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffTransactions;