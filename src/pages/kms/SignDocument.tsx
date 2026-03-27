import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Label, Select, TextInput } from "flowbite-react";
import { Plus } from "lucide-react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { kmsApi } from "../../services/agrofusion/kms.api";
import { KmsFeedbackModal, type KmsFeedbackVariant } from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

async function digestHex(input: string, alg: "SHA-256" | "SHA-384" | "SHA-512"): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest(alg, data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function SignDocument() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: KmsFeedbackVariant; message: string } | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const [keyId, setKeyId] = useState("");
  const [hashAlgorithm, setHashAlgorithm] = useState("SHA-256");
  const [signatureFormat, setSignatureFormat] = useState("PKCS7");
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [documentHash, setDocumentHash] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [signerUserId, setSignerUserId] = useState("");
  const [signingReason, setSigningReason] = useState("");
  const [rawDocument, setRawDocument] = useState("");

  const onDocFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setRawDocument(text);
      const hex = await digestHex(text, hashAlgorithm as "SHA-256" | "SHA-384" | "SHA-512");
      setDocumentHash(hex);
    };
    reader.readAsText(f);
  };

  const recalcHash = async () => {
    if (!rawDocument.trim()) return;
    const hex = await digestHex(rawDocument, hashAlgorithm as "SHA-256" | "SHA-384" | "SHA-512");
    setDocumentHash(hex);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setResult(null);
    setLoading(true);
    try {
      const { data } = await kmsApi.createSignature({
        document_hash: documentHash.trim(),
        key_id: keyId.trim(),
        hash_algorithm: hashAlgorithm,
        signature_format: signatureFormat,
        include_timestamp: includeTimestamp,
        document_id: documentId.trim() || null,
        document_type: documentType.trim() || null,
        signer_user_id: signerUserId.trim() || null,
        signing_reason: signingReason.trim() || null,
        project_id: null,
      });
      setResult(data as Record<string, unknown>);
      setFeedback({ variant: "success", message: t("kms.sign.success") });
    } catch (err: unknown) {
      setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.sign.title" />
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
              <Label htmlFor="keyId">{t("kms.sign.keyId")}</Label>
              <TextInput id="keyId" value={keyId} onChange={(e) => setKeyId(e.target.value)} required className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="hashAlg">{t("kms.sign.hashAlg")}</Label>
              <Select id="hashAlg" value={hashAlgorithm} onChange={(e) => setHashAlgorithm(e.target.value)}>
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="sigFmt">{t("kms.sign.signatureFormat")}</Label>
              <Select id="sigFmt" value={signatureFormat} onChange={(e) => setSignatureFormat(e.target.value)}>
                <option value="PKCS7">PKCS7</option>
                <option value="JWS">JWS</option>
                <option value="XAdES">XAdES</option>
                <option value="CAdES">CAdES</option>
              </Select>
            </div>
            <div className="pt-7">
              <div className="flex items-center gap-2">
                <Checkbox id="ts" checked={includeTimestamp} onChange={(e) => setIncludeTimestamp(e.target.checked)} />
                <Label htmlFor="ts">{t("kms.sign.includeTimestamp")}</Label>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="docId">{t("kms.sign.documentIdOptional")}</Label>
              <TextInput id="docId" value={documentId} onChange={(e) => setDocumentId(e.target.value)} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="docType">{t("kms.sign.documentTypeOptional")}</Label>
              <TextInput id="docType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="signerId">{t("kms.sign.signerUserIdOptional")}</Label>
              <TextInput id="signerId" value={signerUserId} onChange={(e) => setSignerUserId(e.target.value)} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="reason">{t("kms.sign.signingReasonOptional")}</Label>
              <TextInput id="reason" value={signingReason} onChange={(e) => setSigningReason(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="mt-6">
            <Label>{t("kms.sign.uploadDocumentOptional")}</Label>
            <div className="mt-2 flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 p-4 dark:border-slate-500 dark:bg-slate-800/50">
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-700">
                <span>{t("kms.sign.uploadFile")}</span>
                <Plus className="h-5 w-5 text-blue-600" />
                <input type="file" accept=".txt,.json,.xml,.csv,.log,.md" className="hidden" onChange={onDocFile} />
              </label>
              <textarea
                className="min-h-[110px] w-full rounded-lg border border-gray-200 p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                placeholder={t("kms.sign.rawDocumentPlaceholder")}
                value={rawDocument}
                onChange={(e) => setRawDocument(e.target.value)}
              />
              <Button type="button" color="light" onClick={recalcHash}>
                {t("kms.sign.calculateHash")}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="hash">{t("kms.sign.documentHash")}</Label>
            <TextInput
              id="hash"
              value={documentHash}
              onChange={(e) => setDocumentHash(e.target.value)}
              required
              className="mt-1 font-mono text-sm"
            />
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
              {loading ? "…" : t("kms.sign.confirm")}
            </Button>
          </div>
        </form>
      </div>
    </AppLayoutSB>
  );
}
