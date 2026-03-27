import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, Select, TextInput } from "flowbite-react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { kmsApi } from "../../services/agrofusion/kms.api";
import { KmsFeedbackModal, type KmsFeedbackVariant } from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

type RotationReason = "scheduled" | "compromised" | "manual" | "policy";

export default function RotateKey() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingRotate, setLoadingRotate] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: KmsFeedbackVariant; message: string } | null>(null);
  const [rotationResult, setRotationResult] = useState<Record<string, unknown> | null>(null);
  const [rotations, setRotations] = useState<Array<Record<string, unknown>>>([]);

  const [keyId, setKeyId] = useState("");
  const [rotationReason, setRotationReason] = useState<RotationReason>("manual");
  const [graceDays, setGraceDays] = useState("30");

  const rotate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setRotationResult(null);
    setLoadingRotate(true);
    try {
      const { data } = await kmsApi.rotateKey(keyId.trim(), {
        rotation_reason: rotationReason,
        grace_period_days: Number(graceDays || "30"),
      });
      setRotationResult(data as Record<string, unknown>);
      setFeedback({ variant: "success", message: t("kms.rotate.success") });
    } catch (err: unknown) {
      setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
    } finally {
      setLoadingRotate(false);
    }
  };

  const loadHistory = async () => {
    if (!keyId.trim()) {
      setFeedback({ variant: "warning", message: t("kms.rotate.keyIdRequiredForHistory") });
      return;
    }
    setFeedback(null);
    setLoadingHistory(true);
    try {
      const { data } = await kmsApi.getKeyRotations(keyId.trim());
      setRotations((data as Array<Record<string, unknown>>) ?? []);
      setFeedback({ variant: "success", message: t("kms.rotate.historyLoadedSuccess") });
    } catch (err: unknown) {
      setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.rotate.title" />
      <div className="p-4 m-0 mt-3 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <KmsFeedbackModal
          open={!!feedback}
          variant={feedback?.variant ?? "error"}
          message={feedback?.message ?? ""}
          onAccept={() => setFeedback(null)}
        />
        <form onSubmit={rotate} className="max-w-5xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="keyId">{t("kms.rotate.keyId")}</Label>
              <TextInput id="keyId" value={keyId} onChange={(e) => setKeyId(e.target.value)} required className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="reason">{t("kms.rotate.reason")}</Label>
              <Select id="reason" value={rotationReason} onChange={(e) => setRotationReason(e.target.value as RotationReason)}>
                <option value="manual">manual</option>
                <option value="scheduled">scheduled</option>
                <option value="policy">policy</option>
                <option value="compromised">compromised</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="grace">{t("kms.rotate.graceDays")}</Label>
              <TextInput
                id="grace"
                type="number"
                min={0}
                max={365}
                value={graceDays}
                onChange={(e) => setGraceDays(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {rotationResult && (
            <pre className="mt-6 max-h-64 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-emerald-300">
              {JSON.stringify(rotationResult, null, 2)}
            </pre>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button color="light" type="button" onClick={() => navigate("/kms")}>
              {t("common.cancel")}
            </Button>
            <Button type="button" color="light" onClick={loadHistory} disabled={loadingHistory}>
              {loadingHistory ? "…" : t("kms.rotate.loadHistory")}
            </Button>
            <Button type="submit" disabled={loadingRotate} className="bg-blue-600 enabled:hover:bg-blue-700">
              {loadingRotate ? "…" : t("kms.rotate.confirm")}
            </Button>
          </div>
        </form>

        <div className="max-w-5xl mx-auto mt-8">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{t("kms.rotate.historyTitle")}</p>
          {rotations.length === 0 ? (
            <p className="text-sm text-gray-500">{t("kms.rotate.noHistory")}</p>
          ) : (
            <pre className="max-h-72 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-sky-200">
              {JSON.stringify(rotations, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </AppLayoutSB>
  );
}
