import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineClipboardList } from "react-icons/hi";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";

interface Props {
  active: "audit" | "errors";
}

const AuditSwitch = ({ active }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);
  const [canFloat, setCanFloat] = useState(false);

  const measurePosition = useCallback(() => {
    const container = containerRef.current;
    const switchElement = switchRef.current;
    const header = container?.previousElementSibling;
    const parent = container?.parentElement;

    if (!container || !switchElement || !header || !parent) {
      setCanFloat(false);
      return;
    }

    const titleElements = header.querySelectorAll("h1, p");
    const parentRect = parent.getBoundingClientRect();
    let textRightEdge = parentRect.left;

    titleElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      textRightEdge = Math.max(textRightEdge, rect.right);
    });

    const switchWidth = switchElement.scrollWidth;
    const availableWidth = parentRect.right - textRightEdge - 48;
    const shouldFloat = window.innerWidth >= 1024 && availableWidth >= switchWidth;

    setCanFloat((current) => (current === shouldFloat ? current : shouldFloat));
  }, []);

  useEffect(() => {
    measurePosition();

    const parent = containerRef.current?.parentElement;
    const header = containerRef.current?.previousElementSibling;
    let observer: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measurePosition);
      if (parent) observer.observe(parent);
      if (header) observer.observe(header);
    }

    window.addEventListener("resize", measurePosition);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measurePosition);
    };
  }, [measurePosition]);

  return (
    <div
      ref={containerRef}
      className={
        canFloat
          ? "absolute right-6 top-6 flex w-auto justify-end"
          : "my-3 flex w-full justify-center rounded-xl border bg-white p-2 shadow-sm dark:border-gray-600 dark:bg-gray-700"
      }
    >
      <div
        ref={switchRef}
        className={`flex min-w-0 items-center overflow-hidden p-1 border dark:border-gray-600 rounded-xl dark:bg-gray-700 ${
          canFloat ? "w-full sm:w-auto" : "w-auto max-w-full"
        }`}
      >

        {/* Auditoría */}
        <button
          onClick={() => navigate("/audit")}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition sm:flex-none sm:px-4 ${
            active === "audit"
              ? "bg-blue-600 text-white shadow"
              : "dark:text-gray-300 dark:hover:bg-gray-600 hover:bg-gray-100"
          }`}
        >
          <HiOutlineClipboardList size={18} />
          {t("audit.switch.audit")}
        </button>

        {/* Errores */}
        <button
          onClick={() => navigate("/audit/errors")}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition sm:flex-none sm:px-4 ${
            active === "errors"
              ? "bg-blue-600 text-white shadow"
              : "dark:text-gray-300 dark:hover:bg-gray-600  hover:bg-gray-100"
          }`}
        >
          <HiOutlineExclamationCircle size={18} />
          {t("audit.switch.errors")}
        </button>

      </div>
    </div>
  );
};

export default AuditSwitch;
