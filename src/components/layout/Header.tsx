import LanguageSwitcher from "../LanguageSwitcher";
import ThemeToggle from "../ThemeToggle";
import logoAgrofusionRemovebg2 from "/logoAgrofusion-removebg2.png"

/**
 * Componente Header.
 * Contiene el logotipo, el título de la app y los controles globales (Tema e Idioma).
 */
const Header = () => {
  return (
    <div className="flex items-center justify-between p-2 pl-16 border-b">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={logoAgrofusionRemovebg2}
          className="w-10"
          alt="AgroFusion"
        />
        <h1 className="text-lg font-bold dark:text-white">AgroFusion</h1>
      </div>
      <div className="flex justify-end gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default Header;
