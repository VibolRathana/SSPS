// eslint-disable-next-line no-unused-vars
import React from "react";

const tints = {
  indigo: "bg-indigo-50 text-indigo-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

/**
 * icon:  a lucide-react icon component, e.g. CheckSquare
 * value: the big number, e.g. 10
 * label: caption under the value
 * hint:  optional small note, e.g. "+2 this week"
 * tint:  indigo | amber | rose | sky | emerald
 */
export default function StatCard({ icon: Icon, value, label, hint, tint = "indigo" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {Icon && (
        <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tints[tint]}`}>
          <Icon size={20} />
        </div>
      )}
      <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
      {hint && <p className="mt-2 text-xs font-semibold text-emerald-600">{hint}</p>}
    </div>
  );
}