/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, Fragment } from "react";
import { AccordionPanel, AccordionTitle, AccordionContent, Button } from "flowbite-react";
import { HiChevronDown } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import AlertSimple, { type AlertState } from "../../components/layout/AlertSimple";
import { getCheckDetailService } from "../../services/agrofusion/integration.service";
import type { CheckDetailResponse } from "../../dto/response/listChecks-response.dto";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatAmount = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return `$${num.toLocaleString("es-CO")}`;
};

const isCurrentMonth = (check: CheckDetailResponse): boolean => {
  const now = new Date();
  const dateStr = check.accounting_date ?? check.issued_at;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500 text-white",
  INACTIVE: "bg-amber-400 text-black",
  DELETED: "bg-red-500 text-white",
  PENDING: "bg-orange-400 text-white",
  PROCESSING: "bg-blue-500 text-white",
  SENT: "bg-green-500 text-white",
  FAILED: "bg-red-500 text-white",
  CANCELLED: "bg-gray-500 text-white",
  COMPLETED: "bg-green-500 text-white",
  REFUSED: "bg-red-500 text-white",
  PAID: "bg-green-500 text-white",
};

const StatusBadge = ({ value, label }: { value?: string | null; label?: string }) => {
  if (!value) return <span>-</span>;
  const color = statusColors[value.toUpperCase()] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex min-w-[92px] justify-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {label ?? value}
    </span>
  );
};

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-900 dark:text-white break-words">
      {value ?? "-"}
    </span>
  </div>
);

