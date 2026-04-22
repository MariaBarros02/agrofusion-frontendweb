import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Button, Label, Select, TextInput } from "flowbite-react";
import {
  AlertTriangle,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Info,
  RefreshCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import {
  kmsApi,
  type KmsAuditEventItem,
  type QuerySignaturesFilters,
  type SignatureQueryDetail,
  type SignatureQueryItem,
  type SignatureQueryResponse,
} from "../../services/agrofusion/kms.api";
import {
  KmsFeedbackModal,
  type KmsFeedbackVariant,
} from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

const PAGE_SIZE = 5;

type ValidationStatus = SignatureQueryItem["validation_status"];
type FilterStatus = ValidationStatus | "";

function formatDateTime(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(locale);
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

/**
 * RF-INT-19: Consulta y auditoría de firmas digitales.
 *
 * - Listado paginado (5 registros por página) con filtros por rango de
 *   fechas, firmante, tipo de documento y estado de validación.
 *   El filtro por ``project_id`` se omite intencionalmente tal como
 *   exige el requerimiento.
 * - Detalle funcional por firma (sin ``digital_signature`` ni contenido
 *   del certificado). ``key_id`` y ``certificate_id`` se muestran como
 *   trazabilidad técnica.
 * - Trazabilidad de auditoría asociada a la firma, su clave y su
 *   certificado.
 */
export default function QuerySignatures() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language?.startsWith("es") ? "es" : "en";

  const [feedback, setFeedback] = useState<{
    variant: KmsFeedbackVariant;
    message: string;
  } | null>(null);

  // Filtros de búsqueda.
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [signerId, setSignerId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [validationStatus, setValidationStatus] = useState<FilterStatus>("");

  // Paginación + datos.
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SignatureQueryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  // Detalle + auditoría.
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<SignatureQueryDetail | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditEvents, setAuditEvents] = useState<KmsAuditEventItem[]>([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildFilters = useCallback(
    (nextOffset: number): QuerySignaturesFilters => {
      const out: QuerySignaturesFilters = { offset: nextOffset };
      if (dateFrom) out.date_from = new Date(`${dateFrom}T00:00:00`).toISOString();
      if (dateTo) out.date_to = new Date(`${dateTo}T23:59:59`).toISOString();
      if (signerId.trim()) out.signer_user_id = signerId.trim();
      if (documentType.trim()) out.document_type = documentType.trim();
      if (validationStatus) out.validation_status = validationStatus;
      return out;
    },
    [dateFrom, dateTo, signerId, documentType, validationStatus],
  );

  const fetchPage = useCallback(
    async (nextOffset: number) => {
      setLoading(true);
      try {
        const { data } = await kmsApi.querySignatures(buildFilters(nextOffset));
        const resp = data as SignatureQueryResponse;
        setItems(resp.items ?? []);
        setTotal(resp.total_count ?? 0);
        setOffset(resp.offset ?? nextOffset);
      } catch (err: unknown) {
        setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
      } finally {
        setLoading(false);
      }
    },
    [buildFilters, t],
  );

  useEffect(() => {
    void fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    void fetchPage(0);
  };

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSignerId("");
    setDocumentType("");
    setValidationStatus("");
    setTimeout(() => void fetchPage(0), 0);
  };

  const goPrev = () => {
    if (offset <= 0) return;
    void fetchPage(Math.max(0, offset - PAGE_SIZE));
  };

  const goNext = () => {
    if (offset + PAGE_SIZE >= total) return;
    void fetchPage(offset + PAGE_SIZE);
  };

  const openDetail = async (signatureId: string) => {
    setSelectedSignatureId(signatureId);
    setDetail(null);
    setAuditEvents([]);
    setDetailLoading(true);
    try {
      const { data } = await kmsApi.getSignatureQueryDetail(signatureId);
      setDetail(data);
    } catch (err: unknown) {
      setFeedback({
        variant: "error",
        message:
          t("kms.query.loadDetailError") + " " + resolveKmsErrorMessage(t, err),
      });
    } finally {
      setDetailLoading(false);
    }

    setAuditLoading(true);
    try {
      const { data } = await kmsApi.getSignatureAuditTrail(signatureId);
      setAuditEvents(data.events ?? []);
    } catch (err: unknown) {
      setFeedback({
        variant: "error",
        message:
          t("kms.query.loadAuditError") + " " + resolveKmsErrorMessage(t, err),
      });
    } finally {
      setAuditLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedSignatureId(null);
    setDetail(null);
    setAuditEvents([]);
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (dateFrom) n++;
    if (dateTo) n++;
    if (signerId.trim()) n++;
    if (documentType.trim()) n++;
    if (validationStatus) n++;
    return n;
  }, [dateFrom, dateTo, signerId, documentType, validationStatus]);

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.query.title" description="kms.query.subtitle" />
      <div className="p-4 m-0 mt-3 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <KmsFeedbackModal
          open={!!feedback}
          variant={feedback?.variant ?? "error"}
          message={feedback?.message ?? ""}
          onAccept={() => setFeedback(null)}
        />

        <div className="max-w-6xl mx-auto">
          <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-slate-900/40">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <Filter className="h-3.5 w-3.5" aria-hidden />
              {t("kms.query.filtersTitle")}
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
              <div>
                <Label htmlFor="signerId">{t("kms.query.filterSignerUserId")}</Label>
                <TextInput
                  id="signerId"
                  value={signerId}
                  onChange={(e) => setSignerId(e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="mt-1 font-mono text-xs"
                />
              </div>
              <div>
                <Label htmlFor="docType">{t("kms.query.filterDocumentType")}</Label>
                <TextInput
                  id="docType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder={t("kms.query.filterDocumentTypePlaceholder")}
                  className="mt-1"
                />
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
                </Select>
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

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    {t("kms.query.tableId")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    {t("kms.query.tableSigner")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    {t("kms.query.tableSignedAt")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    {t("kms.query.tableDocumentId")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    {t("kms.query.tableDocumentType")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    {t("kms.query.tableFormat")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    {t("kms.query.tableStatus")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    {t("kms.query.tableExpiresAt")}
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      {t("kms.query.loading")}
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      {t("kms.query.empty")}
                    </td>
                  </tr>
                )}
                {!loading &&
                  items.map((row) => (
                    <tr
                      key={row.signature_id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-sky-50/60 dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {shortUuid(row.signature_id)}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                        {row.signer_name ?? shortUuid(row.signer_user_id)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {formatDateTime(row.signed_at, locale)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {shortUuid(row.document_id)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.document_type ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.signature_format}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(row.validation_status)}`}
                        >
                          {statusIcon(row.validation_status)}
                          {statusLabel(row.validation_status, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {formatDateTime(row.expires_at, locale)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => openDetail(row.signature_id)}
                        >
                          {t("kms.query.viewDetail")}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("kms.query.pageIndicator", { page, pages, total })}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                color="light"
                onClick={goPrev}
                disabled={loading || offset <= 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
                {t("kms.query.pagePrev")}
              </Button>
              <Button
                type="button"
                color="light"
                onClick={goNext}
                disabled={loading || offset + PAGE_SIZE >= total}
              >
                {t("kms.query.pageNext")}
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button color="light" type="button" onClick={() => navigate("/kms")}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>

        {selectedSignatureId &&
          createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-10 pb-12 backdrop-blur-[1px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeDetail();
              }}
            >
              <div
                className="mb-8 w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-600">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("kms.query.detailTitle")}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t("kms.query.detailHint")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                    aria-label={t("kms.query.closeDetail")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-5">
                  {detailLoading && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("kms.query.loading")}
                    </p>
                  )}
                  {detail && (
                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.detailSignatureId")}
                        </span>
                        <span className="break-all font-mono text-gray-800 dark:text-gray-100">
                          {detail.signature_id}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.tableStatus")}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(detail.validation_status)}`}
                        >
                          {statusIcon(detail.validation_status)}
                          {statusLabel(detail.validation_status, t)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.tableSigner")}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100">
                          {detail.signer_name ?? shortUuid(detail.signer_user_id)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.tableSignedAt")}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100">
                          {formatDateTime(detail.signed_at, locale)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.tableDocumentId")}
                        </span>
                        <span className="break-all font-mono text-gray-800 dark:text-gray-100">
                          {detail.document_id ?? "—"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.tableDocumentType")}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100">
                          {detail.document_type ?? "—"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.tableFormat")}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100">
                          {detail.signature_format}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.tableExpiresAt")}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100">
                          {formatDateTime(detail.expires_at, locale)}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.detailDocumentHash")}
                        </span>
                        <span className="break-all font-mono text-xs text-gray-800 dark:text-gray-100">
                          {detail.document_hash ?? "—"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.detailHashAlg")}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100">
                          {detail.hash_algorithm ?? "—"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.detailSigningReason")}
                        </span>
                        <span className="text-gray-800 dark:text-gray-100">
                          {detail.signing_reason ?? "—"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.detailKeyId")}
                        </span>
                        <span className="break-all font-mono text-xs text-gray-700 dark:text-gray-300">
                          {detail.key_id ?? "—"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                          {t("kms.query.detailCertId")}
                        </span>
                        <span className="break-all font-mono text-xs text-gray-700 dark:text-gray-300">
                          {detail.certificate_id ?? "—"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-600">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                      {t("kms.query.auditTrailTitle")}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t("kms.query.auditTrailHint")}
                    </p>

                    {auditLoading && (
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {t("kms.query.loading")}
                      </p>
                    )}

                    {!auditLoading && auditEvents.length === 0 && (
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {t("kms.query.auditEmpty")}
                      </p>
                    )}

                    {!auditLoading && auditEvents.length > 0 && (
                      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr>
                              <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                                {t("kms.query.auditAction")}
                              </th>
                              <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                                {t("kms.query.auditWhen")}
                              </th>
                              <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                                {t("kms.query.auditActor")}
                              </th>
                              <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                                {t("kms.query.auditOutcome")}
                              </th>
                              <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                                {t("kms.query.auditTarget")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditEvents.map((ev) => (
                              <tr
                                key={ev.audit_id}
                                className="border-t border-gray-100 dark:border-gray-700"
                              >
                                <td className="px-3 py-2 font-mono text-[11px] text-gray-800 dark:text-gray-100">
                                  {ev.action_code}
                                </td>
                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                  {formatDateTime(ev.created_at, locale)}
                                </td>
                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                  {ev.actor_name ?? shortUuid(ev.actor_id)}
                                </td>
                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                  {ev.outcome ?? "—"}
                                </td>
                                <td className="px-3 py-2 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                                  {ev.target_type
                                    ? `${ev.target_type}:${shortUuid(ev.target_id)}`
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-600">
                  <Button color="light" type="button" onClick={closeDetail}>
                    {t("kms.query.closeDetail")}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </AppLayoutSB>
  );
}
