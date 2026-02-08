import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { FiFilter, FiFlag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { LuList } from "react-icons/lu";
const UsersList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  return (
    <AppLayoutSB>
      <TitleTarget title="users.title" description="users.description" />

      <div className="p-3 bg-white border shadow-sm dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
        <div className="flex gap-2 ">
          <div className="w-72">
            <div className="block ">
              <Label className="text-xs" htmlFor="nameEmail">
                {t("common.search")}
              </Label>
            </div>
            <TextInput
              id="nameEmail"
              type="email"
              icon={HiSearch}
              placeholder={t("users.searchNameEmail")}
              required
              sizing="sm"
            />
          </div>
          <div className="w-52">
            <div className="block ">
              <Label className="text-xs" htmlFor="usersState">
                {t("common.state")}
              </Label>
            </div>
            <Select
              id="usersState"
              required
              icon={FiFlag}
              defaultValue=""
              sizing="sm"
            >
              <option value="" disabled>
                {t("common.active")}/{t("common.inactive")}
              </option>
              <option value="active">{t("common.active")}</option>
              <option value="inactive">{t("common.inactive")}</option>
            </Select>
          </div>
          <div className="max-w-md">
            <div className="block ">
              <Label className="text-xs" htmlFor="usersRole">
                {t("users.associateRole")}
              </Label>
            </div>
            <Select
              id="usersRole"
              required
              icon={LuList}
              defaultValue=""
              sizing="sm"
            >
              <option value="">{t("users.roles")}</option>
              <option value="admin">{t("users.admin")}</option>
              <option value="user">{t("users.basicUser")}</option>
            </Select>
          </div>
        </div>
        <div className="flex items-end justify-end gap-2 mt-2 md:w-1/2 md:mt-0">
          <Button color="alternative" size="xs" pill>
            {" "}
            <FiFilter size={18} /> {t("common.filterActive")}
          </Button>
          <Button size="xs" color="blue">
            {t("common.filterReset")}
          </Button>
          <Button size="xs" color="blue" onClick={() => navigate("/administration/users/create-user")}>
            {t("users.createUser")}
          </Button>
        </div>
      </div>

      <div className="h-full">
        {loading && (
          <div className="flex items-center justify-center p-3 mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl h-1/2">
            {" "}
            <p className="text-3xl font-bold">{t("users.loading")}</p>{" "}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center mt-3 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 h-1/2">
            {" "}
            <p className="text-3xl font-bold">{t("users.loading")}</p>{" "}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3 max-h-[calc(100vh-135px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 mt-2 bg-white border shadow-sm dark:border-gray-600 dark:bg-gray-700 rounded-2xl">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {t("users.noUsers")}
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div className="items-center justify-center p-3 mt-2 font-bold bg-white border h-1/2 dark:bg-gray-700 dark:border-gray-600 md:flex rounded-2xl">
                  <p className="text-2xl">{t("users.noUsers")}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayoutSB>
  );
};

export default UsersList;
