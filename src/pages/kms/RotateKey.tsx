import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { Filter, Flag, ListOrdered, X } from "lucide-react";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { kmsApi } from "../../services/agrofusion/kms.api";
import { KmsFeedbackModal, type KmsFeedbackVariant } from "../../components/kms/KmsFeedbackModal";
import { resolveKmsErrorMessage } from "../../components/kms/kmsErrorMessage";

type RotationReason = "scheduled" | "compromised" | "manual" | "policy";

type KeyOption = { key_id: string; key_alias: string };

type KeyRotationRow = {
  rotation_id: string;
  old_key_id: string;
  new_key_id: string;
  rotation_reason: string;
  grace_period_days: number;
  rotated_by: string | null;
  rotated_at: string;
};

function parseRotation(r: Record<string, unknown>): KeyRotationRow | null {
  const id = r.rotation_id;
  if (id == null || id === "") return null;
  const reason = r.rotation_reason;
  const reasonStr =
    typeof reason === "object" && reason !== null && "value" in reason
      ? String((reason as { value: string }).value)
      : String(reason ?? "");
  return {
    rotation_id: String(id),
    old_key_id: String(r.old_key_id ?? ""),
    new_key_id: String(r.new_key_id ?? ""),
    rotation_reason: reasonStr,
    grace_period_days: Number(r.grace_period_days ?? 0),
    rotated_by: r.rotated_by != null && r.rotated_by !== "" ? String(r.rotated_by) : null,
    rotated_at: String(r.rotated_at ?? ""),
  };
}

