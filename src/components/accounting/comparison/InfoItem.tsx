type InfoItemProps = {
  label: string;
  value: React.ReactNode;
};

const InfoItem = ({ label, value }: InfoItemProps) => {
  return (
    <div className="p-2 rounded-xl bg-slate-50 dark:bg-gray-700">
      <p className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-300">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium break-words text-slate-900 dark:text-white">
        {value || "-"}
      </p>
    </div>
  );
};

export default InfoItem;