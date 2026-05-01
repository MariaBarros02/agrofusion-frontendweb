import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { Button, Label, TextInput } from "flowbite-react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  ShieldCheck,
  FileText,
  User as UserIcon,
  Search,
  Upload,
} from "lucide-react";
import {
  kmsApi,
  type SignatureListItem,
  type SignatureValidationFriendly,
} from "../../services/agrofusion/kms.api";
import { KmsFeedbackModal, type KmsFeedbackVariant } from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Normaliza el hash persistido (hex o Base64 del digest) a hex minúsculas. */
function normalizeDocumentHashToHex(stored: string | null | undefined): string | null {
  if (!stored?.trim()) return null;
  const s = stored.trim().replace(/\s+/g, "");
  const lower = s.toLowerCase();
  if (/^[0-9a-f]+$/.test(lower) && [64, 96, 128].includes(lower.length)) {
    return lower;
  }
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bufferToHex(bytes.buffer);
  } catch {
    return null;
  }
}

function parseHashAlgForSubtle(label: string | null | undefined): AlgorithmIdentifier {
  const n = (label ?? "SHA-256").trim().toUpperCase().replace(/\s+/g, "");
  if (n === "SHA256" || n === "SHA-256") return "SHA-256";
  if (n === "SHA384" || n === "SHA-384") return "SHA-384";
  if (n === "SHA512" || n === "SHA-512") return "SHA-512";
  return "SHA-256";
}

type FileIntegrityState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "match" }
  | { kind: "mismatch" }
  | { kind: "noStoredHash" }
  | { kind: "invalidStoredHash" }
  | { kind: "digestError" };

/**
 * RF-INT-18: Presentación al usuario del resultado de validación de firmas.
 *
 * El usuario:
 *   - Selecciona un registro de firma existente (sin digitar nada técnico).
 *   - El sistema invoca internamente el proceso de validación (RF-INT-17).
 *   - La respuesta se traduce a lenguaje comprensible (Válida / Inválida /
 *     Expirada / Revocada) y se muestran los campos mínimos requeridos:
 *     estado, firmante, fecha de firma e identificador de documento.
 *   - Los datos técnicos se muestran como información de solo lectura.
 */
