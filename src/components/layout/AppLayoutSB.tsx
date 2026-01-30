import { useState } from "react";
import type { ReactNode } from "react";
import { NavSideBar } from "./NavSideBar";
import { HiMenu } from "react-icons/hi";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayoutSB({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex overflow-y-hidden bg-[#F8FAFC] dark:bg-slate-800 dark:text-white">
      <NavSideBar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-h-screen p-3">
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
