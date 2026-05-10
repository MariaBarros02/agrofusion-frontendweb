/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
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
  width?: string | number;
}

interface ActionConfig<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
  disabled?: (row: T) => boolean;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500 text-white",
  INACTIVE: "bg-amber-400 text-black",
  DELETED: "bg-red-500 text-white",

  PENDING: "bg-orange-400 text-white",
  PROCESSING: "bg-blue-500 text-white",
  PARTIAL: "bg-orange-400 text-white",
  SENT: "bg-green-500 text-white",
  FAILED: "bg-red-500 text-white",
  CANCELLED: "bg-gray-500 text-white",
};

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
  /** Si devuelve true, el estado se muestra solo lectura (sin menú de cambio). */
  statusChangeDisabled?: (row: T) => boolean;
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
  maxVisiblePages?: number; //Usado en Auditoria
}

// =============================
// STATUS UI
// =============================

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
      className={`inline-flex min-w-[92px] justify-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}
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

  const halfPages = Math.floor(maxPages / 2);
  let startPage = Math.max(1, data.page - halfPages);
  const endPage = Math.min(data.total_pages, startPage + maxPages - 1);
  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }
  const { t } = useTranslation();

  const [openStatusRowIndex, setOpenStatusRowIndex] = useState<number | null>(
    null,
  );
  const statusPopoverRef = useRef<HTMLTableCellElement | null>(null);

  useEffect(() => {
    if (openStatusRowIndex === null) return;

    const closeIfOutside = (event: PointerEvent) => {
      const el = statusPopoverRef.current;
      if (!el) return;
      const target = event.target;
      if (target instanceof Node && !el.contains(target)) {
        setOpenStatusRowIndex(null);
      }
    };

    document.addEventListener("pointerdown", closeIfOutside, true);
    return () =>
      document.removeEventListener("pointerdown", closeIfOutside, true);
  }, [openStatusRowIndex]);

  return (
    <div className="w-full space-y-4">
      <div className="relative overflow-visible border rounded-2xl">
        <table className="w-full text-sm table-fixed rounded-2xl">
          <thead className="bg-gray-200 rounded-2xl dark:bg-gray-800">
            <tr className="rounded-2xl">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
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
                          style={{ width: col.width }}
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
                        <td
                          key={String(col.key)}
                          className="px-3 py-3 text-center"
                        >
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
                      const statusLocked =
                        statusCol.statusChangeDisabled?.(row) ?? false;

                      return (
                        <td
                          key={String(col.key)}
                          ref={
                            !statusLocked && openStatusRowIndex === rowIndex
                              ? statusPopoverRef
                              : undefined
                          }
                          className="relative px-3 py-3 text-center"
                        >
                          <span className="inline-flex justify-center">
                            {statusLocked ? (
                              <StatusBadge
                                value={value}
                                label={
                                  value
                                    ? t(`common.${value.toLowerCase()}`)
                                    : "-"
                                }
                              />
                            ) : (
                              <>
                                <button
                                  type="button"
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
                                      value
                                        ? t(`common.${value.toLowerCase()}`)
                                        : "-"
                                    }
                                    showChevron
                                  />
                                </button>
                                {openStatusRowIndex === rowIndex && (
                                  <div className="absolute z-50 w-40 p-2 mt-2 bg-white border shadow-lg rounded-xl">
                                    {statusCol.allowedStatuses
                                      ?.filter((s) => s !== value)
                                      .map((s) => (
                                        <button
                                          type="button"
                                          key={s}
                                          className="block w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100"
                                          onClick={() => {
                                            statusCol.onChange(row, s);
                                            setOpenStatusRowIndex(null);
                                          }}
                                        >
                                          <StatusBadge
                                            value={s}
                                            label={t(
                                              `common.${s.toLowerCase()}`,
                                            )}
                                          />
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </>
                            )}
                          </span>
                        </td>
                      );
                    }

                    // SINGLE ACTION
                    if (col.type === "action") {
                      const actionCol = col as SingleActionColumn<T>;
                      return (
                        <td
                          key={String(col.key)}
                          className="px-3 py-3 text-center"
                        >
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
                          <span className="inline-flex justify-center gap-2 whitespace-nowrap">
                          {actionsCol.actions.map((action, i) => {
                            const isDisabled = action.disabled?.(row);

                            return (
                              <button
                                key={i}
                                disabled={isDisabled}
                                className={`inline-flex items-center gap-2 px-3 py-1 border rounded-lg whitespace-nowrap
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

                    return (
                      <td
                        key={String((col as BaseColumn<T>).key)}
                        className="text-center"
                      />
                    );
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

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i,
          ).map((pageNumber) => (
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
          ))}

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
          <strong>{Math.min(data.page * data.size, data.total)}</strong>{" "}
          {t("common.of")} <strong>{data.total}</strong> {paginationText ?? ""}
        </div>
      </div>
    </div>
  );
}
