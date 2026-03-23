import { Link } from "react-router-dom";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import { KeyRound, FileBadge, ShieldCheck, ArrowRight } from "lucide-react";

/**
 * Punto de entrada KMS: enlaces a formularios reales contra el backend de auditoría.
 */
export default function KmsHome() {
  const { t } = useTranslation();

  const cards = [
    {
      to: "/kms/crear-clave",
      title: t("kms.home.cardCreateKey"),
      desc: t("kms.home.cardCreateKeyDesc"),
      icon: KeyRound,
      accent: "from-sky-500 to-blue-600",
    },
    {
      to: "/kms/certificado",
      title: t("kms.home.cardCert"),
      desc: t("kms.home.cardCertDesc"),
      icon: FileBadge,
      accent: "from-emerald-500 to-teal-600",
    },
    {
      to: "/kms/verificar-firma",
      title: t("kms.home.cardVerify"),
      desc: t("kms.home.cardVerifyDesc"),
      icon: ShieldCheck,
      accent: "from-violet-500 to-indigo-600",
    },
  ];

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.home.title" />
      <div className="p-4 m-0 mt-3 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm md:text-base">
          {t("kms.home.subtitle")}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map(({ to, title, desc, icon: Icon, accent }) => (
            <Link
              key={to}
              to={to}
              className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-600 dark:bg-slate-700"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white ${accent}`}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                {t("kms.home.go")}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AppLayoutSB>
  );
}
