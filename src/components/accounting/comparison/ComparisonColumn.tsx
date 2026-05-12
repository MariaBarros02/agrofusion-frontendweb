import { formatCurrency, formatDateTime } from "../helpers/accountingDiffHelpers";
import DiffInvoices from "./DiffInvoices";
import DiffTransactions from "./DiffTransactions";
import InfoItem from "./InfoItem";

import { useTranslation } from "react-i18next";
/* eslint-disable @typescript-eslint/no-explicit-any */
type ComparisonColumnProps = {
  title: string;
  metadata: any;
  summary: any;
  invoices: any[];
  transactions: any[];
  side: "previous" | "current";
};

const ComparisonColumn = ({
  title,
  metadata,
  summary,
  invoices,
  transactions,
  side,
}: ComparisonColumnProps) => {

  const {t} = useTranslation();
  return (
    <div className="space-y-6">

      <div className="p-5 bg-white border shadow-sm rounded-2xl border-slate-200 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>

        {/* Metadata */}
        <div className="grid gap-2 md:grid-cols-2">
          <InfoItem
            label={t("checks.update.exchangeId")}
            value={metadata?.ExchangeId}
          />

          <InfoItem
            label={t("checks.update.generatedAt")}
            value={formatDateTime(metadata?.GeneratedAt)}
          />

          <InfoItem
            label={t("checks.update.project")}
            value={metadata?.SourceSystem?.SystemName}
          />

          <InfoItem
            label="NIT"
            value={metadata?.SourceSystem?.SystemNIT}
          />
        </div>

        {/* Summary */}
        <div className="grid gap-2 mt-6 md:grid-cols-2">
          <InfoItem
            label={t("checks.update.invoices")}
            value={summary?.TotalInvoices}
          />

          <InfoItem
            label={t("checks.update.transactions")}
            value={summary?.TotalTransactions}
          />

          <InfoItem
            label={t("checks.update.documents")}
            value={summary?.TotalDocuments}
          />

          <InfoItem
            label={t("checks.update.total")}
            value={formatCurrency(
              summary?.TotalNet,
              summary?.Currency
            )}
          />
        </div>
      </div>

      {/* INVOICES */}
      <DiffInvoices
        invoices={invoices}
        side={side}
      />

      {/* TRANSACTIONS */}
      <DiffTransactions
        transactions={transactions}
        side={side}
      />
    </div>
  );
};

export default ComparisonColumn;