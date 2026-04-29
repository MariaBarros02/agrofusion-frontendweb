import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { FiArrowLeft, FiSearch, FiSend } from "react-icons/fi";

import AppLayoutSB from "../../components/layout/AppLayoutSB";
import AlertSimple from "../../components/layout/AlertSimple";
import ModuleInactive from "../ModuleInactive";
import SubmoduleInactive from "../SubmoduleInactive";

import { useModuleAccessStore } from "../../store/moduleAccess.store";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";

import { consultAccountingInfoService } from "../../services/agrofusion/accounting.service";

import type { AlertState } from "../../components/layout/AlertSimple";
import type { AccountingConsultRequest } from "../../dto/request/accountingConsult-request.dto";
import type { AccountingConsultResponse } from "../../dto/response/accountingConsult-response.dto";

type TransferLocationState = {
  apiName?: string;
  projectCode?: string;
  endpointId?: string;
  urlEndpoint?: string;
};

type AccountingInterval = "" | "quincenal" | "mensual" | "anual";

const formatDateForInput = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDaysUtc = (year: number, month: number, day: number, days: number) => {
  return new Date(Date.UTC(year, month - 1, day + days));
};

const calculateEndDate = (
  startDateValue: string,
  interval: AccountingInterval,
) => {
  if (!startDateValue || !interval) return "";

  const [year, month, day] = startDateValue.split("-").map(Number);

  if (!year || !month || !day) return "";

  if (interval === "quincenal") {
    const endDate = addDaysUtc(year, month, day, 14);
    return formatDateForInput(endDate);
  }

  if (interval === "mensual") {
    const endDate = new Date(Date.UTC(year, month, day - 1));
    return formatDateForInput(endDate);
  }

  if (interval === "anual") {
    const endDate = new Date(Date.UTC(year + 1, month - 1, day - 1));
    return formatDateForInput(endDate);
  }

  return "";
};

const getErrorCode = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return "UNKNOWN_ERROR";
  }

  const axiosError = error as {
    response?: {
      data?: {
        detail?: {
          code?: string;
        };
        code?: string;
      };
    };
  };

  return (
    axiosError.response?.data?.detail?.code ??
    axiosError.response?.data?.code ??
    "UNKNOWN_ERROR"
  );
};

const formatCurrency = (value: number, currency = "COP") => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDateRange = (from?: string | null, to?: string | null) => {
  if (!from && !to) return "-";
  if (from && !to) return formatDate(from);
  if (!from && to) return formatDate(to);

  return `${formatDate(from)} - ${formatDate(to)}`;
};

