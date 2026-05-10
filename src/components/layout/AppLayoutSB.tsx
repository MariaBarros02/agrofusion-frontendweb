import { useState } from "react";
import type { ReactNode } from "react";
import { NavSideBar } from "./NavSideBar";
import { HiMenu } from "react-icons/hi";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayoutSB({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex overflow-y-hidden bg-[#F8FAFC] dark:bg-slate-800 dark:text-white">
      
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="z-50 hidden p-2 bg-white rounded-lg shadow-md top-4 left-4 dark:bg-slate-700 md:block" 
        >
          ☰
        </button>
      )}

      <NavSideBar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`
    flex-1 min-h-screen p-3 overflow-auto
    transition-all duration-300
    ${sidebarOpen ? "md:ml-[260px]" : "md:ml-0"}
  `}>
        {/* botón mobile */}
        <button
          className="mb-4 md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <HiMenu size={26} />
        </button>

        {children}
      </div>
    </div>
  );
}