function isoDateOnly(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatDisplayTime(iso: string, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function shortUuid(u: string): string {
  if (!u || u.length < 10) return u || "—";
  return `${u.slice(0, 8)}…`;
}

const REASON_OPTIONS: RotationReason[] = ["manual", "scheduled", "policy", "compromised"];

export default function RotateKey() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language?.startsWith("es") ? "es" : "en";

  const [loadingRotate, setLoadingRotate] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: KmsFeedbackVariant; message: string } | null>(null);
  const [rotationResult, setRotationResult] = useState<Record<string, unknown> | null>(null);
  const [rotations, setRotations] = useState<KeyRotationRow[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const [activeKeys, setActiveKeys] = useState<KeyOption[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState("");

  const [keyId, setKeyId] = useState("");
  const [rotationReason, setRotationReason] = useState<RotationReason>("manual");
  const [graceDays, setGraceDays] = useState("30");

  const [selectedRotationId, setSelectedRotationId] = useState<string | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterReason, setFilterReason] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await kmsApi.listKeys({ statusFilter: "active" });
        const keys = (data as { keys?: KeyOption[] }).keys ?? [];
        if (!cancelled) {
          setActiveKeys(keys.map((k) => ({ key_id: String(k.key_id), key_alias: k.key_alias })));
        }
      } catch {
        if (!cancelled) setActiveKeys([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uniqueExecutorIds = useMemo(() => {
    const s = new Set<string>();
    for (const r of rotations) {
      if (r.rotated_by) s.add(r.rotated_by);
    }
    return [...s].sort();
  }, [rotations]);

  const filteredRotations = useMemo(() => {
    return rotations.filter((row) => {
      const day = isoDateOnly(row.rotated_at);
      if (filterDateFrom && day && day < filterDateFrom) return false;
      if (filterDateTo && day && day > filterDateTo) return false;
      if (filterReason !== "all" && row.rotation_reason !== filterReason) return false;
      if (filterUser !== "all" && row.rotated_by !== filterUser) return false;
      if (filterResult === "success") {
        /* todas las rotaciones persistidas son exitosas */
      }
      return true;
    });
  }, [rotations, filterDateFrom, filterDateTo, filterReason, filterUser, filterResult]);

  useEffect(() => {
    if (filteredRotations.length === 0) {
      setSelectedRotationId(null);
      return;
    }
    if (!selectedRotationId || !filteredRotations.some((x) => x.rotation_id === selectedRotationId)) {
      setSelectedRotationId(filteredRotations[0].rotation_id);
    }
  }, [filteredRotations, selectedRotationId]);

  const selectedRotation = useMemo(
    () => filteredRotations.find((x) => x.rotation_id === selectedRotationId) ?? null,
    [filteredRotations, selectedRotationId],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filterDateFrom) n++;
    if (filterDateTo) n++;
    if (filterReason !== "all") n++;
    if (filterUser !== "all") n++;
    if (filterResult !== "all") n++;
    return n;
  }, [filterDateFrom, filterDateTo, filterReason, filterUser, filterResult]);

  const resetHistoryFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterReason("all");
    setFilterUser("all");
    setFilterResult("all");
  };

  const fetchRotations = async (kid: string, showToast: boolean) => {
    const { data } = await kmsApi.getKeyRotations(kid);
    const raw = Array.isArray(data) ? data : [];
    const parsed = raw
      .map((item) => parseRotation(item as Record<string, unknown>))
      .filter((x): x is KeyRotationRow => x != null);
    setRotations(parsed);
    if (showToast) {
      setFeedback({ variant: "success", message: t("kms.rotate.historyLoadedSuccess") });
    }
  };

  const rotate = async (e: React.FormEvent) => {
    e.preventDefault();
    const kid = keyId.trim();
    if (!kid) return;
    setFeedback(null);
    setRotationResult(null);
    setLoadingRotate(true);
    try {
      const { data } = await kmsApi.rotateKey(kid, {
        rotation_reason: rotationReason,
        grace_period_days: Number(graceDays || "30"),
      });
      setRotationResult(data as Record<string, unknown>);
      setFeedback({ variant: "success", message: t("kms.rotate.success") });
      try {
        await fetchRotations(kid, false);
      } catch {
        /* historial opcional; no abre el panel */
      }
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
      await fetchRotations(keyId.trim(), true);
      setShowHistoryPanel(true);
    } catch (err: unknown) {
      setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeHistoryPanel = () => {
    setShowHistoryPanel(false);
    resetHistoryFilters();
  };

  useEffect(() => {
    if (!showHistoryPanel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowHistoryPanel(false);
        setFilterDateFrom("");
        setFilterDateTo("");
        setFilterReason("all");
        setFilterUser("all");
        setFilterResult("all");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showHistoryPanel]);

  const reloadHistoryInPanel = async () => {
    if (!keyId.trim()) return;
    setLoadingHistory(true);
    try {
      await fetchRotations(keyId.trim(), false);
    } catch (err: unknown) {
      setFeedback({ variant: "error", message: resolveKmsErrorMessage(t, err) });
    } finally {
      setLoadingHistory(false);
    }
  };

  const detailText = selectedRotation
    ? `${t("kms.rotate.reason")}: ${selectedRotation.rotation_reason}; ${t("kms.rotate.graceDays")}: ${selectedRotation.grace_period_days}; ${t("kms.rotate.historyNewKey")}: ${selectedRotation.new_key_id}`
    : "—";

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
          <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/60">
            <Label htmlFor="pickRotateKey" className="text-gray-900 dark:text-white">
              {t("kms.rotate.pickKeyToRotate")}
            </Label>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t("kms.rotate.pickKeyToRotateHint")}</p>
            <Select
              id="pickRotateKey"
              className="mt-2 max-w-xl"
              value={selectedKeyId}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedKeyId(v);
                setKeyId(v);
              }}
            >
              <option value="">{t("kms.rotate.chooseKeyPlaceholder")}</option>
              {activeKeys.map((k) => (
                <option key={k.key_id} value={k.key_id}>
                  {k.key_alias} ({k.key_id.slice(0, 8)}…)
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="keyId">{t("kms.rotate.keyId")}</Label>
              <TextInput
                id="keyId"
                value={keyId}
                onChange={(e) => {
                  setKeyId(e.target.value);
                  setSelectedKeyId("");
                }}
                required
                className="mt-1 font-mono text-sm"
              />
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

        {showHistoryPanel && (
          <div
            className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-10 pb-12 backdrop-blur-[1px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rotate-history-modal-title"
            onClick={closeHistoryPanel}
          >
            <div
              className="mb-8 w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-600">
                <div>
                  <h2 id="rotate-history-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("kms.rotate.historyModalTitle")}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">{t("kms.rotate.historyForKey", { id: keyId.trim() })}</p>
                </div>
                <button
                  type="button"
                  onClick={closeHistoryPanel}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                  aria-label={t("kms.rotate.historyClosePanel")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5">
              <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                      <ListOrdered className="h-4 w-4 text-blue-600" aria-hidden />
                      {t("kms.rotate.historyActionDate")}
                    </Label>
                    <TextInput readOnly value={selectedRotation ? formatDisplayDate(selectedRotation.rotated_at, locale) : "—"} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-200">{t("kms.rotate.historyActionTime")}</Label>
                    <TextInput readOnly value={selectedRotation ? formatDisplayTime(selectedRotation.rotated_at, locale) : "—"} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-200">{t("kms.rotate.historyExecutorUser")}</Label>
                    <TextInput
                      readOnly
                      value={selectedRotation?.rotated_by ?? "—"}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-200">{t("kms.rotate.historyOldKey")}</Label>
                    <Select
                      value={selectedRotation?.old_key_id ?? ""}
                      disabled
                      className="mt-1 font-mono text-sm"
                    >
                      <option value="">{t("kms.rotate.chooseKeyPlaceholder")}</option>
                      {selectedRotation && <option value={selectedRotation.old_key_id}>{selectedRotation.old_key_id}</option>}
                    </Select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                      <ListOrdered className="h-4 w-4 text-gray-500" aria-hidden />
                      {t("kms.rotate.historyActionType")}
                    </Label>
                    <Select value="rotate" disabled className="mt-1">
                      <option value="rotate">{t("kms.rotate.historyActionRotate")}</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                      <ListOrdered className="h-4 w-4 text-gray-500" aria-hidden />
                      {t("kms.rotate.historyResult")}
                    </Label>
                    <Select value="success" disabled className="mt-1">
                      <option value="success">{t("kms.rotate.historyResultSuccess")}</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-200">{t("kms.rotate.historyNewKey")}</Label>
                    <TextInput readOnly value={selectedRotation?.new_key_id ?? "—"} className="mt-1 font-mono text-sm" />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-200">{t("kms.rotate.historyDetail")}</Label>
                    <TextInput readOnly value={detailText} className="mt-1 text-sm" />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-slate-900/40">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <Flag className="h-3.5 w-3.5" aria-hidden />
                  {t("kms.rotate.historyFilterDate")}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">{t("kms.rotate.historyDateFrom")}</Label>
                    <TextInput
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="mt-1"
                      disabled={rotations.length === 0}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">{t("kms.rotate.historyDateTo")}</Label>
                    <TextInput
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="mt-1"
                      disabled={rotations.length === 0}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Flag className="h-3 w-3" aria-hidden />
                      {t("kms.rotate.historyFilterReason")}
                    </Label>
                    <Select
                      value={filterReason}
                      onChange={(e) => setFilterReason(e.target.value)}
                      className="mt-1"
                      disabled={rotations.length === 0}
                    >
                      <option value="all">{t("kms.rotate.historyFilterReasonAll")}</option>
                      {REASON_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Flag className="h-3 w-3" aria-hidden />
                      {t("kms.rotate.historyFilterUser")}
                    </Label>
                    <Select
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      className="mt-1"
                      disabled={rotations.length === 0}
                    >
                      <option value="all">{t("kms.rotate.historyFilterUserAll")}</option>
                      {uniqueExecutorIds.map((uid) => (
                        <option key={uid} value={uid}>
                          {shortUuid(uid)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Flag className="h-3 w-3" aria-hidden />
                      {t("kms.rotate.historyFilterResult")}
                    </Label>
                    <Select
                      value={filterResult}
                      onChange={(e) => setFilterResult(e.target.value)}
                      className="mt-1"
                      disabled={rotations.length === 0}
                    >
                      <option value="all">{t("kms.rotate.historyResultAll")}</option>
                      <option value="success">{t("kms.rotate.historyResultSuccess")}</option>
                    </Select>
                  </div>
                  <div className="flex flex-wrap items-end gap-3 lg:col-span-3">
                    <Button
                      type="button"
                      className="bg-blue-600 enabled:hover:bg-blue-700"
                      onClick={resetHistoryFilters}
                      disabled={rotations.length === 0}
                    >
                      {t("kms.rotate.historyResetFilters")}
                    </Button>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-900 dark:bg-sky-900/40 dark:text-sky-100">
                        <Filter className="h-4 w-4 shrink-0" aria-hidden />
                        {t("kms.rotate.historyActiveFilters")}
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs dark:bg-sky-950/50">{activeFilterCount}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-600">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{t("kms.rotate.historyTableWhen")}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{t("kms.rotate.historyTableReason")}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{t("kms.rotate.historyTableExecutor")}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{t("kms.rotate.historyTableNewKeyShort")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRotations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {rotations.length === 0 ? t("kms.rotate.noHistory") : t("kms.rotate.historyNoFilterMatch")}
                        </td>
                      </tr>
                    )}
                    {filteredRotations.map((row) => (
                      <tr
                        key={row.rotation_id}
                        onClick={() => setSelectedRotationId(row.rotation_id)}
                        className={`cursor-pointer border-b border-gray-100 transition-colors last:border-0 dark:border-gray-700 ${
                          row.rotation_id === selectedRotationId
                            ? "bg-sky-100 dark:bg-sky-900/30"
                            : "hover:bg-sky-50/80 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {formatDisplayDate(row.rotated_at, locale)} {formatDisplayTime(row.rotated_at, locale)}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.rotation_reason}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{shortUuid(row.rotated_by ?? "")}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{shortUuid(row.new_key_id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredRotations.length > 0 && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t("kms.rotate.historySelectRow")}</p>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-600">
                <Button color="light" type="button" onClick={closeHistoryPanel}>
                  {t("kms.rotate.historyClosePanel")}
                </Button>
                <Button
                  type="button"
                  className="bg-blue-600 enabled:hover:bg-blue-700"
                  onClick={reloadHistoryInPanel}
                  disabled={loadingHistory}
                >
                  {loadingHistory ? "…" : t("kms.rotate.historyReload")}
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </AppLayoutSB>
  );
}