export default function ValidateSignatureFriendly() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectFromUrl = useRef(false);

  const [signatures, setSignatures] = useState<SignatureListItem[]>([]);
  const [totalInSystem, setTotalInSystem] = useState(0);
  const [filterText, setFilterText] = useState("");
  /** true tras el primer fetch (éxito o error) */
  const [listFetchDone, setListFetchDone] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SignatureValidationFriendly | null>(null);
  const [feedback, setFeedback] = useState<{
    variant: KmsFeedbackVariant;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [integrity, setIntegrity] = useState<FileIntegrityState>({ kind: "idle" });

  /** Panel bajo el input: abierto tras cargar, o al enfocar con datos */
  const [listOpen, setListOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  const loadSignatureList = useCallback(async () => {
    setLoadingList(true);
    setListError(false);
    if (!preselectFromUrl.current) {
      setSelectedId("");
    }
    setResult(null);
    setListOpen(true);
    try {
      const res = await kmsApi.listSignatures({ limit: 1000, offset: 0 });
      setSignatures(res.data.signatures ?? []);
      setTotalInSystem(res.data.total ?? 0);
    } catch {
      setListError(true);
      setSignatures([]);
      setTotalInSystem(0);
    } finally {
      setLoadingList(false);
      setListFetchDone(true);
      setListOpen(true);
    }
  }, []);

  const formatSignatureLabel = useCallback((s: SignatureListItem) => {
    const when = s.signed_at ? new Date(s.signed_at).toLocaleString() : "—";
    const h = s.document_hash?.length ? `${s.document_hash.slice(0, 10)}…` : "—";
    const dtype = s.document_type?.trim();
    return dtype ? `${when}  ·  ${dtype}  ·  ${h}` : `${when}  ·  ${h}`;
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = comboboxRef.current;
      if (el && !el.contains(e.target as Node)) setListOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const id = searchParams.get("signatureId");
    if (!id?.trim()) return;
    preselectFromUrl.current = true;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await kmsApi.getSignature(id.trim());
        if (cancelled) return;
        setSelectedId(data.signature_id);
        setFilterText(formatSignatureLabel(data));
        setSignatures((prev) => {
          if (prev.some((s) => s.signature_id === data.signature_id)) return prev;
          return [data, ...prev];
        });
        setListFetchDone(true);
        setListError(false);
      } catch {
        if (!cancelled) preselectFromUrl.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, formatSignatureLabel]);

  const filteredSignatures = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return signatures;
    return signatures.filter((s) => {
      if (selectedId && s.signature_id === selectedId) return true;
      const blob = [
        s.signed_at,
        s.document_hash,
        s.signature_id,
        s.document_id,
        s.document_type,
        s.key_id,
        s.hash_algorithm,
        s.signer_user_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [signatures, filterText, selectedId]);

  useEffect(() => {
    if (selectedId && !filteredSignatures.some((s) => s.signature_id === selectedId)) {
      setSelectedId("");
    }
  }, [filteredSignatures, selectedId]);

  const selectedSignature = useMemo(
    () => signatures.find((s) => s.signature_id === selectedId) ?? null,
    [signatures, selectedId],
  );

  const resetIntegrityCheck = useCallback(() => {
    setIntegrity({ kind: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  useEffect(() => {
    resetIntegrityCheck();
  }, [selectedId, resetIntegrityCheck]);

  const storedHashRaw =
    result?.datos_tecnicos.hash_documento ?? selectedSignature?.document_hash ?? null;
  const storedHashAlg =
    result?.datos_tecnicos.algoritmo_hash ?? selectedSignature?.hash_algorithm ?? null;

  const normalizedStoredHex = useMemo(
    () => normalizeDocumentHashToHex(storedHashRaw),
    [storedHashRaw],
  );

  const onIntegrityFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        setIntegrity({ kind: "idle" });
        return;
      }
      if (!storedHashRaw?.trim()) {
        setIntegrity({ kind: "noStoredHash" });
        return;
      }
      if (!normalizedStoredHex) {
        setIntegrity({ kind: "invalidStoredHash" });
        return;
      }
      try {
        setIntegrity({ kind: "checking" });
        const alg = parseHashAlgForSubtle(storedHashAlg);
        const buf = await file.arrayBuffer();
        const digest = await crypto.subtle.digest(alg, buf);
        const hexFile = bufferToHex(digest);
        setIntegrity(hexFile === normalizedStoredHex ? { kind: "match" } : { kind: "mismatch" });
      } catch {
        setIntegrity({ kind: "digestError" });
      }
    },
    [normalizedStoredHex, storedHashRaw, storedHashAlg],
  );

  const validate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setFeedback({
        variant: "warning",
        message: t("kms.validatePresentable.missingSignature"),
      });
      return;
    }
    setLoading(true);
    setResult(null);
    resetIntegrityCheck();
    setFeedback(null);
    try {
      const { data } = await kmsApi.validateSignaturePresentable(selectedId);
      setResult(data);
    } catch (err: unknown) {
      setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
    } finally {
      setLoading(false);
    }
  };

  const renderEstadoBadge = (estado: string) => {
    const low = estado.toLowerCase();
    let Icon = ShieldCheck;
    let cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (low.includes("inv")) {
      Icon = XCircle;
      cls = "bg-red-50 text-red-700 border-red-200";
    } else if (low.includes("exp")) {
      Icon = Clock;
      cls = "bg-amber-50 text-amber-700 border-amber-200";
    } else if (low.includes("rev")) {
      Icon = Ban;
      cls = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (low.includes("v")) {
      Icon = CheckCircle2;
      cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${cls}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {estado}
      </span>
    );
  };

  const listPanelVisible =
    loadingList || (listOpen && (listFetchDone || listError));

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.validatePresentable.title" description="kms.validatePresentable.subtitle" />
      <div className="p-4 m-0 mt-3 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <KmsFeedbackModal
          open={!!feedback}
          variant={feedback?.variant ?? "error"}
          message={feedback?.message ?? ""}
          onAccept={() => setFeedback(null)}
        />

        <form onSubmit={validate} className="max-w-5xl mx-auto">
          <div className="mb-8 rounded-xl border border-sky-100 bg-sky-50/80 p-5 dark:border-slate-600 dark:bg-slate-800/60">
            <Label htmlFor="sig" className="text-gray-900 dark:text-white text-base font-semibold">
              {t("kms.validatePresentable.selectLabel")}
            </Label>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t("kms.validatePresentable.selectHelp")}
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <Label
                  htmlFor="signature-search"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("kms.validatePresentable.searchLabel")}
                </Label>
                <div ref={comboboxRef} className="relative mt-1">
                  <div className="relative min-w-0">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden
                    />
                    <TextInput
                      id="signature-search"
                      type="search"
                      role="combobox"
                      aria-expanded={listPanelVisible}
                      aria-controls="signature-listbox"
                      aria-autocomplete="list"
                      value={filterText}
                      disabled={loadingList}
                      onChange={(e) => {
                        setFilterText(e.target.value);
                        setSelectedId("");
                        if (listFetchDone) setListOpen(true);
                      }}
                      onFocus={() => {
                        if (!loadingList && (!listFetchDone || listError)) {
                          void loadSignatureList();
                        } else if (listFetchDone && !listError) {
                          setListOpen(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          setListOpen(false);
                        }
                      }}
                      placeholder={t("kms.validatePresentable.searchPlaceholder")}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                  {listPanelVisible && (
                    <div
                      id="signature-listbox"
                      role="listbox"
                      aria-label={t("kms.validatePresentable.selectLabel")}
                      className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800"
                    >
                      {loadingList ? (
                        <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                          {t("kms.validatePresentable.loading")}
                        </p>
                      ) : listError ? (
                        <p className="p-3 text-sm text-amber-700 dark:text-amber-400">
                          {t("kms.validatePresentable.loadError")}
                        </p>
                      ) : filteredSignatures.length === 0 ? (
                        <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                          {signatures.length === 0
                            ? t("kms.validatePresentable.empty")
                            : t("kms.validatePresentable.noFilterMatches")}
                        </p>
                      ) : (
                        <ul className="max-h-60 overflow-y-auto overflow-x-hidden p-1">
                          {filteredSignatures.map((s) => {
                            const active = s.signature_id === selectedId;
                            return (
                              <li key={s.signature_id}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={active}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setSelectedId(s.signature_id);
                                    setFilterText(formatSignatureLabel(s));
                                    setResult(null);
                                    setListOpen(false);
                                  }}
                                  className={[
                                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                                    active
                                      ? "bg-sky-100 font-medium text-sky-900 dark:bg-sky-900/40 dark:text-sky-100"
                                      : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-700/80",
                                  ].join(" ")}
                                >
                                  {formatSignatureLabel(s)}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("kms.validatePresentable.beforeSearchHint")}
                </p>
                {listFetchDone && !loadingList && !listError && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    {t("kms.validatePresentable.listMeta", {
                      shown: filteredSignatures.length,
                      loaded: signatures.length,
                      total: totalInSystem,
                    })}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="submit"
                  disabled={loading || !selectedId}
                  className="w-full bg-blue-600 enabled:hover:bg-blue-700 sm:w-auto sm:min-w-[9rem]"
                >
                  {loading ? "…" : t("kms.validatePresentable.validateBtn")}
                </Button>
              </div>
            </div>
          </div>

          {selectedSignature && !result && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-slate-600 dark:bg-slate-800/50">
              <p className="text-gray-700 dark:text-gray-200">
                {t("kms.validatePresentable.aboutToValidate")}
              </p>
            </div>
          )}

          {selectedSignature && (
            <div
              className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/80 p-6 shadow-sm dark:border-teal-900/40 dark:bg-teal-950/30"
              aria-labelledby="integrity-heading"
            >
              <h3
                id="integrity-heading"
                className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white"
              >
                <Upload className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden />
                {t("kms.validatePresentable.integrityTitle")}
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {t("kms.validatePresentable.integritySubtitle")}
              </p>

              {!storedHashRaw?.trim() ? (
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t("kms.validatePresentable.integrityNoStoredHash")}
                </p>
              ) : !normalizedStoredHex ? (
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t("kms.validatePresentable.integrityInvalidStoredHash")}
                </p>
              ) : (
                <>
                  <div className="max-w-xl">
                    <Label htmlFor="integrity-file">{t("kms.validatePresentable.integrityFileLabel")}</Label>
                    <input
                      ref={fileInputRef}
                      id="integrity-file"
                      type="file"
                      onChange={onIntegrityFile}
                      className="mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:file:bg-teal-700 dark:hover:file:bg-teal-600"
                    />
                  </div>

                  {storedHashAlg?.trim() ? (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      {t("kms.validatePresentable.integrityAlgoHint", { alg: storedHashAlg })}
                    </p>
                  ) : null}

                  <div className="mt-4 space-y-3" role="status" aria-live="polite">
                    {integrity.kind === "checking" && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t("kms.validatePresentable.integrityChecking")}
                      </p>
                    )}
                    {integrity.kind === "match" && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/40">
                        <p className="flex items-start gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                          {t("kms.validatePresentable.integrityMatch")}
                        </p>
                      </div>
                    )}
                    {integrity.kind === "digestError" && (
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {t("kms.validatePresentable.integrityDigestError")}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t("kms.validatePresentable.resultTitle")}
                    </p>
                    <div className="mt-2">{renderEstadoBadge(result.estado)}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                    <p>
                      <span className="font-semibold">ID Validación:</span>{" "}
                      <span className="font-mono">{result.validation_id}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
                  {result.resultado_general}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                    {t("kms.validatePresentable.signerBlock")}
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">
                        {t("kms.validatePresentable.signerName")}
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {result.firmante || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">
                        {t("kms.validatePresentable.signerEmail")}
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {result.firmante_email || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">
                        {t("kms.validatePresentable.signedAt")}
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {formatDate(result.fecha_firma)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    {t("kms.validatePresentable.documentBlock")}
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">
                        {t("kms.validatePresentable.documentId")}
                      </dt>
                      <dd className="font-mono text-xs break-all text-gray-900 dark:text-white">
                        {result.identificador_documento || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">
                        {t("kms.validatePresentable.documentType")}
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {result.tipo_documento || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">
                        {t("kms.validatePresentable.signingReason")}
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {result.razon_firma || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6 shadow-sm dark:border-slate-600 dark:bg-slate-800/60">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  <ShieldCheck className="h-5 w-5 text-violet-600" />
                  {t("kms.validatePresentable.technicalBlock")}
                </h3>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  {t("kms.validatePresentable.technicalHint")}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>{t("kms.validatePresentable.hash")}</Label>
                    <TextInput
                      readOnly
                      value={result.datos_tecnicos.hash_documento ?? ""}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label>{t("kms.validatePresentable.hashAlg")}</Label>
                    <TextInput readOnly value={result.datos_tecnicos.algoritmo_hash ?? ""} />
                  </div>
                  <div>
                    <Label>{t("kms.validatePresentable.signatureFormat")}</Label>
                    <TextInput readOnly value={result.datos_tecnicos.formato_firma ?? ""} />
                  </div>
                  <div>
                    <Label>{t("kms.validatePresentable.signatureAlg")}</Label>
                    <TextInput readOnly value={result.datos_tecnicos.algoritmo_firma ?? ""} />
                  </div>
                  <div>
                    <Label>{t("kms.validatePresentable.certificateId")}</Label>
                    <TextInput
                      readOnly
                      value={result.datos_tecnicos.certificate_id ?? ""}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label>{t("kms.validatePresentable.certificateSerial")}</Label>
                    <TextInput readOnly value={result.datos_tecnicos.certificate_serial ?? ""} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>{t("kms.validatePresentable.certificateFingerprint")}</Label>
                    <TextInput
                      readOnly
                      value={result.datos_tecnicos.certificate_fingerprint ?? ""}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button color="light" type="button" onClick={() => navigate("/kms")}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </AppLayoutSB>
  );
}
