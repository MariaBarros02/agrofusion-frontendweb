export const  getDiffClasses = (type: string) => {
  switch (type) {
    case "deleted":
      return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30";

    case "modified":
      return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30";

    case "created":
      return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30";

    default:
      return "border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800";
  }
};

export const getDiffBadge = (type: string) => {
  switch (type) {
    case "deleted":
      return {
        label: "Eliminado",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
      };

    case "modified":
      return {
        label: "Modificado",
        className:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
      };

    case "created":
      return {
        label: "Nuevo",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
      };

    default:
      return {
        label: "Sin cambios",
        className:
          "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
      };
  }
};

export const formatCurrency = (
  amount?: number,
  currency: string = "COP",
) => {
  if (amount === null || amount === undefined) return "-";

  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const getStatusBadgeClasses = (status?: string) => {
  switch (status?.toUpperCase()) {
    case "PAID":
    case "COMPLETED":
    case "SUCCESS":
      return `
        bg-green-100
        text-green-700
        dark:bg-green-900/40
        dark:text-green-300
      `;

    case "PENDING":
    case "PROCESSING":
      return `
        bg-yellow-100
        text-yellow-700
        dark:bg-yellow-900/40
        dark:text-yellow-300
      `;

    case "FAILED":
    case "REJECTED":
    case "CANCELLED":
      return `
        bg-red-100
        text-red-700
        dark:bg-red-900/40
        dark:text-red-300
      `;

    default:
      return `
        bg-slate-100
        text-slate-700
        dark:bg-slate-700
        dark:text-slate-200
      `;
  }
};

export const getTranslatedStatus = (status?: string) => {
  switch (status?.toUpperCase()) {
    case "PAID":
      return "Pagado";

    case "COMPLETED":
      return "Completado";

    case "SUCCESS":
      return "Exitoso";

    case "PENDING":
      return "Pendiente";

    case "PROCESSING":
      return "Procesando";

    case "FAILED":
      return "Fallido";

    case "REJECTED":
      return "Rechazado";

    case "CANCELLED":
      return "Cancelado";

    case "DRAFT":
      return "Borrador";

    default:
      return status || "-";
  }
};

export const formatDate = (date?: string | Date) => {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  } catch {
    return "-";
  }
};

export const formatDateTime = (date?: string | Date) => {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "-";
  }
};