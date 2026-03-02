/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// =============================
// TYPES
// =============================

type StatusValue = "ACTIVE" | "DELETED" | "INACTIVE" | "PENDING" | string;

type ColumnType = "text" | "status" | "statusEditable" | "action" | "actions";

interface BaseColumn<T> {
  key: keyof T | string;
  label: string;
  type: ColumnType;
}

interface ActionConfig<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
}

interface SingleActionColumn<T> extends BaseColumn<T> {
  type: "action";
  action: ActionConfig<T>;
}

interface MultiActionColumn<T> extends BaseColumn<T> {
  type: "actions";
  actions: ActionConfig<T>[];
}

interface StatusEditableColumn<T> extends BaseColumn<T> {
  type: "statusEditable";
  onChange: (row: T, newStatus: StatusValue) => void;
  allowedStatuses?: StatusValue[];
}

interface StatusColumn<T> extends BaseColumn<T> {
  type: "status";
}

interface TextColumn<T> extends BaseColumn<T> {
  type: "text";
  format?: (value: any, row: T) => React.ReactNode;
}

export type Column<T> =
  | SingleActionColumn<T>
  | MultiActionColumn<T>
  | StatusEditableColumn<T>
  | StatusColumn<T>
  | TextColumn<T>;

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

interface DataTableProps<T> {
  data: PaginatedResponse<T>;
  columns: Column<T>[];
  onPageChange: (page: number) => void;
  paginationText?: string;
}

// =============================
// STATUS UI
// =============================

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500 text-white",
  DELETED: "bg-red-500 text-white",
  INACTIVE: "bg-amber-400 text-black",
  PENDING: "bg-orange-100 text-orange-700",
};

