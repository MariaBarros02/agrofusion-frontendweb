import { Link } from "react-router-dom";
import AppLayoutSB from "../../components/layout/AppLayoutSB";
import TitleTarget from "../../components/layout/TitleTarget";
import { useTranslation } from "react-i18next";
import {
  KeyRound,
  ArrowRight,
  PenSquare,
  RefreshCcw,
  BadgeCheck,
  Ban,
  ListChecks,
} from "lucide-react";


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
      to: "/kms/firmar",
      title: t("kms.home.cardSign"),
      desc: t("kms.home.cardSignDesc"),
      icon: PenSquare,
      accent: "from-amber-500 to-orange-600",
    },
    {
      to: "/kms/validar-firma",
      title: t("kms.home.cardValidatePresentable"),
      desc: t("kms.home.cardValidatePresentableDesc"),
      icon: BadgeCheck,
      accent: "from-cyan-500 to-sky-600",
    },
    {
      to: "/kms/consultar-firmas",
      title: t("kms.home.cardQuery"),
      desc: t("kms.home.cardQueryDesc"),
      icon: ListChecks,
      accent: "from-indigo-500 to-violet-600",
    },
    {
      to: "/kms/rotar-clave",
      title: t("kms.home.cardRotate"),
      desc: t("kms.home.cardRotateDesc"),
      icon: RefreshCcw,
      accent: "from-fuchsia-500 to-pink-600",
    },
    {
      to: "/kms/revocar",
      title: t("kms.home.cardRevoke"),
      desc: t("kms.home.cardRevokeDesc"),
      icon: Ban,
      accent: "from-rose-500 to-red-600",
    },
  ];

  return (
    <AppLayoutSB>
      <TitleTarget title="kms.home.title" description="kms.home.subtitle" />
      <div className="p-4 m-0 mt-3 bg-white border shadow-sm rounded-2xl h-[calc(100vh-130px)] overflow-auto dark:border-gray-600 dark:bg-gray-700">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
