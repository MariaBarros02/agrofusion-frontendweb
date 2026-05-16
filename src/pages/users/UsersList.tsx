/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { FiFilter, FiFlag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { LuList } from "react-icons/lu";
import {
  getBasicListRolesService,
  listUsersService,
} from "../../services/agrofusion/auth.service";
import type { listUsersRequest } from "../../dto/request/listUsers-request.dto";
import type {
  PaginatedUsersResponse,
  ListUserResponse,
} from "../../dto/response/listUsers-response.dto";
import DataTable, { type Column } from "../../components/DataTable";
import type { ListBasicRole } from "../../dto/response/listBasicRoles-response.dto";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";

const UsersList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [paginatedUsers, setPaginatedUsers] =
    useState<PaginatedUsersResponse | null>(null);

  const [basicRoles, setBasicRoles] = useState<ListBasicRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // estado de paginación
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [notPerm, setNotPerm] = useState(false);

  // filtros
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [rol, setRol] = useState("");

  //   const columns: Column<ListUserResponse>[] = [
  //   {
  //     key: "user_id",
  //     label: t("users.code"),
  //     type: "text",
  //     format: (value: string) => value?.slice(0, 7),
  //   },
  //   { key: "name", label: t("users.name"), type: "text" },
  //   { key: "email", label: t("users.email"), type: "text" },
  //   { key: "rol", label: t("users.role"), type: "text" },

  //   // SOLO UNA COLUMNA DE ESTADO
  //   {
  //     key: "state", //  IMPORTANTE
  //     label: t("common.state"),
  //     type: "statusEditable",
  //     allowedStatuses: ["ACTIVE", "INACTIVE", "PENDING", "DELETED"],
  //     onChange: async (user, newStatus) => {
  //       console.log("Cambiar estado:", user.user_id, newStatus);

  //       // await updateUserStatusService(user.user_id, newStatus);

  //       getUsers(page);
  //     },
  //   },

  //   {
  //     key: "created_at",
  //     label: t("users.createdAt"),
  //     type: "text",
  //     format: (value: string) => value?.split("T")[0],
  //   },

  //   {
  //       key: "edit",
  //       label: t("users.actions"),
  //       type: "action",
  //       action: {
  //         label: t("users.viewDetail"),
  //         onClick: (user: ListUserResponse) =>
  //           navigate(`/administration/users/${user.user_id}`),
  //       },
  //     },
  // ];
  const columns: Column<ListUserResponse>[] = [
    {
      key: "user_id",
      label: t("users.code"),
      type: "text",
      format: (value: string) => value?.slice(0, 7),
      width: "80px"
    },
    { key: "name", label: t("users.name"), type: "text", width: "250px" },
    { key: "email", label: t("users.email"), type: "text" },
    { key: "rol", label: t("users.role"), type: "text" },
    { key: "state", label: t("common.state"), type: "status", width: "80px" },
    {
      key: "created_at",
      label: t("users.createdAt"),
      type: "text",
      format: (value: string) => value?.split("T")[0],
      width: "150px"
    },
    {
      key: "edit",
      label: t("users.actions"),
      type: "action",
      width: "120px",
      action: {
        label: t("users.viewDetail"),
        onClick: (user: ListUserResponse) =>
          navigate(`/administration/users/${user.user_id}`),
      },
    },
  ];

  //  función principal paginada real
  const getUsers = async (pageParam = page) => {
    try {
      setLoading(true);

      const payload: listUsersRequest = {
        page_index: pageParam,
        page_size: size,
        search: search || undefined,
        state: state || undefined,
        rol: rol || undefined,
      };

      const response = await listUsersService(payload);
      setPaginatedUsers(response);
      setPage(pageParam);
    } catch (err: any) {    
      const errorCode = err.response?.data?.detail?.code ?? "UNKNOWN_ERROR";
      if (errorCode === "AUTH_INSUFFICIENT_PERMISSIONS") {
        setNotPerm(true);
        return;
      }
      setError("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  // cargar al montar o cambiar filtros
  useEffect(() => {
    getUsers(1);
  }, [search, state, rol]);

  const handlePageChange = (newPage: number) => {
    getUsers(newPage);
  };

  const getBasicRoles = async () => {
    try {
      const response = await getBasicListRolesService();
      setBasicRoles(response);
    } catch (error) {
      console.error("Error loading basic roles", error);
    }
  };

  useEffect(() => {
    getBasicRoles();
  }, []);

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore((s) => s.canAccessSubmodule);
  const showModuleInactive = !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive = canAccessModule("ADMINISTRATION") && !canAccessSubmodule("USERS");
  const showContent = canAccessModule("ADMINISTRATION") && canAccessSubmodule("USERS");

  return (
    <AppLayoutSB>
      <TitleTarget title="users.title" description="users.description" />
      {/* filtros */}
      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
        <div className="md:flex gap-2">
          <div className="md:w-72 w-full">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("users.searchNameEmail")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="md:w-52 w-full">
            <Label className="text-xs">{t("common.state")}</Label>
            <Select
              icon={FiFlag}
              sizing="sm"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">
                {t("common.active")} / {t("common.inactive")}
              </option>
              <option value="ACTIVE">{t("common.active")}</option>
              <option value="INACTIVE">{t("common.inactive")}</option>
              <option value="DELETED">{t("common.deleted")}</option>
              <option value="PENDING">{t("common.pending")}</option>
              <option value="BLOCKED"> {t("common.blocked")}</option>
            </Select>
          </div>
          <div className="md:max-w-md w-full">
            <Label className="text-xs">{t("users.associateRole")}</Label>
            <Select
              icon={LuList}
              sizing="sm"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="">{t("users.roles")}</option>
              {basicRoles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex items-end justify-end gap-2 mt-2 md:w-1/2 md:mt-0">
          <Button size="xs" onClick={() => getUsers(1)} color="alternative">
            <FiFilter size={18} /> {t("common.filterActive")}
          </Button>
          <Button
            color="blue"
            size="xs"
            onClick={() => {
              setSearch("");
              setState("");
              setRol("");
            }}
          >
            {t("common.filterReset")}
          </Button>
          <Button
            color="green"
            size="xs"
            onClick={() => navigate("/administration/users/create-user")}
          >
            {t("users.createUser")}
          </Button>
        </div>
      </div>
      {/* área de contenido: mensaje inactivo o tabla */}
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("users.loading")}</p>
            </div>
          )}
             {notPerm && !error && !loading && (
        <div className="flex items-center justify-center mt-3 bg-white border shadow-sm rounded-xl dark:border-gray-600 dark:bg-gray-700 h-1/2">
          {" "}
          <p className="text-3xl font-bold">{t("users.notPerm")}</p>{" "}
        </div>
      )}{" "}
          {!loading && error && (
            <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("users.error")}</p>
            </div>
          )}
          {!loading && !error && paginatedUsers?.items.length === 0 && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold text-black dark:text-gray-200">
                {t("users.noUsers")}
              </p>
            </div>
          )}
          {!loading && !error && paginatedUsers && paginatedUsers.items.length !== 0 && (
            <DataTable
              data={paginatedUsers}
              columns={columns}
              onPageChange={handlePageChange}
              paginationText={t("users.users")}
              maxVisiblePages={5}
            />
          )}
        </>
      )}
    </AppLayoutSB>
  );
};

export default UsersList;