function StatusBadge({
  value,
  label,
  showChevron = false,
}: {
  value: StatusValue;
  label: string;
  showChevron?: boolean;
}) {
  const color = statusColors[value] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${color}`}
    >
      {label}
      {showChevron && <ChevronDown size={20} />}
    </span>
  );
}

// =============================
// TABLE
// =============================

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onPageChange,
  paginationText,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  const [openStatusRowIndex, setOpenStatusRowIndex] = useState<number | null>(
    null,
  );

  const [selectedStatusRow, setSelectedStatusRow] = useState<{
    row: T;
    status: StatusValue;
  } | null>(null);

  return (
    <div className="w-full space-y-4">
      <div className="relative overflow-visible border rounded-2xl">
        <table className="w-full text-sm rounded-2xl">
          <thead className="bg-gray-200 rounded-2xl  dark:bg-gray-800">
            <tr className="rounded-2xl">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 font-semibold text-left"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.items.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr className="border-t">
                  {columns.map((col) => {
                    const value = row[col.key as keyof T];

                    // TEXT
                    if (col.type === "text") {
                      const textCol = col as TextColumn<T>;
                      return (
                        <td key={String(col.key)} className="px-4 py-3">
                          {textCol.format ? textCol.format(value, row) : value}
                        </td>
                      );
                    }

                    // STATUS SIMPLE
                    if (col.type === "status") {
                      return (
                        <td key={String(col.key)} className="px-3 py-3">
                          <StatusBadge
                            value={value}
                            label={
                              value ? t(`common.${value.toLowerCase()}`) : "-"
                            }
                          />
                        </td>
                      );
                    }

                    // STATUS EDITABLE (INLINE DROPDOWN)
                    if (col.type === "statusEditable") {
                      const statusCol = col as StatusEditableColumn<T>;

                      return (
                        <td
                          key={String(col.key)}
                          className="relative px-3 py-3"
                        >
                          <button
                            onClick={() =>
                              setOpenStatusRowIndex(
                                openStatusRowIndex === rowIndex
                                  ? null
                                  : rowIndex,
                              )
                            }
                          >
                            <StatusBadge
                              value={value}
                              label={
                                value ? t(`common.${value.toLowerCase()}`) : "-"
                              }
                              showChevron
                            />
                          </button>

                          {openStatusRowIndex === rowIndex && (
                            <div className="absolute z-50 w-40 p-2 mt-2 bg-white border shadow-lg rounded-xl">
                              {statusCol.allowedStatuses
                                ?.filter((status) => status !== value)
                                .map((status) => (
                                  <button
                                    key={status}
                                    className="block w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100"
                                    onClick={() => {
                                      statusCol.onChange(row, status);
                                      setSelectedStatusRow({ row, status });
                                      setOpenStatusRowIndex(null);
                                    }}
                                  >
                                    <StatusBadge
                                      value={status}
                                      label={t(
                                        `common.${status.toLowerCase()}`,
                                      )}
                                    />
                                  </button>
                                ))}
                            </div>
                          )}
                        </td>
                      );
                    }

                    // SINGLE ACTION
                    if (col.type === "action") {
                      const actionCol = col as SingleActionColumn<T>;
                      return (
                        <td key={String(col.key)} className="px-3 py-3">
                          <button
                            className={`flex items-center gap-2 px-3 py-1 border rounded-lg hover:bg-gray-50 ${actionCol.action.className ?? ""}`}
                            onClick={() => actionCol.action.onClick(row)}
                          >
                            {actionCol.action.icon}
                            {actionCol.action.label}
                          </button>
                        </td>
                      );
                    }

                    // MULTI ACTIONS
                    if (col.type === "actions") {
                      const actionsCol = col as MultiActionColumn<T>;
                      return (
                        <td
                          key={String(col.key)}
                          className="flex gap-2 px-3 py-3"
                        >
                          {actionsCol.actions.map((action, i) => (
                            <button
                              key={i}
                            className={`flex items-center gap-2 px-3 py-1 border rounded-lg ${action.className ?? ""}`}
                              onClick={() => action.onClick(row)}
                            >
                              {action.icon}
                              {action.label}
                            </button>
                          ))}
                        </td>
                      );
                    }

                    return <td key={String(col.key)} />;
                  })}
                </tr>

                {/* CUSTOM EXPANDABLE DIV */}
                {selectedStatusRow && selectedStatusRow.row === row && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-4 bg-blue-50"
                    >
                      {/*  AQUÍ DEFINES TU CONTENIDO */}
                      <div className="p-4 bg-white shadow-sm rounded-xl">
                        <h4 className="mb-2 font-semibold">
                          Acción para estado: {selectedStatusRow.status}
                        </h4>

                        <p className="text-sm text-gray-600">
                          Aquí puedes renderizar un formulario, confirmación,
                          motivo de cambio, componente dinámico, etc.
                        </p>

                        <button
                          className="px-4 py-2 mt-3 border rounded-lg hover:bg-gray-100"
                          onClick={() => setSelectedStatusRow(null)}
                        >
                          Cerrar
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center px-2">
        <div className="flex items-center gap-1">
          <button
            disabled={data.page === 1}
            onClick={() => onPageChange(data.page - 1)}
            className="px-3 py-1 flex border items-center rounded disabled:opacity-40"
          >
            <IoIosArrowBack/>
            {t("common.previous")}
          </button>

          {Array.from({ length: data.total_pages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`px-3 py-1 border rounded-xl ${
                  data.page === pageNumber
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}

          <button
            disabled={data.page === data.total_pages}
            onClick={() => onPageChange(data.page + 1)}
            className="px-3 py-1 border flex items-center rounded disabled:opacity-40"
          >
            {t("common.next")}
            <IoIosArrowForward/>
          </button>
        </div>

        <div className="ml-3 text-sm text-gray-600">
          {t("common.showing")}{" "}
          <strong>{(data.page - 1) * data.size + 1}</strong> -{" "}
          <strong>{Math.min(data.page * data.size, data.total)}</strong> de{" "}
          <strong>{data.total}</strong> {paginationText ?? ""}
        </div>
      </div>
    </div>
  );
}
