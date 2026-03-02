import { useTranslation } from "react-i18next";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { Label, TextInput, Select, Button } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { useState } from "react";
import { FiFilter, FiFlag, FiInfo } from "react-icons/fi";
import { BiCube } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const ListRoles = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");

  const navigate = useNavigate();
  const getRoles = (page: number) => {
    console.log(page);
  };

 const handlePageChange = (newPage: number) => {
    getRoles(newPage);
  };

  return (
    <AppLayoutSB>
      <TitleTarget
        title="roles.title"
        description="roles.description"
        activeTab="roles"
        tabs={[
          {
            id: "roles",
            label: "common.roles",
            icon: BiCube,
            to: "/administration/roles",
          },
          {
            id: "permissions",
            label: "common.permissions",
            icon: FiInfo,
            to: "/administration/permissions",
          },
        ]}
      />
      <div className="p-3 mb-2 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
        <div className="flex gap-2">
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
                {t("common.active")} / {t("common.inactive")}
              </option>
              <option value="ACTIVE">{t("common.active")}</option>
              <option value="INACTIVE">{t("common.inactive")}</option>
              <option value="DELETED">{t("common.deleted")}</option>
            </Select>
          </div>
        </div>

        <div className="flex items-end ml-4 gap-2 mt-2 md:w-1/2 md:mt-0">
          <Button
            size="xs"
            onClick={() => getRoles(1)}
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
          <Button
            color="blue"
            size="xs"
            onClick={() => navigate("/administrator/roles")}
          >
            {t("roles.createRoles")}
          </Button>
        </div>
      </div>
    </AppLayoutSB>
  );
};

export default ListRoles;
