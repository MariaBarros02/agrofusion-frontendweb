import React, { useState } from "react";
import { Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

// Definimos el tipo de las props
interface ExampleProps {
  initial?: number;
}
const Example: React.FC<ExampleProps> = ({ initial = 0 }) => {
  const [count, setCount] = useState<number>(initial);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-green-100">
      <button onClick={() => i18n.changeLanguage("es")}>ES</button>
      <button onClick={() => i18n.changeLanguage("en")}>EN</button>

      <h2 className="text-2xl font-bold">{t("welcome")}</h2>

      <p className="text-lg">Valor actual: {count}</p>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 text-white bg-green-600 rounded"
          onClick={() => setCount(count + 1)}
        >
          Incrementar
        </button>

        <button
          className="px-4 py-2 text-white bg-red-500 rounded"
          onClick={() => setCount(count - 1)}
        >
          Decrementar
        </button>
      </div>

      <Button color="dark">Guardar</Button>
    </div>
  );
};

export default Example;
