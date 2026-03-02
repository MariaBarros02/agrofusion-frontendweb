import { useTranslation } from "react-i18next";
import { type IconType } from "react-icons";
import { useNavigate } from "react-router-dom";
export interface TabItem {
  id: string;
  label: string;     
  icon?: IconType;
  to?: string;       
}
interface TitleTargetProps {
  title: string;
  description?: string;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: TabItem) => void;
}

const TitleTarget = ({ title, description, tabs, activeTab, onTabChange }: TitleTargetProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleClick = (tab: TabItem) => {
    onTabChange?.(tab);
    if (tab.to) navigate(tab.to);
  };

  return (
    <div className="p-4 mb-3 bg-white border shadow-sm rounded-xl md:flex md:justify-between dark:bg-gray-700 dark:border-gray-600">
      <div>
        <h1 className="text-xl font-bold">{t(title)}</h1>

        {description && (
          <p className="my-1 text-sm text-zinc-600 dark:text-gray-400">
            {t(description)}
          </p>
        )}
      </div>

      {tabs && (
        <div className="inline-flex my-3 rounded-lg bg-gray-100 border dark:bg-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleClick(tab)}
                className={`px-5 py-2 text-xs font-medium rounded-md transition flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "bg-blue-700 text-white shadow"
                    : "hover:text-gray-900"
                }`}
              >
                {Icon && <Icon size={20} />}
                {t(tab.label)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TitleTarget;
