import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { Button, Label, TextInput, Select } from "flowbite-react";
import { kmsApi } from "../../services/agrofusion/kms.api";
import { KmsFeedbackModal, type KmsFeedbackVariant } from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

/**
 * Crear clave criptográfica (POST /kms/keys). Requiere permiso 026 en backend.
 */
export default function CreateKey() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    variant: KmsFeedbackVariant;
    message: string;
  } | null>(null);
  const [created, setCreated] = useState<Record<string, unknown> | null>(null);

  const [keyAlias, setKeyAlias] = useState("");
  const [algorithm, setAlgorithm] = useState("RSA-2048");
  const [keyPurpose, setKeyPurpose] = useState("signing");
  const [validTo, setValidTo] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setCreated(null);
    setLoading(true);
    try {
      const { data } = await kmsApi.createKey({
        key_alias: keyAlias.trim(),
        algorithm,
        key_purpose: keyPurpose,
        valid_to: validTo ? new Date(validTo).toISOString() : null,
      });
      setCreated(data as Record<string, unknown>);
      setFeedback({
        variant: "success",
        message: t("kms.createKey.success"),
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
      <TitleTarget title="kms.createKey.title" />
      <div className="p-4 m-0 mt-3 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <KmsFeedbackModal
          open={!!feedback}
          variant={feedback?.variant ?? "error"}
          message={feedback?.message ?? ""}
          onAccept={() => setFeedback(null)}
        />
        <form onSubmit={submit} className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div>
              <Label htmlFor="alias">{t("kms.createKey.alias")}</Label>
              <TextInput id="alias" value={keyAlias} onChange={(e) => setKeyAlias(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="alg">{t("kms.createKey.algorithm")}</Label>
              <Select id="alg" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                <option value="RSA-2048">RSA-2048</option>
                <option value="RSA-4096">RSA-4096</option>
                <option value="ECDSA-P256">ECDSA-P256</option>
                <option value="ECDSA-P384">ECDSA-P384</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="purp">{t("kms.createKey.purpose")}</Label>
              <Select id="purp" value={keyPurpose} onChange={(e) => setKeyPurpose(e.target.value)}>
                <option value="signing">signing</option>
                <option value="encryption">encryption</option>
                <option value="both">both</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="vt">{t("kms.createKey.validToOptional")}</Label>
              <TextInput
                id="vt"
                type="datetime-local"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </div>
          </div>

          {created && (
            <pre className="mt-6 max-h-64 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-sky-200">
              {JSON.stringify(created, null, 2)}
            </pre>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button color="light" type="button" onClick={() => navigate("/kms")}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 enabled:hover:bg-blue-700">
              {loading ? "…" : t("kms.createKey.submit")}
            </Button>
          </div>
        </form>
      </div>
    </AppLayoutSB>
  );
}
