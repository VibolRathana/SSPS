
// eslint-disable-next-line no-unused-vars
import React from "react";

/**
 * Status / priority pill.
 * variant: high | medium | low | pending | progress | done | active | inactive | default
 */
const styles = {
  high: "bg-rose-50 text-rose-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  progress: "bg-sky-50 text-sky-600",
  done: "bg-emerald-50 text-emerald-600",
  active: "bg-emerald-50 text-emerald-600",
  inactive: "bg-slate-100 text-slate-500",
  default: "bg-indigo-50 text-indigo-600",
};

export default function Badge({ children, variant = "default", className = "" }) {
  const tone = styles[variant] || styles.default;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone} ${className}`}
    >
      {children}
    </span>
  );
}