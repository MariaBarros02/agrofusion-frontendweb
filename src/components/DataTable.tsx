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
  align?: "left" | "center" | "right";
}

interface ActionConfig<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
  disabled?: (row: T) => boolean;
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
  maxVisiblePages?: number;  //Usado en Auditoria
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
  maxVisiblePages, //Usado en DataTable
}: DataTableProps<T>) {
  const maxPages = maxVisiblePages ?? data.total_pages;

  const startPage = Math.max(1, data.page - Math.floor(maxPages / 2));
  const endPage = Math.min(data.total_pages, startPage + maxPages - 1);
  
  const { t } = useTranslation();

  const [openStatusRowIndex, setOpenStatusRowIndex] = useState<number | null>(
    null,
  );

  return (
    <div className="w-full space-y-4">
      <div className="relative overflow-visible border rounded-2xl">
        <table className="w-full table-fixed text-sm rounded-2xl">
          <thead className="bg-gray-200 rounded-2xl dark:bg-gray-800">
            <tr className="rounded-2xl">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 font-semibold ${
                    col.align === "left"
                      ? "text-left"
                      : col.align === "right"
                        ? "text-right"
                        : "text-center"
                  }`}
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
                        <td
                          key={String(col.key)}
                          className={`px-4 py-3 ${
                            col.align === "left"
                              ? "text-left"
                              : col.align === "right"
                                ? "text-right"
                                : "text-center"
                          }`}
                        >
                          {textCol.format ? textCol.format(value, row) : value}
                        </td>
                      );
                    }

                    // STATUS SIMPLE
                    if (col.type === "status") {
                      return (
                        <td key={String(col.key)} className="px-3 py-3 text-center">
                          <span className="inline-flex justify-center">
                            <StatusBadge
                              value={value}
                              label={
                                value ? t(`common.${value.toLowerCase()}`) : "-"
                              }
                            />
                          </span>
                        </td>
                      );
                    }

                    // STATUS EDITABLE (INLINE DROPDOWN)
                    if (col.type === "statusEditable") {
                      const statusCol = col as StatusEditableColumn<T>;

                      return (
                        <td
                          key={String(col.key)}
                          className="relative px-3 py-3 text-center"
                        >
                          <span className="inline-flex justify-center">
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
                          </span>
                        </td>
                      );
                    }

                    // SINGLE ACTION
                    if (col.type === "action") {
                      const actionCol = col as SingleActionColumn<T>;
                      return (
                        <td key={String(col.key)} className="px-3 py-3 text-center">
                          <span className="inline-flex justify-center">
                          <button
                            className={`inline-flex items-center gap-2 px-3 py-1 border rounded-lg hover:bg-gray-50 ${actionCol.action.className ?? ""}`}
                            onClick={() => actionCol.action.onClick(row)}
                          >
                            {actionCol.action.icon}
                            {actionCol.action.label}
                          </button>
                          </span>
                        </td>
                      );
                    }

                    // MULTI ACTIONS
                    if (col.type === "actions") {
                      const actionsCol = col as MultiActionColumn<T>;
                      return (
                        <td
                          key={String(col.key)}
                          className="px-3 py-3 text-center"
                        >
                          <span className="inline-flex justify-center gap-2">
                          {actionsCol.actions.map((action, i) => {
                            const isDisabled = action.disabled?.(row);

                            return (
                              <button
                                key={i}
                                disabled={isDisabled}
                                className={`flex items-center gap-2 px-3 py-1 border rounded-lg
        ${action.className ?? ""}
        ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
                                onClick={() => {
                                  if (!isDisabled) action.onClick(row);
                                }}
                              >
                                {action.icon}
                                {action.label}
                              </button>
                            );
                          })}
                          </span>
                        </td>
                      );
                    }

                    return <td key={String((col as BaseColumn<T>).key)} className="text-center" />;
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-3 px-2 py-2 text-sm">
        <div className="flex items-center gap-1">
          <button
            disabled={data.page === 1}
            onClick={() => onPageChange(data.page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 border rounded disabled:opacity-40"
          >
            <IoIosArrowBack className="size-4" />
            {t("common.previous")}
          </button>
          

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`min-w-[2rem] px-3 py-1.5 border rounded ${
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
            className="flex items-center gap-1 px-3 py-1.5 border rounded disabled:opacity-40"
          >
            {t("common.next")}
            <IoIosArrowForward className="size-4" />
          </button>
        </div>

        <div className="ml-3 text-gray-600">
          {t("common.showing")}{" "}
          <strong>{(data.page - 1) * data.size + 1}</strong> -{" "}
          <strong>{Math.min(data.page * data.size, data.total)}</strong> de{" "}
          <strong>{data.total}</strong> {paginationText ?? ""}
        </div>
      </div>
    </div>
  );
}
