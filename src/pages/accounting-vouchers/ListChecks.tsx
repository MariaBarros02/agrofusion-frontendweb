/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Label, Select, TextInput, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { HiSearch, HiCalendar } from "react-icons/hi";
import "react-datepicker/dist/react-datepicker.css";
import { FiFilter, FiFlag, FiFileText } from "react-icons/fi";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import AlertSimple, { type AlertState } from "../../components/layout/AlertSimple";
import DataTable, { type Column } from "../../components/DataTable";
import {listChecksService, listCheckTypesService,} from "../../services/agrofusion/integration.service";
import {getAccountingConnectionService, createAccountingConnectionService, updateAccountingConnectionService,} from "../../services/agrofusion/auth.service";
import type { listChecksRequest } from "../../dto/request/listChecks-request.dto";
import type { CheckTypeOptionResponse } from "../../dto/response/listCheckTypes-response.dto";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type {
  CheckListItemResponse,
  PaginatedChecksResponse,
} from "../../dto/response/listChecks-response.dto";


const ListChecks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [size] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notListPerm, setNotListPerm] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedChecksResponse | null>(null);
  const [transactionType, setTransactionType] = useState("");
  const [typeOptions, setTypeOptions] = useState<CheckTypeOptionResponse[]>([]);
  const [connectionExists, setConnectionExists] = useState(false);
  const [accountingConnection, setAccountingConnection] = useState<any>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"create" | "edit">("create");
  const [alert, setAlert] = useState<AlertState>(null);
  const [connectionPath, setConnectionPath] = useState("");
  const [connectionMethodTermId, setConnectionMethodTermId] = useState("");
  const [savingConnection, setSavingConnection] = useState(false);
  const [connectionApiKey, setConnectionApiKey] = useState("");

  const getChecks = useCallback(async (pageParam = 1) => {
      try {
        setLoading(true);
        setError("");
        setNotListPerm(null);
    
        const payload: listChecksRequest = {
          page_index: pageParam,
          page_size: size,
          search: search || undefined,
          state: state || undefined,
          transaction_type: transactionType || undefined,
          start_date: startDate ? startDate.toISOString() : undefined,
          end_date: endDate
            ? new Date(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate(),
                23,
                59,
                59,
              ).toISOString()
            : undefined,
        };
    
        const response = await listChecksService(payload);
    
        setPagination({
          ...response,
          items: response.items.map((item) => ({
            ...item,
            state: String(item.state).toUpperCase(),
          })),
        });
      } catch (err: any) {
        const errorCode = err.response?.data?.detail?.code;
    
        if (errorCode) {
          setNotListPerm(errorCode);
          return;
        }
    
        setError("LOAD_CHECKS_ERROR");
      } finally {
        setLoading(false);
      }
    }, [endDate, search, size, startDate, state, transactionType]);
  
    const getCheckTypes = useCallback(async () => {
      try {
        const response = await listCheckTypesService();
        setTypeOptions(response.items);
    
        setTransactionType((currentValue) =>
          currentValue && !response.items.some((option) => option.value === currentValue)
            ? ""
            : currentValue
        );
      } catch (err) {
        console.error("Error loading check types", err);
      }
    }, []);

    const handleOpenConnectionModal = () => {
      const isEdit = connectionExists && accountingConnection;
    
      setConnectionMode(isEdit ? "edit" : "create");
      setConnectionPath(isEdit ? accountingConnection.path || "" : "");
      setConnectionMethodTermId(isEdit ? accountingConnection.method_term_id || "" : "");
      setConnectionApiKey(
        isEdit
          ? accountingConnection?.params_template?.api_key || ""
          : "",
      );
      setShowConnectionModal(true);
    };

    const loadAccountingConnection = async () => {
      try {
        const response = await getAccountingConnectionService();
        setConnectionExists(response.exists);
        setAccountingConnection(response.exists ? response : null);
      } catch {
        setConnectionExists(false);
        setAccountingConnection(null);
      }
    };
    
    const handleCloseConnectionModal = () => {
      setShowConnectionModal(false);
      setConnectionPath("");
      setConnectionMethodTermId("");
      setConnectionApiKey("");
      setSavingConnection(false);
    };
    
    const handleSaveConnection = async () => {
      if (!connectionPath.trim()) {
        setAlert({
          message: t("checks.requestUrlRequired"),
          type: "warning",
        });
        return;
      }
    
      if (!connectionMethodTermId) {
        setAlert({
          message: t("checks.requestMethodRequired"),
          type: "warning",
        });
        return;
      }
    
      if (!connectionApiKey.trim()) {
        setAlert({
          message: t("checks.apiKeyRequired"),
          type: "warning",
        });
        return;
      }
    
      const payload = {
        path: connectionPath.trim(),
        method_term_id: connectionMethodTermId,
        params_template: {
          api_key: connectionApiKey.trim(),
        },
      };
    
      try {
        setSavingConnection(true);
    
        if (connectionMode === "edit" && accountingConnection?.external_endpoint_id) {
          await updateAccountingConnectionService(
            accountingConnection.external_endpoint_id,
            payload
          );
    
          setAlert({
            message: t("checks.accountingConnectionUpdatedSuccess"),
            type: "success",
          });
        } else {
          await createAccountingConnectionService(payload);
    
          setAlert({
            message: t("checks.accountingConnectionCreatedSuccess"),
            type: "success",
          });
        }
      } catch (error: any) {
        console.error("Error saving accounting connection", error);
        console.log("backendDetail:", error?.response?.data);
    
        const backendDetail = error?.response?.data?.detail;
    
        if (backendDetail === "AUTH_INSUFFICIENT_PERMISSIONS") {
          setAlert({
            message: t("errors.AUTH_INSUFFICIENT_PERMISSIONS"),
            type: "warning",
          });
        } else if (backendDetail === "ACCOUNTING_CONNECTION_ALREADY_EXISTS") {
          setAlert({
            message: t("checks.accountingConnectionAlreadyExists"),
            type: "warning",
          });
        } else if (backendDetail === "ACCOUNTING_CONNECTION_API_KEY_REQUIRED") {
          setAlert({
            message: t("checks.apiKeyRequired"),
            type: "warning",
          });
        } else {
          setAlert({
            message:
              backendDetail ||
              (connectionMode === "edit"
                ? t("checks.accountingConnectionUpdatedError")
                : t("checks.accountingConnectionCreatedError")),
            type: "error",
          });
        }
      } finally {
        handleCloseConnectionModal();
        await loadAccountingConnection();
      }
    };

    useEffect(() => {
      getCheckTypes();
      getChecks(1);
      loadAccountingConnection();
    }, []);

    useEffect(() => {
      void getCheckTypes();
    
      const intervalId = window.setInterval(() => {
        void getCheckTypes();
      }, 60000);
    
      const handleWindowFocus = () => {
        void getCheckTypes();
      };
    
      window.addEventListener("focus", handleWindowFocus);
    
      return () => {
        window.clearInterval(intervalId);
        window.removeEventListener("focus", handleWindowFocus);
      };
    }, [getCheckTypes]);

    const columns: Column<CheckListItemResponse>[] = [
      {
        key: "id",
        label: t("checks.columns.id"),
        type: "text",
        width: "90px",
        format: (value: string) => value?.slice(0, 7),
      },
      {
        key: "transaction_type",
        label: t("checks.columns.transactionType"),
        type: "text",
        width: "170px",
      },
      {
        key: "project_name",
        label: t("checks.columns.project"),
        type: "text",
        width: "150px",
        format: (_: unknown, row) => row.project_code || row.project_name || "-",
      },
      {
        key: "state",
        label: t("checks.columns.state"),
        type: "status",
        width: "130px",
      },
      {
        key: "issued_at",
        label: t("checks.columns.issuedAt"),
        type: "text",
        width: "120px",
        format: (value: string) =>
          value
            ? new Date(value).toLocaleString("es-CO", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "-",
      },
      {
        key: "issued_by",
        label: t("checks.columns.issuedBy"),
        type: "text",
        width: "140px",
      },
      {
        key: "actions",
        label: t("checks.columns.actions"),
        type: "actions",
        width: "220px",
        actions: [
          {
            label: t("checks.view"),
            onClick: (row) => {
              navigate(`/accounting-vouchers/${row.id}`);
            },
          },
          {
            label: t("checks.export"),
            className: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
            onClick: (row) => {
              console.log("exportar", row.id);
            },
          },
        ],
      },
    ];

  return (
    <AppLayoutSB>
      <TitleTarget title={t("checks.title")} description={t("checks.description")} />

      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 rounded-2xl">
        <div className="flex flex-wrap flex-1 gap-2 mb-3 overflow-visible">
          <div className="w-60">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("checks.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs">{t("audit.filters.date")}</Label>

            <div className="relative">
              <HiCalendar className="absolute z-10 text-gray-400 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-300" />

              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update: [Date | null, Date | null]) => {
                  const [start, end] = update;
                  setStartDate(start);
                  setEndDate(end);
                }}
                isClearable
                placeholderText={t("audit.filters.dateRange")}
                popperPlacement="bottom-start"
                popperClassName="z-50"
                portalId="root"
                className="w-60 h-[34px] rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-52">
            <Label className="text-xs">{t("checks.filters.type")}</Label>
            <Select
              icon={FiFileText}
              sizing="sm"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="">{t("checks.filters.allTypes")}</option>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-52">
            <Label className="text-xs">{t("common.state")}</Label>
            <Select
              icon={FiFlag}
              sizing="sm"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">{t("checks.filters.allStates")}</option>
              <option value="pending">{t("common.pending")}</option>
              <option value="processing">{t("common.processing")}</option>
              <option value="sent">{t("common.sent")}</option>
              <option value="failed">{t("common.failed")}</option>
              <option value="cancelled">{t("common.cancelled")}</option>
            </Select>
          </div>

        </div>

        <div className="flex items-end justify-end flex-shrink-0 gap-2 mt-2 md:mt-0 md:ml-4">
          <Button size="xs" onClick={() => getChecks(1)} color="alternative">
            <FiFilter size={18} /> {t("common.filterActive")}
          </Button>
          <Button
            color="blue"
            size="xs"
            onClick={() => {
              setSearch("");
              setState("");
              setStartDate(null);
              setEndDate(null);
              setTransactionType("");
            }}
          >
            {t("common.filterReset")}
          </Button>
          <Button
            size="xs"
            className="text-white bg-green-600 hover:bg-green-700"
            onClick={handleOpenConnectionModal}
          >
            {connectionExists
              ? t("checks.updateAccountingConnection")
              : t("checks.addAccountingConnection")}
          </Button>
        </div>
      </div>

      <>
        {loading && (
          <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
            <p className="text-2xl font-bold">{t("checks.loading")}</p>
          </div>
        )}

        {!loading && notListPerm && (
          <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
            <p className="text-2xl font-bold">{t(`errors.${notListPerm}`)}</p>
          </div>
        )}

        {!loading && !notListPerm && error && (
          <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
            <p className="text-2xl font-bold">{t("checks.error")}</p>
          </div>
        )}

        {!loading && !error && !notListPerm && pagination && pagination.items.length === 0 && (
          <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
            <p className="text-2xl font-bold">{t("checks.noChecks")}</p>
          </div>
        )}

        {!loading && !error && !notListPerm && pagination && pagination.items.length > 0 && (
          <DataTable
            data={pagination}
            columns={columns}
            onPageChange={getChecks}
            paginationText={t("checks.pagination")}
          />
        )}
      </>
      <Modal show={showConnectionModal} onClose={handleCloseConnectionModal} size="md">
        <ModalHeader>
        {connectionMode === "edit"
          ? t("checks.updateAccountingConnection")
          : t("checks.addAccountingConnection")}
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <div>
              <div className="block mb-2">
                <Label htmlFor="connectionPath">{t("checks.requestUrl")}</Label>
              </div>
              <TextInput
                id="connectionPath"
                value={connectionPath}
                onChange={(e) => setConnectionPath(e.target.value)}
                placeholder={t("checks.requestUrlPlaceholder")}
              />
            </div>

            <div>
              <div className="block mb-2">
                <Label htmlFor="connectionMethod">{t("checks.requestMethod")}</Label>
              </div>
              <Select
                id="connectionMethod"
                value={connectionMethodTermId}
                onChange={(e) => setConnectionMethodTermId(e.target.value)}
              >
                <option value="">{t("common.selectOption")}</option>
                <option value="34f67224-6976-480c-bc7f-77fa25d8748f">GET</option>
                <option value="d6e3e5be-c29a-45de-9aa3-2b61af6537f6">POST</option>
              </Select>
            </div>
            <div>
              <div className="block mb-2">
              <Label htmlFor="connectionApiKey">
                {t("checks.apiKey")} <span className="text-red-500">*</span>
              </Label>
              </div>
              <TextInput
                id="connectionApiKey"
                value={connectionApiKey}
                onChange={(e) => setConnectionApiKey(e.target.value)}
                placeholder={t("checks.apiKeyPlaceholder")}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="gray" onClick={handleCloseConnectionModal}>
            {t("common.cancel")}
          </Button>
          <Button
            color="blue"
            onClick={handleSaveConnection}
            isProcessing={savingConnection}
            disabled={
              !connectionPath.trim() ||
              !connectionMethodTermId ||
              !connectionApiKey.trim()
            }
          >
            {t("common.save")}
          </Button>
        </ModalFooter>
      </Modal>
      {alert && (
        <AlertSimple
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </AppLayoutSB>
  );
};

export default ListChecks;
