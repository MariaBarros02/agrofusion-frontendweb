import { Button, Label, Select, TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { FiFilter } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";

interface User {
  id: string;
  name: string;
}

interface Origin {
  code: string;
}

interface Event {
  code: string;
  label?: string;
}

interface Props {
  type: "audit" | "errors";

  search: string;
  setSearch: (v: string) => void;

  origin: string;
  setOrigin: (v: string) => void;

  result: string;
  setResult: (v: string) => void;

  eventType: string;
  setEventType: (v: string) => void;

  severity: string;
  setSeverity: (v: string) => void;

  component: string;
  setComponent: (v: string) => void;

  project: string;
  setProject: (v: string) => void;

  code: string;
  setCode: (v: string) => void;

  components: { code: string }[];
  codes: { code: string }[];

  userSearch: string;
  setUserSearch: (v: string) => void;

  setUserId: (v: string) => void;

  users: User[];
  filteredUsers: User[];

  showUserDropdown: boolean;
  setShowUserDropdown: (v: boolean) => void;

  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (d: Date | null) => void;
  setEndDate: (d: Date | null) => void;

  origins: Origin[];
  events: Event[];

  applyFilters: () => void;
  resetFilters: () => void;
}

const AuditFilters = ({
  type,
  search,
  setSearch,
  origin,
  setOrigin,
  result,
  setResult,
  eventType,
  setEventType,
  severity,
  setSeverity,
  component,
  setComponent,
  project,
  setProject,
  code,
  setCode,
  components,
  codes,
  userSearch,
  setUserSearch,
  setUserId,
  
  filteredUsers,
  showUserDropdown,
  setShowUserDropdown,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  origins,
  events,
  applyFilters,
  resetFilters,
}: Props) => {
  const { t } = useTranslation();
  const baseKey = type === "audit" ? "audit" : "externalErrors";

  return (
    <div className="p-3 mb-3 bg-white border shadow-sm sm:p-4 dark:bg-gray-700 dark:border-gray-600 rounded-2xl">
      <div className="grid min-w-0 grid-cols-1 justify-items-center gap-x-2 gap-y-1.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xl:justify-items-stretch">
        {/* Buscar */}
        <div className="flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-1 xl:row-start-1">
          <Label>{t(`${baseKey}.filters.search`)}</Label>
          <TextInput
            icon={HiSearch}
            sizing="sm"
            placeholder={t(`${baseKey}.filters.searchPlaceholder`)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Fecha */}
        <div className="flex flex-col min-w-0 w-full max-w-xs [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker__input-container]:w-full xl:max-w-none xl:col-start-1 xl:row-start-2">
          <Label>{t(`${baseKey}.filters.date`)}</Label>

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
            placeholderText={t(`${baseKey}.filters.dateRange`)}
            className="w-full min-w-0 text-sm h-[34px] px-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* ================= AUDITORIA ================= */}
        {type === "audit" && (
          <>
            {/* Usuario */}
            <div className="relative flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-2 xl:row-start-1">
              <Label>{t(`${baseKey}.filters.user`)}</Label>

              <TextInput
                sizing="sm"
                placeholder={t("audit.filters.userPlaceholder")}
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setShowUserDropdown(true);
                }}
              />

              {showUserDropdown && userSearch && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow dark:bg-gray-700 dark:border-gray-600">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => {
                        setUserId(user.id);
                        setUserSearch(user.name);
                        setShowUserDropdown(false);
                      }}
                    >
                      {user.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Origen */}
            <div className="flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-3 xl:row-start-1">
              <Label>{t("audit.filters.origin")}</Label>

              <Select
                sizing="sm"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              >
                <option value="">{t("audit.filters.all")}</option>

                {origins.map((origin) => (
                  <option key={origin.code} value={origin.code}>
                    {t(`audit.${origin.code}`)}
                  </option>
                ))}
              </Select>
            </div>

            {/* Resultado */}
            <div className="flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-2 xl:row-start-2">
              <Label>{t("audit.filters.result")}</Label>

              <Select
                sizing="sm"
                value={result}
                onChange={(e) => setResult(e.target.value)}
              >
                <option value="">{t("audit.filters.all")}</option>
                <option value="SUCCESS">{t("common.success")}</option>
                <option value="FAILED">{t("common.rejected")}</option>
                <option value="ERROR">{t("common.error")}</option>
              </Select>
            </div>

            {/* Evento */}
            <div className="flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-4 xl:row-start-1">
              <Label className="text-sm font-medium">
                {t("audit.filters.event")}
              </Label>

              <Select
                sizing="sm"
                className="w-full h-[34px] text-sm focus:ring-2 focus:ring-blue-500"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="">{t("audit.filters.all")}</option>

                {events.map((event) => (
                  <option key={event.code} value={event.code}>
                    {event.label ?? event.code}
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}

        {/* ================= ERRORES ================= */}
        {type === "errors" && (
          <>
            {/* Proyecto */}
            <div className="flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-2 xl:row-start-1">
              <Label>{t("externalErrors.filters.project")}</Label>
              <TextInput
                sizing="sm"
                placeholder={t("externalErrors.filters.projectPlaceholder")}
                value={project}
                onChange={(e) => setProject(e.target.value)}
              />
            </div>

            {/* Severidad */}
            <div className="flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-3 xl:row-start-1">
              <Label>{t("externalErrors.filters.severity")}</Label>

              <Select
                sizing="sm"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="">{t("externalErrors.filters.all")}</option>
                <option value="HIGH">
                  {t("externalErrors.severity.high")}
                </option>
                <option value="MEDIUM">
                  {t("externalErrors.severity.medium")}
                </option>
                <option value="LOW">{t("externalErrors.severity.low")}</option>
              </Select>
            </div>

            {/* Componente */}
            <div className="flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-4 xl:row-start-1">
              <Label>{t("externalErrors.filters.component")}</Label>
              <Select
                sizing="sm"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
              >
                <option value="">{t("externalErrors.filters.all")}</option>

                {components.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </Select>
            </div>

            {/* Código */}
            <div className="flex flex-col w-full max-w-xs min-w-0 xl:max-w-none xl:col-start-2 xl:row-start-2">
              <Label>{t("externalErrors.filters.code")}</Label>
              <Select
                sizing="sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              >
                <option value="">{t("externalErrors.filters.all")}</option>

                {codes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}

        {/* Botones */}
        <div className="flex flex-wrap items-end justify-center gap-2 md:col-span-2 xl:col-start-3 xl:row-start-2">
          <Button size="xs" onClick={applyFilters} color="alternative">
            <FiFilter size={18} /> {t("common.applyFilters")}
          </Button>

          <Button color="blue" size="xs" onClick={resetFilters}>
            {t("common.resetFilters")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;
