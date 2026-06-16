import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

/**
 * Reusable table used by Tasks, Assignments, Exams and admin Users.
 *
 * columns: [{ key, header, render?(row), className?, headerClassName? }]
 *   - render lets you return JSX (e.g. a <Badge/>) for that cell
 * data:    array of row objects
 * action:  optional node shown top-right (e.g. a "New task" <Button/>)
 * rowKey:  unique field on each row (default "id")
 */
export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = "Search…",
  action = null,
  rowKey = "id",
  emptyText = "No records yet.",
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!query.trim()) return data;
    const term = query.toLowerCase();
    return data.filter((row) =>
      columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(term))
    );
  }, [query, data, columns]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {(searchable || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          {searchable ? (
            <div className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((c) => (
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
                <tr
                  key={row[rowKey] ?? i}
                  className="border-t border-slate-100 transition hover:bg-indigo-50/50"
                >
                  {columns.map((c) => (
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
    </div>
  );
}