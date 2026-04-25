import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { FiArrowLeft, FiSearch, FiSend } from "react-icons/fi";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import ModuleInactive from "../ModuleInactive";
import SubmoduleInactive from "../SubmoduleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";

type TransferLocationState = {
  apiName?: string;
  projectCode?: string;
  endpointId?: string;
  urlEndpoint?: string;
};

type AccountingInterval = "" | "mensual" | "anual";

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateEndDate = (
  startDateValue: string,
  interval: AccountingInterval,
) => {
  if (!startDateValue || !interval) return "";

  const [year, month, day] = startDateValue.split("-").map(Number);

  if (!year || !month || !day) return "";

  const calculatedDate = new Date(year, month - 1, day);

  if (interval === "mensual") {
    calculatedDate.setMonth(calculatedDate.getMonth() + 1);
  }

  if (interval === "anual") {
    calculatedDate.setFullYear(calculatedDate.getFullYear() + 1);
  }

  return formatDateForInput(calculatedDate);
};

const AccountingTransferRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const state = (location.state as TransferLocationState | null) ?? null;

  const [startDate, setStartDate] = useState("");
  const [interval, setInterval] = useState<AccountingInterval>("");
  const [endDate, setEndDate] = useState("");
  const [hasConsulted, setHasConsulted] = useState(false);

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore(
    (s) => s.canAccessSubmodule,
  );
  const canUseDashboardFlow = canAccessModule("DASHBOARD");
  const canUseAdministrationFlow =
    canAccessModule("ADMINISTRATION") && canAccessSubmodule("PROJECTS");
  const showModuleInactive =
    !canUseDashboardFlow && !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive =
    !canUseDashboardFlow &&
    canAccessModule("ADMINISTRATION") &&
    !canAccessSubmodule("PROJECTS");
  const showContent = canUseDashboardFlow || canUseAdministrationFlow;

  const goBackPath = useMemo(() => {
    if (canUseAdministrationFlow && !canUseDashboardFlow) {
      return `/administration/projects/${projectId}/accounting-endpoints`;
    }
    return `/projects/${projectId}/accounting-endpoints`;
  }, [canUseAdministrationFlow, canUseDashboardFlow, projectId]);

  const apiName = state?.apiName || t("project.transferRequest.fallbackApiName");
  const projectCode =
    state?.projectCode || t("project.transferRequest.fallbackProject");
  const transferPreview = "INFORMACION CONTABLE";

  useEffect(() => {
    const nextEndDate = calculateEndDate(startDate, interval);
    setEndDate(nextEndDate);
    setHasConsulted(false);
  }, [startDate, interval]);

  const canConsult = Boolean(startDate && interval && endDate);

  const handleConsult = () => {
    if (!canConsult) return;
    setHasConsulted(true);
  };

  return (
    <AppLayoutSB>
      <div className="mb-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("project.transferRequest.title", {
            apiName,
            project: projectCode,
          })}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {t("project.transferRequest.description")}
        </p>
      </div>

      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}

      {showContent && (
        <>
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
              <div>
                <Label htmlFor="transfer-start-date">
                  {t("project.transferRequest.startDate")}
                </Label>
                <TextInput
                  id="transfer-start-date"
                  type="date"
                  sizing="md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="transfer-end-date">
                  {t("project.transferRequest.endDate")}
                </Label>
                <TextInput
                  id="transfer-end-date"
                  type={endDate ? "date" : "text"}
                  sizing="md"
                  value={endDate}
                  readOnly
                  placeholder={t("project.transferRequest.endDatePlaceholder")}
                  className="cursor-not-allowed"
                />
              </div>

              <div>
                <Label htmlFor="transfer-interval">
                  {t("project.transferRequest.accountingInterval")}
                </Label>
                <Select
                  id="transfer-interval"
                  sizing="md"
                  value={interval}
                  onChange={(e) =>
                    setInterval(e.target.value as AccountingInterval)
                  }
                >
                  <option value="">
                    {t("project.transferRequest.intervalPlaceholder")}
                  </option>
                  <option value="mensual">
                    {t("project.transferRequest.intervals.monthly")}
                  </option>
                  <option value="anual">
                    {t("project.transferRequest.intervals.yearly")}
                  </option>
                </Select>
              </div>

              <Button
                color="blue"
                className="h-[42px] min-w-[220px] w-full xl:w-auto"
                onClick={handleConsult}
                disabled={!canConsult}
              >
                <FiSearch className="mr-2" />
                {t("project.transferRequest.consult")}
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("project.transferRequest.resultTitle")}
              </h2>
              {state?.urlEndpoint && (
                <span className="max-w-[420px] truncate text-xs text-slate-500 dark:text-slate-300">
                  {state.urlEndpoint}
                </span>
              )}
            </div>

            {hasConsulted ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-gray-500 dark:bg-gray-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {transferPreview}
                </p>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                  {t("project.transferRequest.previewRange", {
                    startDate,
                    endDate,
                  })}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-gray-500 dark:bg-gray-800">
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {t("project.transferRequest.emptyState")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button color="light" onClick={() => navigate(goBackPath)}>
              <FiArrowLeft className="mr-2" />
              {t("common.cancel")}
            </Button>
            <Button color="blue" disabled={!hasConsulted}>
              <FiSend className="mr-2" />
              {t("project.transferRequest.transfer")}
            </Button>
          </div>
        </>
      )}
    </AppLayoutSB>
  );
};

export default AccountingTransferRequest;
