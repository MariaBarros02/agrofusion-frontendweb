import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { AlertTriangle, Ban, Clock, Filter, Info, RefreshCcw, Search, ShieldCheck } from "lucide-react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import DataTable, { type Column } from "../../components/DataTable";
import {
  kmsApi,
  type QuerySignaturesFilters,
  type SignatureQueryItem,
} from "../../services/agrofusion/kms.api";
import { KmsFeedbackModal, type KmsFeedbackVariant } from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

const PAGE_SIZE = 10;

type ValidationStatus = SignatureQueryItem["validation_status"];
type FilterStatus = ValidationStatus | "";

function formatDateOnly(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale);
}

function shortUuid(u: string | null | undefined): string {
  if (!u) return "—";
  if (u.length < 10) return u;
  return `${u.slice(0, 8)}…`;
}

function statusBadgeClass(s: ValidationStatus): string {
  switch (s) {
    case "valid":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "invalid":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200";
    case "expired":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "revoked":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
  }
}

function statusIcon(s: ValidationStatus) {
  if (s === "valid") return <ShieldCheck className="h-3.5 w-3.5" aria-hidden />;
  if (s === "revoked") return <Ban className="h-3.5 w-3.5" aria-hidden />;
  if (s === "expired") return <Clock className="h-3.5 w-3.5" aria-hidden />;
  if (s === "invalid") return <AlertTriangle className="h-3.5 w-3.5" aria-hidden />;
  return <Info className="h-3.5 w-3.5" aria-hidden />;
}

function statusLabel(s: ValidationStatus, t: (k: string) => string): string {
  switch (s) {
    case "valid":
      return t("kms.query.statusValid");
    case "invalid":
      return t("kms.query.statusInvalid");
    case "expired":
      return t("kms.query.statusExpired");
    case "revoked":
      return t("kms.query.statusRevoked");
    default:
      return t("kms.query.statusUnknown");
  }
}

const KEY_ALGORITHM_OPTIONS = [
  "",
  "RSA-2048",
  "RSA-4096",
  "ECDSA-P256",
  "ECDSA-P384",
];

/**
 * Lotes de exportación de auditoría firmados (af_kms_signatures, AUDIT_EXPORT).
 * Listado paginado con DataTable; acción «Validar» abre la vista de validación amigable.
 */
