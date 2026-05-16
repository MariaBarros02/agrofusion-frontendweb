/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import {
  getDiffBadge,
  getDiffClasses,
  formatCurrency,
} from "../helpers/accountingDiffHelpers";
import InfoItem from "./InfoItem";

const DiffInvoices = ({ invoices, side }: any) => {
  const { t } = useTranslation();

  return (
    <div className="p-5 bg-white border shadow-sm rounded-2xl border-slate-200 dark:border-gray-700 dark:bg-gray-800">

      {/* HEADER (igual que transactions) */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200 dark:border-gray-700">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {t("checks.update.invoices")}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-300">
            {t("checks.update.invoicesDescription")}
          </p>
        </div>

        <span className="px-3 py-1 text-xs font-medium tracking-wide uppercase rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
          {invoices?.length || 0} {t("checks.update.records")}
        </span>
      </div>

      {/* BODY */}
      <div className="space-y-3">
        {invoices.length > 0 ? (
          invoices.map((item: any, index: number) => {
            const invoice =
              side === "previous" ? item.previous : item.current;

            if (!invoice) return null;

            const badge = getDiffBadge(item.change_type);

            return (
              <div
                key={index}
                className={`border rounded-2xl p-4 transition-colors ${getDiffClasses(
                  item.change_type,
                )}`}
              >

                {/* HEADER CARD */}
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {invoice.Header.DocumentId}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                      {invoice.ThirdParty?.Name || "-"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* INFO GRID */}
                <div className="grid gap-4 mt-4 md:grid-cols-2 ">
                  <InfoItem
                    label={t("checks.update.status")}
                    value={t(
                      `common.${invoice.Header.Status.toLowerCase()}`,
                      {
                        defaultValue: invoice.Header.Status,
                      },
                    )}
                  />

                  <InfoItem
                    label={t("checks.update.dateConsumption")}
                    value={invoice.Header.IssueDate}
                  />

                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-2 ">

                  <InfoItem
                    label={t("checks.update.total")}
                    value={formatCurrency(
                      invoice.Totals?.TotalPayment,
                      "COP",
                    )}
                  />
                  
                  <InfoItem
                    label={t("checks.update.type")}
                    value={invoice.Header.Type?.Name || "-"}
                  />
                </div>

              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-sm text-center border border-dashed rounded-xl border-slate-300 text-slate-500 dark:border-gray-600 dark:text-slate-300">
            {t("checks.update.noInvoices")}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffInvoices;