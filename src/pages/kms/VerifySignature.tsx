import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { Button, Label, TextInput, Select } from "flowbite-react";
import { kmsApi } from "../../services/agrofusion/kms.api";
import { Plus } from "lucide-react";
import { KmsFeedbackModal, type KmsFeedbackVariant } from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

/**
 * Verificación de firma (POST /kms/signatures/verify).
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

  const [documentHash, setDocumentHash] = useState("");
  const [digitalSignature, setDigitalSignature] = useState("");
  const [keyId, setKeyId] = useState("");
  const [signatureId, setSignatureId] = useState("");
  const [hashAlgorithm, setHashAlgorithm] = useState("SHA-256");
  const [rawDocument, setRawDocument] = useState("");

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
      const text = typeof reader.result === "string" ? reader.result : "";
      setRawDocument(text);
      const digest = await crypto.subtle.digest(
        hashAlgorithm as "SHA-256" | "SHA-384" | "SHA-512",
        new TextEncoder().encode(text),
      );
      setDocumentHash(toHex(digest));
    };
    reader.readAsText(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setResult(null);
    setLoading(true);
    try {
      const { data } = await kmsApi.verifySignature({
        document_hash: documentHash.trim(),
        digital_signature: digitalSignature.trim(),
        key_id: keyId.trim() || null,
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
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="hash">{t("kms.verify.documentHash")}</Label>
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
            <div>
              <Label htmlFor="kid">{t("kms.verify.keyIdOptional")}</Label>
              <TextInput
                id="kid"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label>{t("kms.verify.sourceDocumentOptional")}</Label>
            <div className="mt-2 flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 p-4 dark:border-slate-500 dark:bg-slate-800/50">
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-700">
                <span>{t("kms.verify.uploadDocument")}</span>
                <Plus className="h-5 w-5 text-blue-600" />
                <input type="file" accept=".txt,.json,.xml,.csv,.log,.md" className="hidden" onChange={onDocumentFile} />
              </label>
              <textarea
                className="min-h-[90px] w-full rounded-lg border border-gray-200 p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                placeholder={t("kms.verify.documentPlaceholder")}
                value={rawDocument}
                onChange={(e) => setRawDocument(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6">
            <Label>{t("kms.verify.signatureB64")}</Label>
            <div className="mt-2 flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 p-4 dark:border-slate-500 dark:bg-slate-800/50">
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-700">
                <span>{t("kms.verify.uploadSig")}</span>
                <Plus className="h-5 w-5 text-blue-600" />
                <input type="file" accept=".txt,.b64,.sig" className="hidden" onChange={onSigFile} />
              </label>
              <textarea
                className="min-h-[120px] w-full rounded-lg border border-gray-200 p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
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
