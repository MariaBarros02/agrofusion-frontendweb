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

function todayDateStr(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function oneYearLaterDateStr(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/** Convierte valor de input type="date" a ISO para el API. */
function dateInputToIso(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toISOString();
}

/**
 * Unifica saltos de línea cuando el usuario pegó PEM desde JSON/código (\\n literal)
 * o mezcla \\r\\n.
 */
function normalizeCertificatePem(raw: string): string {
  let s = raw.trim();
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  s = s.replace(/\\n/g, "\n");
  return s.trim();
}

/** Detecta placeholders tipo "..." que no son un certificado PEM válido. */
function isLikelyInvalidPlaceholderPem(pem: string): boolean {
  const body = pem
    .replace(/-----BEGIN CERTIFICATE-----/gi, "")
    .replace(/-----END CERTIFICATE-----/gi, "")
    .replace(/[\s\n]/g, "");
  if (body.length < 32) return true;
  if (/^\.+$/.test(body)) return true;
  if (body.includes("...")) return true;
  return false;
}

/**
 * Registro de certificado X.509 (POST /kms/certificates).
 * Layout alineado con RF-INT-10A / Figma: dos columnas, archivo en línea, contraseña centrada.
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
  const [validFrom, setValidFrom] = useState(todayDateStr);
  const [validTo, setValidTo] = useState(oneYearLaterDateStr);
  const [certificatePem, setCertificatePem] = useState("");
  const [keyKind, setKeyKind] = useState("RSA");
  const [fileLabel, setFileLabel] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [showPemPaste, setShowPemPaste] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileLabel(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setCertificatePem(normalizeCertificatePem(text));
    };
    reader.readAsText(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const pem = normalizeCertificatePem(certificatePem);
    if (!pem) {
      setFeedback({
        variant: "error",
        message: t("kms.cert.pemRequired"),
      });
      return;
    }
    if (isLikelyInvalidPlaceholderPem(pem)) {
      setFeedback({
        variant: "error",
        message: t("kms.cert.pemInvalidBody"),
      });
      return;
    }
    setLoading(true);
    try {
      await kmsApi.createCertificate({
        key_id: keyId.trim(),
        certificate_pem: pem,
        serial_number: serialNumber.trim(),
        subject: subject.trim(),
        issuer: issuer.trim(),
        valid_from: dateInputToIso(validFrom),
        valid_to: dateInputToIso(validTo),
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

  const onFeedbackAccept = () => {
    const wasSuccess = feedback?.variant === "success";
    setFeedback(null);
    if (wasSuccess) navigate("/kms");
  };

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.cert.title" />
      <div className="p-4 m-0 mt-3 flex min-h-[calc(100vh-130px)] justify-center overflow-auto bg-slate-50/80 dark:bg-transparent">
        <div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-800 md:p-8">
          <KmsFeedbackModal
            open={!!feedback}
            variant={feedback?.variant ?? "error"}
            message={feedback?.message ?? ""}
            onAccept={onFeedbackAccept}
          />
          <form onSubmit={submit}>
            <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="certName">{t("kms.cert.certificateName")}</Label>
                  <TextInput
                    id="certName"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="CN=mi-servicio.agrofusion.local"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="keyKind">{t("kms.cert.keyTypeSelect")}</Label>
                  <Select id="keyKind" value={keyKind} onChange={(e) => setKeyKind(e.target.value)} className="mt-1">
                    <option value="RSA">RSA</option>
                    <option value="ECC">ECC</option>
                    <option value="DSA">DSA</option>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("kms.cert.keyKindHint")}</p>
                </div>
                <div>
                  <Label htmlFor="ownerKey">{t("kms.cert.ownerUser")}</Label>
                  <TextInput
                    id="ownerKey"
                    value={keyId}
                    onChange={(e) => setKeyId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    required
                    className="mt-1 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("kms.cert.ownerUserHint")}</p>
                </div>
              </div>

              <div className="space-y-5">
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
                  <Label htmlFor="vf">{t("kms.cert.issueDate")}</Label>
                  <TextInput
                    id="vf"
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vt">{t("kms.cert.expirationDate")}</Label>
                  <TextInput
                    id="vt"
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-file">{t("kms.cert.certificateFile")}</Label>
                  <label
                    htmlFor="cert-file"
                    className="mt-1 flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-600 shadow-sm transition hover:border-blue-400 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-300 dark:hover:border-blue-500"
                  >
                    <span className="min-w-0 flex-1 truncate">{fileLabel || t("kms.cert.filePlaceholder")}</span>
                    <Plus className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
                    <input id="cert-file" type="file" accept=".pem,.crt,.cer,.txt" className="hidden" onChange={onFile} />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 max-w-md">
              <Label htmlFor="serial">{t("kms.cert.serial")}</Label>
              <TextInput
                id="serial"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="mx-auto mt-8 max-w-xl">
              <Label htmlFor="accessPw">{t("kms.cert.accessPassword")}</Label>
              <TextInput
                id="accessPw"
                type="password"
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("kms.cert.passwordHint")}</p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => setShowPemPaste((v) => !v)}
              >
                {t("kms.cert.pastePem")}
              </button>
              {showPemPaste && (
                <>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{t("kms.cert.pemPasteHint")}</p>
                  <textarea
                    className="mt-2 min-h-[160px] w-full rounded-lg border border-gray-200 p-3 font-mono text-xs leading-relaxed dark:border-slate-600 dark:bg-slate-900"
                    placeholder={t("kms.cert.pemTextareaPlaceholder")}
                    value={certificatePem}
                    onChange={(e) => setCertificatePem(e.target.value)}
                    onBlur={() => setCertificatePem((v) => normalizeCertificatePem(v))}
                  />
                </>
              )}
            </div>

            <div className="mt-10 flex flex-wrap justify-end gap-3">
              <Button color="light" type="button" className="border border-gray-300 dark:border-gray-500" onClick={() => navigate("/kms")}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 enabled:hover:bg-blue-700">
                {loading ? "…" : t("kms.cert.confirm")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayoutSB>
  );
}