const ViewCheck = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkId } = useParams<{ checkId: string }>();
  const [check, setCheck] = useState<CheckDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertState>(null);

  useEffect(() => {
    const loadCheck = async () => {
      try {
        setLoading(true);
        const data = await getCheckDetailService(checkId || "");
        setCheck(data);
      } catch (error: any) {
        const code = error.response?.data?.detail?.code;
        setAlert({
          message:
            code === "AUTH_INSUFFICIENT_PERMISSIONS"
              ? t("errors.AUTH_INSUFFICIENT_PERMISSIONS")
              : t("checks.detail.loadError"),
          type: code === "AUTH_INSUFFICIENT_PERMISSIONS" ? "warning" : "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (checkId) loadCheck();
  }, [checkId, t]);

  const payload = check?.payload_json as any;
  const metadata = payload?.metadata;
  const summary = payload?.summary;
  const invoices: any[] | undefined = payload?.invoices ?? payload?.Invoices;
  const transactions: any[] | undefined = payload?.transactions ?? payload?.Transactions;

  const failedDocuments: any[] = (check?.response_json as any)?.failedDocuments ?? [];
  const failedMap = new Map<string, any>(
    failedDocuments.map((d: any) => [String(d.documentId), d])
  );

  const rawAccountingStatus = check?.state?.toLowerCase() !== "processing"
    ? ((check?.response_json as any)?.status ?? null)
    : null;
  const accountingStatusValue = rawAccountingStatus
    ? t(`common.${String(rawAccountingStatus).toLowerCase()}`, { defaultValue: rawAccountingStatus })
    : "-";

  return (
    <AppLayoutSB>
      <TitleTarget
        title={t("checks.detail.title")}
        description={t("checks.detail.description")}
      />

      {loading && (
        <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
          <p className="text-2xl font-bold">{t("checks.detail.loading")}</p>
        </div>
      )}

      {!loading && check && (
        <div className="p-5 mt-2 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl">

          {/* Resumen principal */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4 pb-5 border-b border-gray-100 dark:border-gray-600">
            <Field label={t("checks.columns.id")} value={check.id} />
            <Field label={t("checks.columns.transactionType")} value={check.transaction_type} />
            <Field label={t("checks.columns.project")} value={check.project_code || check.project_name} />
            <Field label={t("checks.columns.state")} value={t(`common.${String(check.state).toLowerCase()}`, { defaultValue: check.state })} />
            <Field label={t("checks.columns.issuedAt")} value={formatDate(check.issued_at)} />
            <Field label={t("checks.columns.issuedBy")} value={check.issued_by} />
            <Field
              label={t("checks.detail.amount")}
              value={
                check.amount != null
                  ? formatAmount(check.amount)
                  : summary?.TotalNet != null
                    ? summary?.Currency
                      ? `${summary.Currency} ${Number(summary.TotalNet).toLocaleString("es-CO")}`
                      : formatAmount(summary.TotalNet)
                    : undefined
              }
            />
            <Field
              label={t("checks.detail.shipment")}
              value={`${check.retry_count}/3`}
            />
          </div>

          {/* Secciones del payload */}
          <div className="mt-4">
            <div className="border border-gray-200 dark:border-gray-600 rounded-xl divide-y divide-gray-200 dark:divide-gray-600">

              {/* Sección: Metadata */}
              <AccordionPanel alwaysOpen isOpen={true} arrowIcon={HiChevronDown}>
                <AccordionTitle className="text-sm font-semibold">
                  {t("checks.detail.metadataSection")}
                </AccordionTitle>
                <AccordionContent>
                  {metadata ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
                      <Field
                        label={t("checks.detail.generatedAt")}
                        value={formatDate(metadata.GeneratedAt)}
                      />
                      <Field
                        label={t("checks.detail.actionLabel")}
                        value={t("checks.detail.actionValue")}
                      />
                      <Field
                        label={t("checks.detail.exchangeId")}
                        value={metadata.ExchangeId}
                      />
                      <Field
                        label={t("checks.detail.version")}
                        value={metadata.StandardVersion}
                      />
                      <Field
                        label={t("checks.detail.accountingPeriod")}
                        value={
                          metadata.RequestedPeriod
                            ? `${formatDate(metadata.RequestedPeriod.From)} - ${formatDate(metadata.RequestedPeriod.To)}`
                            : undefined
                        }
                      />
            <Field
              label={t("checks.detail.accountingStatus")}
              value={accountingStatusValue}
            />                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                  )}
                </AccordionContent>
              </AccordionPanel>

              {/* Sección: Montos y documentos */}
              <AccordionPanel alwaysOpen isOpen={true} arrowIcon={HiChevronDown}>
                <AccordionTitle className="text-sm font-semibold">
                  {t("checks.detail.summarySection")}
                </AccordionTitle>
                <AccordionContent>
                  {summary ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
                      <Field
                        label={t("checks.detail.total")}
                        value={
                          summary.Currency
                            ? `${summary.Currency} ${summary.TotalNet != null ? Number(summary.TotalNet).toLocaleString("es-CO") : ""}`
                            : summary.TotalNet != null
                            ? formatAmount(summary.TotalNet)
                            : undefined
                        }
                      />
                      <Field
                        label={t("checks.detail.totalDocuments")}
                        value={summary.TotalDocuments}
                      />
                      <Field
                        label={t("checks.detail.totalInvoices")}
                        value={summary.TotalInvoices}
                      />
                      <Field
                        label={t("checks.detail.totalTransactions")}
                        value={summary.TotalTransactions}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                  )}
                </AccordionContent>
              </AccordionPanel>

              {/* Sección: Facturas */}
              <AccordionPanel alwaysOpen isOpen={true} arrowIcon={HiChevronDown}>
                <AccordionTitle className="text-sm font-semibold">
                  {t("checks.detail.invoicesSection")}
                </AccordionTitle>
                <AccordionContent>
                  {invoices && invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          <tr>
                            <th className="px-3 py-2">{t("checks.detail.invoiceDate")}</th>
                            <th className="px-3 py-2">{t("checks.detail.invoiceType")}</th>
                            <th className="px-3 py-2">{t("checks.detail.invoiceAmount")}</th>
                            <th className="px-3 py-2">{t("checks.detail.invoiceReference")}</th>
                            <th className="px-3 py-2">{t("checks.detail.invoiceStatus")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((inv: any, i: number) => {
                            const docId = inv.Header?.DocumentId;
                            const failed = docId ? failedMap.get(String(docId)) : undefined;
                            return (
                              <Fragment key={i}>
                                <tr className={`border-b dark:border-gray-600 ${failed ? "bg-red-50 dark:bg-red-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    {formatDate(inv.Header?.IssueDate)}
                                    {inv.Header?.DueDate ? ` - ${formatDate(inv.Header.DueDate)}` : ""}
                                  </td>
                                  <td className="px-3 py-2">{inv.Header?.Type?.Name ?? "-"}</td>
                                  <td className="px-3 py-2">{formatAmount(inv.Totals?.TotalPayment)}</td>
                                  <td className="px-3 py-2">{docId ?? "-"}</td>
                                  <td className="px-3 py-2">
                                    <StatusBadge
                                      value={inv.Header?.Status ?? null}
                                      label={inv.Header?.Status ? t(`common.${String(inv.Header.Status).toLowerCase()}`, { defaultValue: inv.Header.Status }) : undefined}
                                    />
                                  </td>
                                </tr>
                                {failed && (
                                  <tr className="bg-red-50 dark:bg-red-900/20 border-b dark:border-gray-600">
                                    <td colSpan={5} className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                                      {t("checks.detail.accountingAlert", { message: failed.errorMessage ?? failed.errorCode })}
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {t("checks.detail.noInvoices")}
                    </p>
                  )}
                </AccordionContent>
              </AccordionPanel>

              {/* Sección: Pagos */}
              <AccordionPanel alwaysOpen isOpen={true} arrowIcon={HiChevronDown}>
                <AccordionTitle className="text-sm font-semibold">
                  {t("checks.detail.transactionsSection")}
                </AccordionTitle>
                <AccordionContent>
                  {transactions && transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          <tr>
                            <th className="px-3 py-2">{t("checks.detail.transactionDate")}</th>
                            <th className="px-3 py-2">{t("checks.detail.paymentMethod")}</th>
                            <th className="px-3 py-2">{t("checks.detail.transactionAmount")}</th>
                            <th className="px-3 py-2">{t("checks.detail.transactionReference")}</th>
                            <th className="px-3 py-2">{t("checks.detail.transactionStatus")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx: any, i: number) => {
                            const txDocId = tx.RelatedInvoiceId ?? tx.DocumentId;
                            const failed = txDocId ? failedMap.get(String(txDocId)) : undefined;
                            return (
                              <Fragment key={i}>
                                <tr className={`border-b dark:border-gray-600 ${failed ? "bg-red-50 dark:bg-red-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}>
                                  <td className="px-3 py-2">{formatDate(tx.Date)}</td>
                                  <td className="px-3 py-2">{tx.PaymentMethod?.Code ?? "-"}</td>
                                  <td className="px-3 py-2">{formatAmount(tx.Amount)}</td>
                                  <td className="px-3 py-2">{tx.RelatedInvoiceId ?? "-"}</td>
                                  <td className="px-3 py-2">
                                    <StatusBadge
                                      value={tx.Status ?? null}
                                      label={tx.Status ? t(`common.${String(tx.Status).toLowerCase()}`, { defaultValue: tx.Status }) : undefined}
                                    />
                                  </td>
                                </tr>
                                {failed && (
                                  <tr className="bg-red-50 dark:bg-red-900/20 border-b dark:border-gray-600">
                                    <td colSpan={5} className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                                      {t("checks.detail.accountingAlert", { message: failed.errorMessage ?? failed.errorCode })}
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {t("checks.detail.noTransactions")}
                    </p>
                  )}
                </AccordionContent>
              </AccordionPanel>

            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-600">
            <Button
              color="light"
              onClick={() => navigate("/accounting-vouchers")}
            >
              {t("checks.detail.goBack")}
            </Button>
            <Button
              color="blue"
              disabled={!isCurrentMonth(check)}
            >
              {t("common.update")}
            </Button>
          </div>
        </div>
      )}

      {alert && (
        <AlertSimple
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </AppLayoutSB>
  );
};

export default ViewCheck;
