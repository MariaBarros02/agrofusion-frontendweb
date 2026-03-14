import { create } from "zustand";

const SUPERADMIN_CODE = "SUPERADMINISTRADOR";

interface SubmoduleAccessState {
  activeSubmodules: string[];
  roleCode: string | null;
  loaded: boolean;
  setActiveSubmodules: (data: { active_submodules: string[]; role_code: string | null }) => void;
  clearSubmoduleAccess: () => void;
  canAccessSubmodule: (submoduleCode: string) => boolean;
}

export const useSubmoduleAccessStore = create<SubmoduleAccessState>((set, get) => ({
  activeSubmodules: [],
  roleCode: null,
  loaded: false,

  setActiveSubmodules: (data) =>
    set({
      activeSubmodules: data.active_submodules ?? [],
      roleCode: data.role_code ?? null,
      loaded: true,
    }),

  clearSubmoduleAccess: () =>
    set({
      activeSubmodules: [],
      roleCode: null,
      loaded: false,
    }),

  canAccessSubmodule: (submoduleCode: string) => {
    const { roleCode, activeSubmodules, loaded } = get();
    // No bloquear hasta que hayamos cargado datos del backend
    if (!loaded) return true;
    if (roleCode?.toUpperCase() === SUPERADMIN_CODE) return true;
    return activeSubmodules.includes(submoduleCode);
  },
}));
