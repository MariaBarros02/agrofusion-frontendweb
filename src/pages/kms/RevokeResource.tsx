import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, Select, TextInput, Textarea } from "flowbite-react";
import { AlertTriangle, Ban, Check, KeyRound, ShieldAlert } from "lucide-react";
import { createPortal } from "react-dom";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import {
  kmsApi,
  type RevokePayload,
  type RevokeResponse,
} from "../../services/agrofusion/kms.api";
import {
  KmsFeedbackModal,
  type KmsFeedbackVariant,
} from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

type ResourceType = "key" | "certificate";
type RevokeReason = "compromised" | "manual" | "policy";

type KeyOption = {
  key_id: string;
  key_alias: string;
  status?: string;
};

type AssociatedCertificate = {
  certificate_id: string;
  status: string;
  serial_number?: string;
  subject?: string;
  issuer?: string;
  valid_from?: string;
  valid_to?: string;
  fingerprint?: string;
};

function formatDisplayDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

/**
 * Página de revocación (RF-INT-20).
 * Permite revocar una clave criptográfica o un certificado digital, indicando
 * motivo (compromised | manual | policy) y una nota administrativa opcional.
 * Si se revoca una clave y tiene un certificado activo, el backend lo revoca
 * en cascada dentro de la misma transacción.
 */
