import { useState } from "react";
import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  SidebarLogo,
} from "flowbite-react";
import { HiChartPie, HiX, HiChevronDown } from "react-icons/hi";
import { FaRegUser } from "react-icons/fa";
import { FiClipboard, FiBookOpen, FiShield } from "react-icons/fi";
import { GoPencil } from "react-icons/go";
import {
  LuFolderGit2,
  LuFolderKanban,
  LuLogOut,
  LuUsers,
} from "react-icons/lu";
import ThemeToggle from "../ThemeToggle";
import { useAuthStore } from "../../store/auth.store";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { LiaCubesSolid } from "react-icons/lia";
import { logoutService } from "../../services/agrofusion/auth.service";
import { useNavigate } from "react-router-dom";
import logoAgrofusionRemovebg2 from "/logoAgrofusion-removebg2.png"

interface NavSideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavSideBar({ isOpen, onClose }: NavSideBarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const basename = import.meta.env.VITE_BASENAME || ""

  // helpers
  const isActive = (path: string) => pathname.startsWith(path);

  // estado submenu admin
  const [adminManuallyOpen, setAdminManuallyOpen] = useState(false);

  // helper
  const isAdminRoute = pathname.startsWith("/admin");

  // adminOpen final (DERIVADO, no estado)
  const adminOpen = adminManuallyOpen || isAdminRoute;

  const baseItem =
    "group font-semibold text-black hover:text-blue-600 hover:bg-white transition-colors " +
    "[&_svg]:!text-current";

  const subItem =
    "group ml-8 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm " +
    "text-gray-700 hover:text-blue-600  hover:bg-white transition-colors " +
    "[&_svg]:!text-current";

  const activeItem = "bg-white text-blue-600 [&_svg]:!text-current dark:bg-gray-400";

  const logoutItem =
    "font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors dark:text-gray-300 " +
    "[&>svg]:text-red-600 hover:[&>svg]:!text-red-700";

  /**
   * Cierra la sesión del usuario.
   * Intenta invalidar el token en el backend y limpia el estado local
   * independientemente del resultado de la red.
   */
  const logout = async () => {
    try {
      if (authStore.accessToken) {
        await logoutService();
        
      }

      navigate('/login')

    } catch (error) {
      console.error("Logout backend failed", error);
    } finally {
      authStore.logout();

      localStorage.removeItem("auth-storage");

      //window.location.href = "/login";
    }
  };
  return (
    <div
      className={`
        fixed top-0 left-0 z-40 h-screen
        transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static 
      `}
    >
      <div className="h-full p-3">
        <Sidebar
          className="
            relative h-full pb-24
            !bg-[#E1E8F5]
            [&>div]:!bg-[#E1E8F5]
            dark:!bg-slate-600
            [&>div]:dark:!bg-slate-600
            !rounded-xl [&>div]:!rounded-xl  shadow-md
          "
        >
          {/* LOGO */}
          <SidebarLogo
            href="#"
            onClick={(e) => { e.preventDefault(); navigate(`${basename}/dashboard`)}}
            img={logoAgrofusionRemovebg2}            
            imgAlt="AgroFusion logo"
          >
            <div className=" !rounded-xl flex items-center justify-between w-full">
              <p className="font-semibold">AgroFusion</p>
              <button
                onClick={onClose}
                className="mt-1 text-gray-500 ml-14 md:hidden"
              >
                <HiX size={22} />
              </button>
            </div>
          </SidebarLogo>

          {/* ITEMS */}
          <SidebarItems
            className="!bg-transparent overflow-y-auto [scrollbar-width:thin] 
          /* Firefox */
            [scrollbar-color:rgba(100,116,139,0.4)_transparent]

            /* Chrome / Edge / Safari */
            [&::-webkit-scrollbar]:w-[4px]
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-400/50
            [&::-webkit-scrollbar-track]:bg-transparent

            /*  eliminar flechas */
            [&::-webkit-scrollbar-button]:hidden
            [&::-webkit-scrollbar-button]:w-0
            [&::-webkit-scrollbar-button]:h-0"
          >
            <SidebarItemGroup>
              <SidebarItem
              
                onClick={() => navigate(`${basename}/profile`)}
                icon={FaRegUser}
                className={`${baseItem} ${isActive("/profile") ? activeItem : ""}`}
              >
                {t("nav.profile")}
              </SidebarItem>

              {/* ADMIN HEADER */}
              <button
                onClick={() => setAdminManuallyOpen((v) => !v)}
                className={`group w-full flex items-center justify-between px-2 py-2 rounded-lg
                font-semibold
                text-black dark:text-white
                hover:text-blue-600 
                hover:bg-white dark:hover:bg-slate-700
                transition-colors `}
              >
                <div className="flex items-center gap-3 dark:text-white">
                  <HiChartPie size={22} />
                  <span>{t("nav.admin")}</span>
                </div>
                <HiChevronDown
                  className={`transition-transform  text-current ${adminOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* SUBMENU */}
              {adminOpen && (
                <div className="mt-1 space-y-1 ">
                  <SidebarItem
                    href="/administration/projects"
                    icon={LuFolderKanban}
                    className={`${subItem} ${
                      isActive("/administration/projects") ? activeItem : ""
                    }`}
                  >
                    {t("nav.projects")}
                  </SidebarItem>

                  <SidebarItem
                    href="/administration/modules"
                    icon={LuFolderGit2}
                    className={`${subItem} ${
                      isActive("/administration/modules") ? activeItem : ""
                    }`}
                  >
                    {t("nav.modules")}
                  </SidebarItem>

                  <SidebarItem
                    href="/administration/submodules"
                    icon={LiaCubesSolid}
                    className={`${subItem} ${
                      isActive("/administration/submodules") ? activeItem : ""
                    }`}
                  >
                    {t("nav.submodules")}
                  </SidebarItem>

                  <SidebarItem
                    href="/administration/roles"
                    icon={FiShield}
                    className={`${subItem} ${
                      isActive("/administration/roles") ? activeItem : ""
                    }`}
                  >
                    {t("nav.roles")}
                  </SidebarItem>

                  <SidebarItem
                    href="/administration/users"
                    icon={LuUsers}
                    className={`${subItem} ${
                      isActive("/administration/users") ? activeItem : ""
                    }`}
                  >
                    {t("nav.users")}
                  </SidebarItem>

                </div>
              )}

              <SidebarItem
                href="/check"
                icon={FiClipboard}
                className={`${baseItem} ${isActive("/check") ? activeItem : ""}`}
              >
                {t("nav.check")}
              </SidebarItem>

              <SidebarItem
                href="/digitalSignature"
                icon={GoPencil}
                className={`${baseItem} ${
                  isActive("/digitalSignature") ? activeItem : ""
                }`}
              >
                {t("nav.digitalSig")}
              </SidebarItem>

              <SidebarItem
                href="/audit"
                icon={FiBookOpen}
                className={`${baseItem} ${isActive("/audit") ? activeItem : ""}`}
              >
                {t("nav.audit")}
              </SidebarItem>

              <SidebarItem
                onClick={() => logout()}
                icon={LuLogOut}
                className={`${logoutItem} hover:cursor-pointer`}
              >
                {t("common.logout")}
              </SidebarItem>
            </SidebarItemGroup>
          </SidebarItems>

          {/* TOGGLES */}
          <div className="absolute flex gap-2 p-2 -translate-x-1/2 rounded-lg bottom-6 left-1/2 bg-white/80 backdrop-blur dark:bg-gray-600">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </Sidebar>
      </div>
    </div>
  );
}
