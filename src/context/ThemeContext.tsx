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
 * Proveedor del contexto de tema.
 *
 * Responsabilidades:
 * - Inicializar el tema desde localStorage o preferencias del sistema
 * - Sincronizar la clase `dark` en el elemento `<html>`
 * - Persistir el tema seleccionado
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Componentes hijos
 *
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
 * Hook para consumir el contexto de tema.
 *
 * @throws {Error} Si se usa fuera de `ThemeProvider`
 *
 * @returns {ThemeContextType} Contexto de tema
 *
 * @example
 * const { theme, toggleTheme } = useTheme();
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