export default function RevokeResource() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<{
    variant: KmsFeedbackVariant;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCert, setLoadingCert] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [resourceType, setResourceType] = useState<ResourceType>("key");
  const [allKeys, setAllKeys] = useState<KeyOption[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState("");
  const [keyId, setKeyId] = useState("");
  const [keyStatus, setKeyStatus] = useState<string>("");

  const [certificate, setCertificate] = useState<AssociatedCertificate | null>(
    null,
  );
  const [certificateId, setCertificateId] = useState("");

  const [reason, setReason] = useState<RevokeReason>("manual");
  const [note, setNote] = useState("");

  const [result, setResult] = useState<RevokeResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await kmsApi.listKeys();
        const keys = (data as { keys?: KeyOption[] }).keys ?? [];
        if (!cancelled) {
          setAllKeys(
            keys.map((k) => ({
              key_id: String(k.key_id),
              key_alias: k.key_alias,
              status: k.status ? String(k.status) : undefined,
            })),
          );
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setAllKeys([]);
          setFeedback({
            variant: "error",
            message: t("kms.revoke.loadKeysError") + " " + resolveKmsErrorMessage(t, err),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const selectableKeys = useMemo(
    () =>
      allKeys.filter((k) => (k.status ?? "").toLowerCase() !== "revoked"),
    [allKeys],
  );

  const loadCertificateForKey = async (kid: string) => {
    setCertificate(null);
    setCertificateId("");
    if (!kid) return;
    setLoadingCert(true);
    try {
      const { data } = await kmsApi.getCertificateByKeyId(kid);
      const cert: AssociatedCertificate = {
        certificate_id: String(data.certificate_id),
        status: String(data.status ?? "").toLowerCase(),
        serial_number: data.serial_number,
        subject: data.subject,
        issuer: data.issuer,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
        fingerprint: data.fingerprint,
      };
      setCertificate(cert);
      setCertificateId(cert.certificate_id);
    } catch (err: unknown) {
      setFeedback({
        variant: "error",
        message:
          t("kms.revoke.loadCertError") + " " + resolveKmsErrorMessage(t, err),
      });
    } finally {
      setLoadingCert(false);
    }
  };

  const handleSelectKey = (value: string) => {
    setSelectedKeyId(value);
    setKeyId(value);
    const row = allKeys.find((k) => k.key_id === value);
    setKeyStatus(row?.status ?? "");
    setResult(null);
    if (resourceType === "certificate") {
      void loadCertificateForKey(value);
    } else {
      setCertificate(null);
      setCertificateId("");
    }
  };

  const handleResourceTypeChange = (next: ResourceType) => {
    setResourceType(next);
    setResult(null);
    setCertificate(null);
    setCertificateId("");
    if (next === "certificate" && keyId) {
      void loadCertificateForKey(keyId);
    }
  };

  const canSubmit = useMemo(() => {
    if (resourceType === "key") return keyId.trim().length > 0;
    return certificateId.trim().length > 0;
  }, [resourceType, keyId, certificateId]);

  const onRequestConfirm = () => {
    setFeedback(null);
    if (!canSubmit) {
      setFeedback({
        variant: "warning",
        message:
          resourceType === "key"
            ? t("kms.revoke.needResource")
            : t("kms.revoke.needCertId"),
      });
      return;
    }
    if (resourceType === "key" && keyStatus.toLowerCase() === "revoked") {
      setFeedback({ variant: "warning", message: t("kms.revoke.alreadyRevokedKey") });
      return;
    }
    if (
      resourceType === "certificate" &&
      certificate?.status?.toLowerCase() === "revoked"
    ) {
      setFeedback({ variant: "warning", message: t("kms.revoke.alreadyRevokedCert") });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmRevoke = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setResult(null);
    try {
      const payload: RevokePayload = {
        reason,
        note: note.trim() ? note.trim() : null,
      };
      const { data } =
        resourceType === "key"
          ? await kmsApi.revokeKey(keyId.trim(), payload)
          : await kmsApi.revokeCertificate(certificateId.trim(), payload);
      setResult(data);
      const successMsg = data.cascaded_certificate_id
        ? t("kms.revoke.successWithCascade", {
            cert: data.cascaded_certificate_id,
          })
        : t("kms.revoke.success");
      setFeedback({ variant: "success", message: successMsg });

      if (resourceType === "key") {
        setKeyStatus("revoked");
      } else if (certificate) {
        setCertificate({ ...certificate, status: "revoked" });
      }
    } catch (err: unknown) {
      setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
    } finally {
      setLoading(false);
    }
  };

  const reasonBadgeClass = (r: RevokeReason) => {
    if (r === "compromised") return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
    if (r === "policy") return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    return "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200";
  };

  const confirmBody =
    resourceType === "key"
      ? t("kms.revoke.confirmBodyKey", { id: keyId })
      : t("kms.revoke.confirmBodyCert", { id: certificateId });

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.revoke.title" description="kms.revoke.subtitle" />
      <div className="p-4 m-0 mt-3 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <KmsFeedbackModal
          open={!!feedback}
          variant={feedback?.variant ?? "error"}
          message={feedback?.message ?? ""}
          onAccept={() => setFeedback(null)}
        />

        <div className="max-w-5xl mx-auto">
          <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50/70 p-4 dark:border-rose-900/40 dark:bg-rose-900/20">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-300" />
              <div>
                <Label className="text-gray-900 dark:text-white">
                  {t("kms.revoke.resourceTypeLabel")}
                </Label>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {t("kms.revoke.resourceTypeHint")}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleResourceTypeChange("key")}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
                      resourceType === "key"
                        ? "border-rose-500 bg-white text-rose-700 shadow-sm dark:bg-slate-800 dark:text-rose-200"
                        : "border-transparent bg-white/60 text-gray-700 hover:border-rose-200 dark:bg-slate-800/50 dark:text-gray-200"
                    }`}
                  >
                    <KeyRound className="h-4 w-4" aria-hidden />
                    {t("kms.revoke.resourceTypeKey")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResourceTypeChange("certificate")}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
                      resourceType === "certificate"
                        ? "border-rose-500 bg-white text-rose-700 shadow-sm dark:bg-slate-800 dark:text-rose-200"
                        : "border-transparent bg-white/60 text-gray-700 hover:border-rose-200 dark:bg-slate-800/50 dark:text-gray-200"
                    }`}
                  >
                    <Ban className="h-4 w-4" aria-hidden />
                    {t("kms.revoke.resourceTypeCert")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/60">
            <Label htmlFor="pickRevokeKey" className="text-gray-900 dark:text-white">
              {t("kms.revoke.pickKey")}
            </Label>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {resourceType === "key"
                ? t("kms.revoke.pickKeyHint")
                : t("kms.revoke.pickKeyForCertHint")}
            </p>
            <Select
              id="pickRevokeKey"
              className="mt-2 max-w-xl"
              value={selectedKeyId}
              onChange={(e) => handleSelectKey(e.target.value)}
            >
              <option value="">{t("kms.revoke.pickKeyPlaceholder")}</option>
              {selectableKeys.map((k) => (
                <option key={k.key_id} value={k.key_id}>
                  {k.key_alias} ({k.key_id.slice(0, 8)}…) — {k.status ?? "?"}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="keyIdField">{t("kms.revoke.keyIdLabel")}</Label>
              <TextInput
                id="keyIdField"
                value={keyId}
                onChange={(e) => {
                  setKeyId(e.target.value);
                  setSelectedKeyId("");
                  setKeyStatus("");
                }}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="mt-1 font-mono text-sm"
                disabled={resourceType === "certificate"}
              />
              {keyStatus && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("kms.revoke.certStatus")}: <strong>{keyStatus}</strong>
                </p>
              )}
            </div>

            {resourceType === "certificate" && (
              <div>
                <Label htmlFor="certIdField">
                  {t("kms.revoke.certificateIdLabel")}
                </Label>
                <TextInput
                  id="certIdField"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="mt-1 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("kms.revoke.certificateIdHint")}
                </p>
                <Button
                  type="button"
                  color="light"
                  className="mt-2"
                  onClick={() => loadCertificateForKey(keyId.trim())}
                  disabled={!keyId.trim() || loadingCert}
                >
                  {loadingCert ? "…" : t("kms.revoke.loadCertBtn")}
                </Button>
              </div>
            )}
          </div>

          {resourceType === "certificate" && certificate && (
            <div className="mt-6 grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-slate-600 dark:bg-slate-800/60 md:grid-cols-2">
              <div>
                <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                  {t("kms.revoke.certStatus")}
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {certificate.status}
                </span>
              </div>
              <div>
                <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                  {t("kms.revoke.certSerial")}
                </span>
                <span className="font-mono text-gray-800 dark:text-gray-100">
                  {certificate.serial_number ?? "—"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                  {t("kms.revoke.certSubject")}
                </span>
                <span className="font-mono text-gray-800 dark:text-gray-100">
                  {certificate.subject ?? "—"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                  {t("kms.revoke.certIssuer")}
                </span>
                <span className="font-mono text-gray-800 dark:text-gray-100">
                  {certificate.issuer ?? "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                  {t("kms.revoke.certValidFrom")}
                </span>
                <span className="text-gray-800 dark:text-gray-100">
                  {formatDisplayDate(certificate.valid_from)}
                </span>
              </div>
              <div>
                <span className="block text-xs uppercase text-gray-500 dark:text-gray-400">
                  {t("kms.revoke.certValidTo")}
                </span>
                <span className="text-gray-800 dark:text-gray-100">
                  {formatDisplayDate(certificate.valid_to)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="reasonField">{t("kms.revoke.reasonLabel")}</Label>
              <Select
                id="reasonField"
                value={reason}
                onChange={(e) => setReason(e.target.value as RevokeReason)}
                className="mt-1"
              >
                <option value="manual">{t("kms.revoke.reasonManual")}</option>
                <option value="compromised">{t("kms.revoke.reasonCompromised")}</option>
                <option value="policy">{t("kms.revoke.reasonPolicy")}</option>
              </Select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t("kms.revoke.reasonHint")}
              </p>
              <span
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${reasonBadgeClass(reason)}`}
              >
                <AlertTriangle className="h-3 w-3" aria-hidden />
                {reason}
              </span>
            </div>
            <div>
              <Label htmlFor="noteField">{t("kms.revoke.noteLabel")}</Label>
              <Textarea
                id="noteField"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("kms.revoke.notePlaceholder")}
                rows={4}
                maxLength={500}
                className="mt-1"
              />
            </div>
          </div>

          {result && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/40 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                <Check className="h-5 w-5" aria-hidden />
                <h3 className="text-base font-semibold">
                  {t("kms.revoke.resultTitle")}
                </h3>
              </div>
              <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    {t("kms.revoke.resultResourceType")}
                  </dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-100">
                    {result.resource_type === "key"
                      ? t("kms.revoke.resourceTypeKey")
                      : t("kms.revoke.resourceTypeCert")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    {t("kms.revoke.resultReason")}
                  </dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-100">
                    {result.reason}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    {t("kms.revoke.resultResourceId")}
                  </dt>
                  <dd className="break-all font-mono text-gray-800 dark:text-gray-100">
                    {result.resource_id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    {t("kms.revoke.resultRevokedAt")}
                  </dt>
                  <dd className="text-gray-800 dark:text-gray-100">
                    {formatDisplayDate(result.revoked_at)}
                  </dd>
                </div>
                {result.cascaded_certificate_id && (
                  <div>
                    <dt className="text-xs uppercase text-gray-500 dark:text-gray-400">
                      {t("kms.revoke.resultCascade")}
                    </dt>
                    <dd className="break-all font-mono text-gray-800 dark:text-gray-100">
                      {result.cascaded_certificate_id}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button color="light" type="button" onClick={() => navigate("/kms")}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={onRequestConfirm}
              disabled={loading || !canSubmit}
              className="bg-rose-600 enabled:hover:bg-rose-700"
            >
              {loading ? "…" : t("kms.revoke.confirmBtn")}
            </Button>
          </div>
        </div>

        {confirmOpen &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-500/50 px-4 py-8"
              role="presentation"
              onClick={(e) => {
                if (e.target === e.currentTarget) setConfirmOpen(false);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-600">
                    <AlertTriangle className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      {t("kms.revoke.confirmQuestion")}
                    </h2>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      {confirmBody}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    color="light"
                    onClick={() => setConfirmOpen(false)}
                  >
                    {t("kms.revoke.confirmNo")}
                  </Button>
                  <Button
                    type="button"
                    onClick={confirmRevoke}
                    className="bg-rose-600 enabled:hover:bg-rose-700"
                  >
                    {t("kms.revoke.confirmYes")}
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
