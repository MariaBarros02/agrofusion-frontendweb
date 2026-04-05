/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { Label, TextInput, Select, Button } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { useState, useEffect } from "react";
import { FiEdit2, FiFilter, FiFlag, FiInfo, FiTrash2 } from "react-icons/fi";
import { BiCube } from "react-icons/bi";
import DataTable, { type Column } from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import {
  deleteRoleService,
  listRolesService,
} from "../../services/agrofusion/auth.service";
import type {
  ListRolesResponse,
  PaginatedRolesResponse,
} from "../../dto/response/listRoles-response.dto";
import type { listRolesRequest } from "../../dto/request/listRoles-request.dto";
import AlertConfirmation from "../../components/layout/AlertConfirmation";

import type { AlertState } from "../../components/layout/AlertSimple";
import AlertSimple from "../../components/layout/AlertSimple";
import ModuleInactive from "../ModuleInactive";
import { useModuleAccessStore } from "../../store/moduleAccess.store";

import SubmoduleInactive from "../SubmoduleInactive";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";

const ListRoles = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [size] = useState(5);
  const [page, setPage] = useState(1);
  const [alert, setAlert] = useState<AlertState>(null);
  const [paginatedRole, setPaginatedPerm] =
    useState<PaginatedRolesResponse | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ListRolesResponse | null>(
    null,
  );
  const [notListPerm, setNotListPerm] = useState(null);
  //  función principal paginada real
  const getRoles = async (pageParam = page) => {
    try {
      setLoading(true);

      const payload: listRolesRequest = {
        page_index: pageParam,
        page_size: size,
        search: search || undefined,
        state: state || undefined,
      };

      const response = await listRolesService(payload);
      setPaginatedPerm(response);
      setPage(pageParam);
    } catch (err:any) {
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
    getRoles(1);
  }, [search, state]);
  const handlePageChange = (newPage: number) => {
    getRoles(newPage);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;

    try {
      await deleteRoleService(selectedRole.role_id);

      setShowDeleteModal(false);
      setSelectedRole(null);
      await getRoles(1);
    } catch (err: any) {
      setShowDeleteModal(false);
      const errorMessage = err.response?.data?.detail?.code
      
      setAlert({
        message: errorMessage? t(`errors.${errorMessage}`) : t("roles.deleteError"),
        type: "warning",
      });
    }
  };

  const columns: Column<ListRolesResponse>[] = [
    {
      key: "role_id",
      label: t("roles.code"),
      type: "text",
      format: (value: string) => value?.slice(0, 7),
    },
    { key: "name", label: t("roles.name"), type: "text" },
    { key: "state", label: t("common.state"), type: "status" },
    {
      key: "count_users",
      label: t("roles.countUsers"),
      type: "text",
      align: "center",
    },

    {
      key: "actions",
      label: t("roles.functions"),
      type: "actions",
      width: "300px",
      actions: [
        {
          label: t("roles.view"),
          onClick: (role) => navigate(`/administration/role/${role.role_id}`),
        },
        {
          label: t("roles.edit"),
          icon: <FiEdit2 />,
          className: "bg-blue-600 text-white hover:bg-blue-500",
          disabled: (role) => role.code === "SUPERADMINISTRADOR",
          onClick: (role) =>
            navigate(`/administration/roles/edit-role/${role.role_id}`),
        },
        {
          label: t("roles.delete"),
          icon: <FiTrash2 />,
          className: "bg-red-600 text-white hover:bg-red-500",
          disabled: (role) =>
            role.code?.toUpperCase() === "SUPERADMINISTRADOR" ||
            role.count_users >= 1 ||
            role.state === "DELETED",
          onClick: (role) => {
            setSelectedRole(role);
            setConfirmDeleteChecked(false);
            setShowDeleteModal(true);
          },
        },
      ],
    },
  ];

  const canAccessModule = useModuleAccessStore((s) => s.canAccessModule);
  useSubmoduleAccessStore((s) => s.loaded);
  const canAccessSubmodule = useSubmoduleAccessStore((s) => s.canAccessSubmodule);
  const showModuleInactive = !canAccessModule("ADMINISTRATION");
  const showSubmoduleInactive = canAccessModule("ADMINISTRATION") && !canAccessSubmodule("ROLES");
  const showContent = canAccessModule("ADMINISTRATION") && canAccessSubmodule("ROLES");

  const rolesTabs = [
    { id: "roles", label: "common.roles", icon: BiCube, to: "/administration/roles" },
    { id: "permissions", label: "common.permissions", icon: FiInfo, to: "/administration/permissions" },
  ];

  return (
    <AppLayoutSB>
      <TitleTarget
        title="roles.title"
        description="roles.description"
        activeTab="roles"
        tabs={rolesTabs}
      />
      {/* Filtros - siempre visibles */}
      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
        <div className="flex flex-wrap flex-1 gap-2 overflow-x-auto">
          <div className="w-72">
            <Label className="text-xs">{t("common.search")}</Label>
            <TextInput
              icon={HiSearch}
              sizing="sm"
              placeholder={t("roles.searchPlaceholder")}
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
                {t("common.active")} / {t("common.inactive")} / {t("common.deleted")}
              </option>
              <option value="ACTIVE">{t("common.active")}</option>
              <option value="INACTIVE">{t("common.inactive")}</option>
              <option value="DELETED">{t("common.deleted")}</option>
            </Select>
          </div>
        </div>
        <div className="flex items-end justify-end flex-shrink-0 gap-2 mt-2 md:mt-0 md:ml-4">
          <Button size="xs" onClick={() => getRoles(1)} color="alternative">
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
          <Button
            color="blue"
            size="xs"
            onClick={() => navigate("/administration/roles/create-role")}
          >
            {t("roles.createRoles")}
          </Button>
        </div>
      </div>
      {/* Área de contenido: mensaje inactivo o tabla */}
      {showModuleInactive && <ModuleInactive />}
      {showSubmoduleInactive && <SubmoduleInactive />}
      {showContent && (
        <>
          {loading && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("roles.loading")}</p>
            </div>
          )}
          {!loading && notListPerm && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t(`errors.${notListPerm}`, { defaultValue: t('errors.unknown') })}</p>
            </div>
          )}
          {!loading && !notListPerm && error && (
            <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold">{t("roles.error")}</p>
            </div>
          )}
          {!loading && !error && !notListPerm && paginatedRole?.items.length === 0 && (
            <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
              <p className="text-3xl font-bold text-black dark:text-gray-200">
                {t("roles.noRoles")}
              </p>
            </div>
          )}
          {!loading && !error && !notListPerm && paginatedRole && paginatedRole.items.length !== 0 && (
            <DataTable
              data={paginatedRole}
              columns={columns}
              onPageChange={handlePageChange}
              paginationText={t("roles.roles")}
            />
          )}
        </>
      )}
      <AlertConfirmation
        show={showDeleteModal}
        type="error"
        title={t("roles.deleteTitle")}
        message={`${t("roles.deleteQuestion")} "${selectedRole?.name}"?`}
        description={t("roles.deleteDescription")}
        confirmText={t("roles.deleteButton")}
        cancelText={t("common.cancel")}
        checkboxLabel={t("roles.checkboxLabel")}
        checkboxChecked={confirmDeleteChecked}
        onCheckboxChange={setConfirmDeleteChecked}
        confirmDisabled={!confirmDeleteChecked}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRole(null);
          setConfirmDeleteChecked(false);
        }}
      />
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

export default ListRoles;