export default function QuerySignatures() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language?.startsWith("es") ? "es" : "en";

  const [feedback, setFeedback] = useState<{
    variant: KmsFeedbackVariant;
    message: string;
  } | null>(null);

  const [searchQ, setSearchQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [signerName, setSignerName] = useState("");
  const [keyAlgorithm, setKeyAlgorithm] = useState("");
  const [validationStatus, setValidationStatus] = useState<FilterStatus>("");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SignatureQueryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const buildFilters = useCallback(
    (reqOffset: number): QuerySignaturesFilters => {
      const out: QuerySignaturesFilters = {
        offset: reqOffset,
        limit: PAGE_SIZE,
        audit_export_only: true,
      };
      if (dateFrom) out.date_from = new Date(`${dateFrom}T00:00:00`).toISOString();
      if (dateTo) out.date_to = new Date(`${dateTo}T23:59:59`).toISOString();
      if (searchQ.trim()) out.q = searchQ.trim();
      if (signerName.trim()) out.signer_name = signerName.trim();
      if (keyAlgorithm.trim()) out.key_algorithm = keyAlgorithm.trim();
      if (validationStatus) out.validation_status = validationStatus;
      return out;
    },
    [dateFrom, dateTo, searchQ, signerName, keyAlgorithm, validationStatus],
  );

  const fetchPage = useCallback(
    async (page: number) => {
      setLoading(true);
      const p = Math.max(1, page);
      const off = (p - 1) * PAGE_SIZE;
      try {
        const { data } = await kmsApi.querySignatures(buildFilters(off));
        setItems(data.items ?? []);
        setTotal(data.total_count ?? 0);
        setCurrentPage(p);
      } catch (err: unknown) {
        setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
      } finally {
        setLoading(false);
      }
    },
    [buildFilters, t],
  );

  useEffect(() => {
    void fetchPage(1);
  }, [fetchPage]);

  const applyFilters = () => {
    void fetchPage(1);
  };

  const resetFilters = () => {
    setSearchQ("");
    setDateFrom("");
    setDateTo("");
    setSignerName("");
    setKeyAlgorithm("");
    setValidationStatus("");
  };

  const onTablePageChange = (page: number) => {
    void fetchPage(page);
  };

  const goValidate = useCallback(
    (row: SignatureQueryItem) => {
      navigate(`/kms/validar-firma?signatureId=${encodeURIComponent(row.signature_id)}`);
    },
    [navigate],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (searchQ.trim()) n++;
    if (dateFrom) n++;
    if (dateTo) n++;
    if (signerName.trim()) n++;
    if (keyAlgorithm.trim()) n++;
    if (validationStatus) n++;
    return n;
  }, [searchQ, dateFrom, dateTo, signerName, keyAlgorithm, validationStatus]);

  const columns: Column<SignatureQueryItem>[] = useMemo(
    () => [
      {
        key: "export_name",
        label: t("kms.query.colBatchName"),
        type: "text",
        width: "18%",
        format: (_v, row) => (
          <span className="text-gray-900 dark:text-gray-100">
            {row.export_name?.trim() || shortUuid(row.document_id) || "—"}
          </span>
        ),
      },
      {
        key: "key_algorithm",
        label: t("kms.query.colKeyType"),
        type: "text",
        width: "10%",
        format: (v) => (v as string) || "—",
      },
      {
        key: "validation_status",
        label: t("kms.query.tableStatus"),
        type: "text",
        width: "14%",
        format: (v) => {
          const s = v as ValidationStatus;
          return (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(s)}`}
            >
              {statusIcon(s)}
              {statusLabel(s, t)}
            </span>
          );
        },
      },
      {
        key: "signed_at",
        label: t("kms.query.colLastUse"),
        type: "text",
        width: "12%",
        format: (v) => formatDateOnly(v as string, locale),
      },
      {
        key: "expires_at",
        label: t("kms.query.tableExpiresAt"),
        type: "text",
        width: "12%",
        format: (v) => formatDateOnly(v as string | null, locale),
      },
      {
        key: "signer_name",
        label: t("kms.query.filterIssuer"),
        type: "text",
        width: "16%",
        format: (v) => (v as string)?.trim() || "—",
      },
      {
        key: "signature_id",
        type: "action",
        label: t("kms.query.actions"),
        width: "10%",
        align: "center",
        action: {
          label: t("kms.query.validateAction"),
          onClick: (row) => goValidate(row),
          className: "border-sky-600 text-sky-700 hover:bg-sky-50 dark:border-sky-500 dark:text-sky-300",
        },
      },
    ],
    [t, locale, goValidate],
  );

  const paginated = useMemo(
    () => ({
      items,
      total,
      page: currentPage,
      size: PAGE_SIZE,
      total_pages: Math.max(1, Math.ceil(total / PAGE_SIZE) || 1),
    }),
    [items, total, currentPage],
  );

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.query.title" description="kms.query.subtitle" />
      <div className="m-0 mt-3 h-[calc(100vh-130px)] overflow-auto rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700">
        <KmsFeedbackModal
          open={!!feedback}
          variant={feedback?.variant ?? "error"}
          message={feedback?.message ?? ""}
          onAccept={() => setFeedback(null)}
        />

        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-slate-900/40">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <Filter className="h-3.5 w-3.5" aria-hidden />
              {t("kms.query.filtersTitle")}
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                  {t("kms.query.activeFiltersCount", { count: activeFilterCount })}
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="sm:col-span-2">
                <Label htmlFor="qSearch">{t("kms.query.filterSearch")}</Label>
                <div className="relative mt-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden
                  />
                  <TextInput
                    id="qSearch"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder={t("kms.query.filterSearchPlaceholder")}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="vStatus">{t("kms.query.filterValidationStatus")}</Label>
                <Select
                  id="vStatus"
                  value={validationStatus}
                  onChange={(e) => setValidationStatus(e.target.value as FilterStatus)}
                  className="mt-1"
                >
                  <option value="">{t("kms.query.statusAll")}</option>
                  <option value="valid">{t("kms.query.statusValid")}</option>
                  <option value="invalid">{t("kms.query.statusInvalid")}</option>
                  <option value="expired">{t("kms.query.statusExpired")}</option>
                  <option value="revoked">{t("kms.query.statusRevoked")}</option>
                  <option value="unknown">{t("kms.query.statusUnknown")}</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="issuerName">{t("kms.query.filterIssuer")}</Label>
                <TextInput
                  id="issuerName"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder={t("kms.query.filterIssuerPlaceholder")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="keyAlg">{t("kms.query.filterKeyType")}</Label>
                <Select
                  id="keyAlg"
                  value={keyAlgorithm}
                  onChange={(e) => setKeyAlgorithm(e.target.value)}
                  className="mt-1"
                >
                  {KEY_ALGORITHM_OPTIONS.map((opt) => (
                    <option key={opt || "all"} value={opt}>
                      {opt || t("kms.query.keyTypeAny")}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fromDate">{t("kms.query.filterDateFrom")}</Label>
                <TextInput
                  id="fromDate"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="toDate">{t("kms.query.filterDateTo")}</Label>
                <TextInput
                  id="toDate"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <Button type="button" color="light" onClick={resetFilters}>
                <RefreshCcw className="mr-2 h-4 w-4" aria-hidden />
                {t("kms.query.resetFilters")}
              </Button>
              <Button
                type="button"
                onClick={applyFilters}
                className="bg-blue-600 enabled:hover:bg-blue-700"
              >
                <Search className="mr-2 h-4 w-4" aria-hidden />
                {t("kms.query.applyFilters")}
              </Button>
            </div>
          </div>

          {loading && (
            <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("kms.query.loading")}
            </p>
          )}

          {!loading && items.length === 0 && (
            <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
              <p className="text-lg text-gray-500 dark:text-gray-400">{t("kms.query.empty")}</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <DataTable<SignatureQueryItem>
              data={paginated}
              columns={columns}
              onPageChange={onTablePageChange}
              paginationText={t("kms.query.dataTableOf")}
              maxVisiblePages={5}
            />
          )}
        </div>
      </div>
    </AppLayoutSB>
  );
}
