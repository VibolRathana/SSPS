// eslint-disable-next-line no-unused-vars
import React from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700",
  secondary: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  ghost: "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}