const getStatusBadgeClasses = (status?: string | null) => {
  const normalized = (status || "").toLowerCase();

  if (
    normalized.includes("confirm") ||
    normalized.includes("complet") ||
    normalized.includes("pagad") ||
    normalized.includes("paid") ||
    normalized.includes("success") ||
    normalized.includes("active")
  ) {
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  }

  if (
    normalized.includes("pend") ||
    normalized.includes("process") ||
    normalized.includes("open") ||
    normalized.includes("unknown")
  ) {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("reject") ||
    normalized.includes("error") ||
    normalized.includes("fail")
  ) {
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
};

const AccountingTransferRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { projectId } = useParams<{ projectId: string }>();
  const state = (location.state as TransferLocationState | null) ?? null;

  const [startDate, setStartDate] = useState("");
  const [interval, setInterval] = useState<AccountingInterval>("");
  const [endDate, setEndDate] = useState("");
  const [hasConsulted, setHasConsulted] = useState(false);

  const [loadingConsult, setLoadingConsult] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [consultResult, setConsultResult] =
    useState<AccountingConsultResponse | null>(null);

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);

  useSubmoduleAccessStore((s) => s.loaded);

  const canAccessSubmodule = useSubmoduleAccessStore(
    (s) => s.canAccessSubmodule,
  );

  const canUseDashboardFlow = canAccessModule("DASHBOARD");

  const canUseAdministrationFlow =
    canAccessModule("ADMINISTRATION") && canAccessSubmodule("PROJECTS");

  const showModuleInactive =
    !canUseDashboardFlow && !canAccessModule("ADMINISTRATION");

  const showSubmoduleInactive =
    !canUseDashboardFlow &&
    canAccessModule("ADMINISTRATION") &&
    !canAccessSubmodule("PROJECTS");

  const showContent = canUseDashboardFlow || canUseAdministrationFlow;

  const goBackPath = useMemo(() => {
    if (canUseAdministrationFlow && !canUseDashboardFlow) {
      return `/administration/projects/${projectId}/accounting-endpoints`;
    }

    return `/projects/${projectId}/accounting-endpoints`;
  }, [canUseAdministrationFlow, canUseDashboardFlow, projectId]);

  const apiName =
    state?.apiName || t("project.transferRequest.fallbackApiName");

  const projectCode =
    state?.projectCode || t("project.transferRequest.fallbackProject");

  const canConsult = Boolean(startDate && interval && endDate);

  const getTranslatedStatus = (status?: string | null) => {
    const normalized = (status || "").trim().toUpperCase();

    if (!normalized) return "-";

    return t(`project.transferRequest.result.statuses.${normalized}`, {
      defaultValue: status || "-",
    });
  };

  useEffect(() => {
    const nextEndDate = calculateEndDate(startDate, interval);

    setEndDate(nextEndDate);
    setHasConsulted(false);
    setConsultResult(null);
    setAlert(null);
  }, [startDate, interval]);

  const handleConsult = async () => {
    if (!canConsult || !projectId) return;

    if (!state?.endpointId) {
      setAlert({
        message: t("errors.ACCOUNTING_ENDPOINT_NOT_FOUND"),
        type: "warning",
      });

      return;
    }

    const payload: AccountingConsultRequest = {
      external_project_id: projectId,
      external_endpoint_id: state.endpointId,
      // sincePeriod: '2025-04-01',
      // untilPeriod: '2025-04-30',
      sincePeriod: startDate,
      untilPeriod: endDate,
    };

    console.log(
      "Payload enviado a /integration/accounting-vouchers/consult:",
      payload,
    );

    try {
      setLoadingConsult(true);
      setHasConsulted(false);
      setConsultResult(null);
      setAlert(null);

      const response = await consultAccountingInfoService(payload);

      console.log(
        "Respuesta recibida de /integration/accounting-vouchers/consult:",
        response,
      );
      console.log("Metadata:", response.metadata);
      console.log("Summary:", response.summary);
      console.log("Invoices:", response.invoices);
      console.log("Transactions:", response.transactions);

      setConsultResult(response);
      setHasConsulted(true);
    } catch (error: unknown) {
      console.error(
        "Error consultando /integration/accounting-vouchers/consult:",
        error,
      );

      const errorCode = getErrorCode(error);

      const warningCodes = [
        "AUTH_INSUFFICIENT_PERMISSIONS",
        "ACCOUNTING_TRANSFER_PERIOD_ALREADY_EXISTS",
        "ACCOUNTING_ENDPOINT_NOT_FOUND",
        "EXTERNAL_ENDPOINT_NOT_FOUND",
      ];

      setAlert({
        message: t(`errors.${errorCode}`, {
          defaultValue: t("errors.UNKNOWN_ERROR"),
        }),
        type: warningCodes.includes(errorCode) ? "warning" : "error",
      });

      setConsultResult(null);
      setHasConsulted(false);
    } finally {
      setLoadingConsult(false);
    }
  };

  return (
    <AppLayoutSB>
      <div className="mb-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("project.transferRequest.title", {
            apiName,
            project: projectCode,
          })}
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {t("project.transferRequest.description")}
        </p>
      </div>

      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}

      {showContent && (
        <>
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
              <div>
                <Label htmlFor="transfer-start-date">
                  {t("project.transferRequest.startDate")}
                </Label>

                <TextInput
                  id="transfer-start-date"
                  type="date"
                  sizing="md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="transfer-end-date">
                  {t("project.transferRequest.endDate")}
                </Label>

                <TextInput
                  id="transfer-end-date"
                  type={endDate ? "date" : "text"}
                  sizing="md"
                  value={endDate}
                  readOnly
                  placeholder={t("project.transferRequest.endDatePlaceholder")}
                  className="cursor-not-allowed"
                />
              </div>

              <div>
                <Label htmlFor="transfer-interval">
                  {t("project.transferRequest.accountingInterval")}
                </Label>

                <Select
                  id="transfer-interval"
                  sizing="md"
                  value={interval}
                  onChange={(e) => {
                    const selectedInterval = e.target
                      .value as AccountingInterval;

                    setInterval(selectedInterval);
                    setHasConsulted(false);
                    setConsultResult(null);
                    setAlert(null);
                  }}
                >
                  <option value="">
                    {t("project.transferRequest.intervalPlaceholder")}
                  </option>

                  <option value="quincenal">
                    {t("project.transferRequest.intervals.biweekly")}
                  </option>

                  <option value="mensual">
                    {t("project.transferRequest.intervals.monthly")}
                  </option>

                  <option value="anual">
                    {t("project.transferRequest.intervals.yearly")}
                  </option>
                </Select>
              </div>

              <Button
                color="blue"
                className="h-[42px] min-w-[220px] w-full xl:w-auto"
                onClick={handleConsult}
                disabled={!canConsult || loadingConsult}
              >
                <FiSearch className="mr-2" />

                {loadingConsult
                  ? t("project.transferRequest.consulting")
                  : t("project.transferRequest.consult")}
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("project.transferRequest.resultTitle")}
              </h2>

              {state?.urlEndpoint && (
                <span className="max-w-[420px] truncate text-xs text-slate-500 dark:text-slate-300">
                  {state.urlEndpoint}
                </span>
              )}
            </div>

            {hasConsulted && consultResult ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-gray-600">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {t("project.transferRequest.result.normalizedJson")}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.generalBatchInfo")}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      {t("project.transferRequest.result.metadata")}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.date")}
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {formatDateTime(consultResult.metadata.GeneratedAt)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.action")}
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {t(
                          "project.transferRequest.result.receivedAccountingBatch",
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.identification")}
                      </p>

                      <p className="mt-2 break-all text-sm font-medium text-slate-900 dark:text-white">
                        {consultResult.metadata.ExchangeId}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.system")}
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {consultResult.metadata.SourceSystem?.SystemName || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.result")}
                      </p>

                      <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
                        {t("project.transferRequest.result.httpOk")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-gray-600">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {t(
                          "project.transferRequest.result.amountsAndDocuments",
                        )}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.consolidatedTotals")}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      {t("project.transferRequest.result.summary")}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.total")}
                      </p>

                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(
                          consultResult.summary.TotalNet,
                          consultResult.summary.Currency,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.totalDocuments")}
                      </p>

                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {consultResult.summary.TotalDocuments}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.invoicesCount")}
                      </p>

                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {consultResult.summary.TotalInvoices}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {t("project.transferRequest.result.paymentsCount")}
                      </p>

                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {consultResult.summary.TotalTransactions}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      {t("project.transferRequest.result.queriedPeriod")}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                      {formatDateRange(
                        consultResult.metadata.RequestedPeriod?.From,
                        consultResult.metadata.RequestedPeriod?.To,
                      )}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-gray-600">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {t("project.transferRequest.result.invoicesTitle")}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {t(
                          "project.transferRequest.result.invoicesDescription",
                        )}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      {t("project.transferRequest.result.invoicesBadge")}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {consultResult.invoices.length > 0 ? (
                      consultResult.invoices.map((invoice) => (
                        <div
                          key={invoice.Header.DocumentId}
                          className="grid gap-4 rounded-xl border border-slate-200 p-4 dark:border-gray-600 md:grid-cols-2 xl:grid-cols-5"
                        >
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.date")}
                            </p>

                            <p className="mt-1 text-sm text-slate-900 dark:text-white">
                              {formatDateRange(
                                invoice.Header.IssueDate,
                                invoice.Header.DueDate,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.type")}
                            </p>

                            <p className="mt-1 text-sm text-slate-900 dark:text-white">
                              {invoice.Header.Type?.Name || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.amount")}
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                              {formatCurrency(
                                invoice.Totals.TotalPayment,
                                consultResult.summary.Currency,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.reference")}
                            </p>

                            <p className="mt-1 break-all text-sm text-slate-900 dark:text-white">
                              {invoice.Header.DocumentId}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.status")}
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClasses(
                                invoice.Header.Status,
                              )}`}
                            >
                              {getTranslatedStatus(invoice.Header.Status)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-gray-600 dark:text-slate-300">
                        {t("project.transferRequest.result.invoiceEmpty")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-gray-600">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {t("project.transferRequest.result.paymentsTitle")}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {t(
                          "project.transferRequest.result.paymentsDescription",
                        )}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      {t("project.transferRequest.result.transactionsBadge")}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {consultResult.transactions.length > 0 ? (
                      consultResult.transactions.map((transaction) => (
                        <div
                          key={transaction.DocumentId}
                          className="grid gap-4 rounded-xl border border-slate-200 p-4 dark:border-gray-600 md:grid-cols-2 xl:grid-cols-5"
                        >
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.date")}
                            </p>

                            <p className="mt-1 text-sm text-slate-900 dark:text-white">
                              {formatDate(transaction.Date)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.paymentMethod")}
                            </p>

                            <p className="mt-1 text-sm text-slate-900 dark:text-white">
                              {transaction.PaymentMethod?.Code || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.amount")}
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                              {formatCurrency(
                                transaction.Amount,
                                transaction.Currency ||
                                  consultResult.summary.Currency ||
                                  "COP",
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.reference")}
                            </p>

                            <p className="mt-1 break-all text-sm text-slate-900 dark:text-white">
                              {transaction.RelatedInvoiceId || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {t("project.transferRequest.result.status")}
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClasses(
                                transaction.Status,
                              )}`}
                            >
                              {getTranslatedStatus(transaction.Status)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-gray-600 dark:text-slate-300">
                        {t("project.transferRequest.result.paymentEmpty")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-gray-500 dark:bg-gray-800">
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {t("project.transferRequest.emptyState")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button color="light" onClick={() => navigate(goBackPath)}>
              <FiArrowLeft className="mr-2" />
              {t("common.cancel")}
            </Button>

            <Button color="blue" disabled={!consultResult}>
              <FiSend className="mr-2" />
              {t("project.transferRequest.transfer")}
            </Button>
          </div>
        </>
      )}

      {alert && (
        <AlertSimple
          message={alert.message}
          type={alert.type}
          to={alert.to}
          onClose={() => setAlert(null)}
        />
      )}
    </AppLayoutSB>
  );
};

export default AccountingTransferRequest;