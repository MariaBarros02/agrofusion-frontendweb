/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

/**
 * Temas disponibles en la aplicación.
 */
type Theme = "light" | "dark";

/**
 * Estructura del contexto de tema.
 */
export interface ThemeContextType {
  /** Tema actual de la aplicación */
  theme: Theme;

  /** Alterna el tema entre light y dark */
  toggleTheme: () => void;
}

/**
 * Contexto de React para manejar el tema global.
 *
 * Su valor es `undefined` por defecto y debe ser
 * consumido únicamente dentro de `ThemeProvider`.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

/**
 * Proveedor del contexto de tema (ThemeProvider).
 * * Lógica de inicialización:
 * 1. Busca en `localStorage` una preferencia guardada.
 * 2. Si no existe, consulta las preferencias del Sistema Operativo (`prefers-color-scheme`).
 * * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes envueltos por el proveedor.
 */
export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * Estado del tema con inicializador perezoso (Lazy Initializer).
   * Solo se ejecuta en el primer renderizado.
   */
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme) {
      return savedTheme;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    return prefersDark ? "dark" : "light";
  });


  /**
   * Sincronización del tema con el DOM y almacenamiento local.
   * Aplica o remueve la clase `.dark` en el elemento raíz (<html>).
   */
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  /**
   * Alterna el tema actual entre modo claro y oscuro.
   */
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook personalizado para acceder a las propiedades del tema.
 * * @returns {ThemeContextType} Objeto con el tema actual y función toggle.
 * @throws {Error} Si el hook es llamado fuera de un `<ThemeProvider />`.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme debe usarse dentro de ThemeProvider"
    );
  }

  return context;
};
