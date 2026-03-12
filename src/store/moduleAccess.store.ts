import { create } from "zustand";

const SUPERADMIN_CODE = "SUPERADMINISTRADOR";

export interface ModuleAccessState {
  activeModules: string[];
  roleCode: string | null;
  loaded: boolean;
  setModuleAccess: (activeModules: string[], roleCode: string | null) => void;
  clearModuleAccess: () => void;
  /** true si el usuario es SUPERADMINISTRADOR o si el módulo está en activeModules */
  canAccessModule: (moduleCode: string) => boolean;
}

export const useModuleAccessStore = create<ModuleAccessState>((set, get) => ({
  activeModules: [],
  roleCode: null,
  loaded: false,

  setModuleAccess: (activeModules, roleCode) =>
    set({ activeModules, roleCode, loaded: true }),

  clearModuleAccess: () =>
    set({ activeModules: [], roleCode: null, loaded: false }),

  canAccessModule: (moduleCode: string) => {
    const { roleCode, activeModules } = get();
    if (roleCode === SUPERADMIN_CODE) return true;
    return activeModules.includes(moduleCode);
  },
}));
