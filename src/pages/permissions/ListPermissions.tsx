/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { Label, TextInput, Select, Button } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { useState, useEffect } from "react";
import { FiEdit2, FiFilter, FiFlag, FiInfo } from "react-icons/fi";
import { BiCube } from "react-icons/bi";
import DataTable, { type Column } from "../../components/DataTable";
import type {
  ListPermissionsResponse,
  PaginatedPermissionsResponse,
} from "../../dto/response/listPermissions-response.dto";
import { useNavigate } from "react-router-dom";
import type { listPermissionsRequest } from "../../dto/request/listPermissions-request.dto";
import { listPermissionsService } from "../../services/agrofusion/auth.service";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";

const ListPermissions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [size] = useState(5);
  const [page,setPage] = useState(1);
  const [notListPerm, setNotListPerm] = useState(null);

  const [paginatedPerm, setPaginatedPerm] =
    useState<PaginatedPermissionsResponse | null>(null);
  //  función principal paginada real
  const getPermissions = async (pageParam = page) => {
    try {
      setLoading(true);

      const payload: listPermissionsRequest = {
        page_index: pageParam,
        page_size: size,
        search: search || undefined,
        state: state || undefined,
      };

      const response = await listPermissionsService(payload);
      setPaginatedPerm(response);
      setPage(pageParam);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail?.code
      
      if (errorMessage) {
        setNotListPerm(errorMessage);
        return;
      }
      setError("Error loading users");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      getPermissions(1);
    }, [search, state]);
  const handlePageChange = (newPage: number) => {
    getPermissions(newPage);
  };


  const columns: Column<ListPermissionsResponse>[] = [
    { key: "permission_id", label: t("permissions.code"), type: "text", format: (value: string) => value?.slice(0, 7), },
    { key: "name", label: t("permissions.name"), type: "text" },
    { key: "module", label: t("permissions.module"), type: "text" },
    { key: "submodule", label: t("permissions.submodule"), type: "text" },
    { key: "type", label: t("permissions.type"), type: "text" },
    { key: "state", label: t("common.state"), type: "status" },

    {
      key: "actions",
      label: t("permissions.functions"),
      type: "actions",
      actions: [
        {
          label: t("permissions.view"),
          onClick: (perm) => navigate(`/administration/permissions/${perm.permission_id}`),
        },
        {
          label: t("permissions.edit"),
          icon: <FiEdit2 />,
          className: "bg-blue-600 text-white hover:bg-blue-500",
          onClick: (perm) =>
            navigate(`/administration/permissions/edit-perm/${perm.permission_id}`),
        }
      ],
    },
  ];

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore((s) => s.canAccessSubmodule);
  const showModuleInactive = !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive = canAccessModule("ADMINISTRATION") && !canAccessSubmodule("PERMISSIONS");
  const showContent = canAccessModule("ADMINISTRATION") && canAccessSubmodule("PERMISSIONS");

  const permissionsTabs = [
    { id: "roles", label: "common.roles", icon: BiCube, to: "/administration/roles" },
    { id: "permissions", label: "common.permissions", icon: FiInfo, to: "/administration/permissions" },
  ];

  return (
    <AppLayoutSB>
      <TitleTarget
        title="permissions.title"
        description="permissions.description"
        activeTab="permissions"
        tabs={permissionsTabs}
      />
      {/* Filtros - siempre visibles */}
      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
        <div className="flex gap-2">
          <div className="w-72">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("permissions.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-52">
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
            </Select>
          </div>
        </div>

        <div className="flex items-end gap-2 mt-2 ml-4 md:w-1/2 md:mt-0">
          <Button
            size="xs"
            onClick={() => getPermissions(1)}
            color="alternative"
          >
            <FiFilter size={18} /> {t("common.filterActive")}
          </Button>

          <Button
            color="blue"
            size="xs"
            onClick={() => {
              setSearch("");
              setState("");
            }}
          >
            {t("common.filterReset")}
          </Button>
          {/* <Button
            color="blue"
            size="xs"
            onClick={() => navigate("/administrator/roles")}
          >
            {t("roles.createRoles")}
          </Button> */}
        </div>
      </div>
      {/* Área de contenido: mensaje inactivo o tabla */}
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("permissions.loading")}</p>
            </div>
          )}
          {!loading && notListPerm && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t(`errors.${notListPerm}`, { defaultValue: t('errors.unknown') })}</p>
            </div>
          )}
          {!loading && !notListPerm && error && (
            <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("permissions.error")}</p>
            </div>
          )}
          {!loading && !error && !notListPerm && paginatedPerm?.items.length === 0 && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold text-black dark:text-gray-200">
                {t("permissions.noPermissions")}
              </p>
            </div>
          )}
          {!loading && !error && !notListPerm && paginatedPerm && paginatedPerm.items.length !== 0 && (
            <DataTable
              data={paginatedPerm}
              columns={columns}
              onPageChange={handlePageChange}
              paginationText={t("permissions.permissions")}
            />
          )}
        </>
      )}
    </AppLayoutSB>
  );
};

export default ListPermissions;
