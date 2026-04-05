import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { kmsApi, type SignatureListItem } from "../../services/agrofusion/kms.api";
import { Plus } from "lucide-react";
import { KmsFeedbackModal, type KmsFeedbackVariant } from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

function normalizeHashAlg(v: string): string {
  const s = String(v).toUpperCase().replace(/_/g, "-");
  if (s.includes("SHA-256") || s === "SHA256") return "SHA-256";
  if (s.includes("SHA-384") || s === "SHA384") return "SHA-384";
  if (s.includes("SHA-512") || s === "SHA512") return "SHA-512";
  return "SHA-256";
}

function formatSignatureOption(s: SignatureListItem): string {
  const d = s.signed_at ? new Date(s.signed_at).toLocaleString() : "";
  const h = s.document_hash?.slice(0, 10) ?? "";
  return `${d} · ${h}…`;
}

/**
 * Verificación de firma (POST /kms/signatures/verify).
 * Permite cargar una firma guardada del proyecto AGROFUSION para no copiar hash/firma largos a mano.
 */
export default function VerifySignature() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    variant: KmsFeedbackVariant;
    message: string;
  } | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const [savedSignatures, setSavedSignatures] = useState<SignatureListItem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedLoadError, setSavedLoadError] = useState(false);
  const [selectedSavedId, setSelectedSavedId] = useState("");

  const [associatedCertificate, setAssociatedCertificate] = useState("");
  const [validityStatus, setValidityStatus] = useState<"valid" | "invalid" | "expired">("valid");
  const [signerEmail, setSignerEmail] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [documentHash, setDocumentHash] = useState("");
  const [signerName, setSignerName] = useState("");
  const [accessTime, setAccessTime] = useState("");

  const [digitalSignature, setDigitalSignature] = useState("");
  const [signatureId, setSignatureId] = useState("");
  const [hashAlgorithm, setHashAlgorithm] = useState("SHA-256");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSaved(true);
      setSavedLoadError(false);
      try {
        const sigRes = await kmsApi.listSignatures({ limit: 100 });
        if (cancelled) return;
        setSavedSignatures(sigRes.data.signatures ?? []);
      } catch {
        if (!cancelled) setSavedLoadError(true);
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySavedSignature = (s: SignatureListItem) => {
    setAssociatedCertificate(String(s.key_id));
    setDocumentHash(s.document_hash);
    setDigitalSignature(s.digital_signature);
    setHashAlgorithm(normalizeHashAlg(String(s.hash_algorithm)));
    setSignatureId(String(s.signature_id));
    if (s.signed_at) {
      const d = new Date(s.signed_at);
      setSignatureDate(d.toISOString().slice(0, 10));
    }
  };

  const toHex = (buffer: ArrayBuffer) =>
    Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const onSigFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setDigitalSignature(text.replace(/\s/g, "").trim());
    };
    reader.readAsText(f);
  };

  const onDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const buf = reader.result;
      if (buf instanceof ArrayBuffer) {
        const digest = await crypto.subtle.digest(
          hashAlgorithm as "SHA-256" | "SHA-384" | "SHA-512",
          buf,
        );
        setDocumentHash(toHex(digest));
        return;
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setResult(null);
    setLoading(true);
    try {
      const kid = associatedCertificate.trim();
      const { data } = await kmsApi.verifySignature({
        document_hash: documentHash.trim(),
        digital_signature: digitalSignature.trim(),
        key_id: kid || null,
        signature_id: signatureId.trim() || null,
        hash_algorithm: hashAlgorithm,
      });
      setResult(data as Record<string, unknown>);
      setFeedback({
        variant: "success",
        message: t("kms.verify.success"),
      });
    } catch (err: unknown) {
      setFeedback({
        variant: "error",
        message: resolveKmsErrorMessage(t, err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.verify.title" />
      <div className="p-4 m-0 mt-3 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <KmsFeedbackModal
          open={!!feedback}
          variant={feedback?.variant ?? "error"}
          message={feedback?.message ?? ""}
          onAccept={() => setFeedback(null)}
        />
        <form onSubmit={submit} className="max-w-5xl mx-auto">
          <div className="mb-8 rounded-xl border border-sky-100 bg-sky-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/60">
            <Label htmlFor="savedSig" className="text-gray-900 dark:text-white">
              {t("kms.verify.loadSavedSignature")}
            </Label>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t("kms.verify.loadSavedHint")}</p>
            <div className="mt-3">
              <Select
                id="savedSig"
                className="max-w-xl"
                value={selectedSavedId}
                disabled={loadingSaved}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSavedId(id);
                  if (!id) return;
                  const s = savedSignatures.find((x) => x.signature_id === id);
                  if (s) applySavedSignature(s);
                }}
              >
                <option value="">{t("kms.verify.chooseSavedPlaceholder")}</option>
                {savedSignatures.map((s) => (
                  <option key={s.signature_id} value={s.signature_id}>
                    {formatSignatureOption(s)}
                  </option>
                ))}
              </Select>
            </div>
            {loadingSaved && (
              <p className="mt-2 text-sm text-gray-500">{t("kms.verify.loadingSaved")}</p>
            )}
            {savedLoadError && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{t("kms.verify.loadSavedError")}</p>
            )}
            {!loadingSaved && !savedLoadError && savedSignatures.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">{t("kms.verify.noSavedSignatures")}</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            <div className="space-y-4">
              <div>
                <Label htmlFor="cert">{t("kms.verify.associatedCertificate")}</Label>
                <TextInput
                  id="cert"
                  value={associatedCertificate}
                  onChange={(e) => {
                    setAssociatedCertificate(e.target.value);
                    setSelectedSavedId("");
                  }}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="val">{t("kms.verify.validityStatus")}</Label>
                <Select
                  id="val"
                  value={validityStatus}
                  onChange={(e) => setValidityStatus(e.target.value as "valid" | "invalid" | "expired")}
                  className="mt-1"
                >
                  <option value="valid">{t("kms.verify.validityValid")}</option>
                  <option value="invalid">{t("kms.verify.validityInvalid")}</option>
                  <option value="expired">{t("kms.verify.validityExpired")}</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">{t("kms.verify.signerEmail")}</Label>
                <TextInput
                  id="email"
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sigDate">{t("kms.verify.signatureDate")}</Label>
                <TextInput
                  id="sigDate"
                  type="date"
                  value={signatureDate}
                  onChange={(e) => setSignatureDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hash">{t("kms.verify.hashOrVerificationCode")}</Label>
                <TextInput
                  id="hash"
                  value={documentHash}
                  onChange={(e) => setDocumentHash(e.target.value)}
                  placeholder="Hex SHA-256 / SHA-384 / SHA-512"
                  required
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="sname">{t("kms.verify.signerName")}</Label>
                <TextInput id="sname" value={signerName} onChange={(e) => setSignerName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="accTime">{t("kms.verify.accessTime")}</Label>
                <TextInput
                  id="accTime"
                  type="time"
                  value={accessTime}
                  onChange={(e) => setAccessTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-5 text-center text-sm font-medium text-gray-800 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-600 dark:bg-slate-800/50 dark:text-gray-100 dark:hover:border-sky-500">
              <Plus className="h-6 w-6 shrink-0 text-blue-600 dark:text-sky-400" />
              <span>{t("kms.verify.uploadCertifiedReceipt")}</span>
              <input type="file" className="hidden" onChange={onDocumentFile} />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="halg">{t("kms.verify.hashAlg")}</Label>
              <Select id="halg" value={hashAlgorithm} onChange={(e) => setHashAlgorithm(e.target.value)}>
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="sigId">{t("kms.verify.signatureIdOptional")}</Label>
              <TextInput
                id="sigId"
                value={signatureId}
                onChange={(e) => setSignatureId(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label>{t("kms.verify.signatureB64")}</Label>
            <div className="mt-2 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/50">
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-700">
                <span>{t("kms.verify.uploadSig")}</span>
                <Plus className="h-5 w-5 text-blue-600" />
                <input type="file" accept=".txt,.b64,.sig" className="hidden" onChange={onSigFile} />
              </label>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-gray-200 p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                placeholder={t("kms.verify.signaturePlaceholder")}
                value={digitalSignature}
                onChange={(e) => setDigitalSignature(e.target.value)}
                required
              />
            </div>
          </div>

          {result && (
            <pre className="mt-6 max-h-64 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-emerald-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button color="light" type="button" onClick={() => navigate("/kms")}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 enabled:hover:bg-blue-700">
              {loading ? "…" : t("kms.verify.confirm")}
            </Button>
          </div>
        </form>
      </div>
    </AppLayoutSB>
  );
}
