interface Props {
  message: string;
  type?: "error" | "success" | "warning";
}

export default function AlertInline({ message, type = "error" }: Props) {
  const styles = {
    error: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
  };

  return (
    <div className={`border rounded-lg px-4 py-3 text-center font-bold ${styles[type]}`}>
      {message}
    </div>
  );
}