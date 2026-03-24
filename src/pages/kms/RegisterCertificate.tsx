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
 * Registro de certificado X.509 (POST /kms/certificates).
 * UI inspirada en formulario de tarjeta; campos mapeados al contrato real del API.
 */
export default function RegisterCertificate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    variant: KmsFeedbackVariant;
    message: string;
  } | null>(null);

  const [keyId, setKeyId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [issuer, setIssuer] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [certificatePem, setCertificatePem] = useState("");
  const [keyKind, setKeyKind] = useState("RSA");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setCertificatePem(text.trim());
    };
    reader.readAsText(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      await kmsApi.createCertificate({
        key_id: keyId.trim(),
        certificate_pem: certificatePem,
        serial_number: serialNumber.trim(),
        subject: subject.trim(),
        issuer: issuer.trim(),
        valid_from: new Date(validFrom).toISOString(),
        valid_to: new Date(validTo).toISOString(),
      });
      setFeedback({ variant: "success", message: t("kms.cert.success") });
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
      <TitleTarget title="kms.cert.title" />
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
              <Label htmlFor="subject">{t("kms.cert.subjectDn")}</Label>
              <TextInput
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="CN=mi-servicio.agrofusion.local"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="issuer">{t("kms.cert.issuer")}</Label>
              <TextInput
                id="issuer"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="CN=CA interna"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="keyKind">{t("kms.cert.keyKind")}</Label>
              <Select id="keyKind" value={keyKind} onChange={(e) => setKeyKind(e.target.value)}>
                <option value="RSA">RSA</option>
                <option value="ECC">ECC</option>
                <option value="DSA">DSA</option>
              </Select>
              <p className="mt-1 text-xs text-gray-500">{t("kms.cert.keyKindHint")}</p>
            </div>
            <div>
              <Label htmlFor="serial">{t("kms.cert.serial")}</Label>
              <TextInput
                id="serial"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vf">{t("kms.cert.validFrom")}</Label>
              <TextInput
                id="vf"
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vt">{t("kms.cert.validTo")}</Label>
              <TextInput
                id="vt"
                type="datetime-local"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="keyId">{t("kms.cert.keyId")}</Label>
            <TextInput
              id="keyId"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              placeholder="UUID de la clave en KMS"
              required
              className="mt-1 font-mono text-sm"
            />
          </div>

          <div className="mt-6">
            <Label>{t("kms.cert.fileOrPaste")}</Label>
            <div className="mt-2 flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 p-4 dark:border-slate-500 dark:bg-slate-800/50">
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-700">
                <span>{t("kms.cert.uploadPem")}</span>
                <Plus className="h-5 w-5 text-blue-600" />
                <input type="file" accept=".pem,.crt,.cer,.txt" className="hidden" onChange={onFile} />
              </label>
              <textarea
                className="min-h-[140px] w-full rounded-lg border border-gray-200 p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                placeholder="-----BEGIN CERTIFICATE-----"
                value={certificatePem}
                onChange={(e) => setCertificatePem(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button color="light" type="button" onClick={() => navigate("/kms")}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 enabled:hover:bg-blue-700">
              {loading ? "…" : t("kms.cert.confirm")}
            </Button>
          </div>
        </form>
      </div>
    </AppLayoutSB>
  );
}
