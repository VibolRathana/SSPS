import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export default function DataTable({
  columns           = [],
  data              = [],
  searchable        = true,
  searchPlaceholder = "Search…",
  action            = null,
  rowKey            = "id",
  emptyText         = "No records yet.",
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!query.trim()) return data;
    const term = query.toLowerCase();
    return data.filter(row =>
      columns.some(c => String(row[c.key] ?? "").toLowerCase().includes(term))
    );
  }, [query, data, columns]);

  // Columns to show in the card (exclude the actions column for separate rendering)
  const dataColumns   = columns.filter(c => c.key !== "actions");
  const actionsColumn = columns.find(c => c.key === "actions");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbar */}
      {(searchable || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 sm:px-5 py-3 sm:py-4">
          {searchable ? (
            <div className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map(c => (
                <th
                  key={c.key}
                  className={`bg-slate-50 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${c.headerClassName || ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-sm text-slate-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row[rowKey] ?? i} className="border-t border-slate-100 transition hover:bg-indigo-50/50">
                  {columns.map(c => (
                    <td key={c.key} className={`px-5 py-4 text-sm text-slate-700 ${c.className || ""}`}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-slate-100">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">{emptyText}</p>
        ) : (
          rows.map((row, i) => (
            <div key={row[rowKey] ?? i} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                {/* First data column as title */}
                <span className="font-semibold text-sm text-slate-900">
                  {dataColumns[0]?.render ? dataColumns[0].render(row) : row[dataColumns[0]?.key]}
                </span>
                {actionsColumn && (
                  <div className="shrink-0">{actionsColumn.render(row)}</div>
                )}
              </div>
              {/* Remaining columns as label: value pairs */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {dataColumns.slice(1).map(c => (
                  <div key={c.key} className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">{c.header}:</span>
                    <span className="text-slate-600">
                      {c.render ? c.render(row) : (row[c.key] || "—")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
