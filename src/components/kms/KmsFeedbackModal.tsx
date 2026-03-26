import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check } from "lucide-react";

export type KmsFeedbackVariant = "error" | "warning" | "success";

interface KmsFeedbackModalProps {
  open: boolean;
  variant: KmsFeedbackVariant;
  message: string;
  onAccept: () => void;
}

/**
 * Modal de feedback para KMS: errores, advertencias y éxitos.
 * Estilo alineado con el diseño de producto (tarjeta blanca, acento rosa en error/aviso).
 */
export function KmsFeedbackModal({ open, variant, message, onAccept }: KmsFeedbackModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const isSuccess = variant === "success";
  const accentClass = isSuccess ? "bg-emerald-600" : "bg-[#FF5A70]";
  const Icon = isSuccess ? Check : AlertTriangle;
  const iconInnerClass = isSuccess ? "text-white" : "text-gray-900";

  const node = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-700/50 px-4 py-8"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onAccept();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kms-feedback-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${accentClass}`}
            aria-hidden
          >
            <Icon className={`h-6 w-6 ${iconInnerClass}`} strokeWidth={2} />
          </div>
          <p
            id="kms-feedback-title"
            className="flex-1 pt-1 text-base font-bold text-gray-900 dark:text-white"
          >
            {message}
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onAccept}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 ${accentClass}`}
          >
            {t("common.accept")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
