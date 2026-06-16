import React from "react";
import { Bell } from "lucide-react";


export default function Topbar({
  title,
  subtitle,
  user,
  onBell,
  hasNotifications = false,
  actions,
}) {
  return (
    <header className="sticky top-0 z-40 flex h-18.5 items-center justify-between border-b border-slate-200 bg-white/85 px-8 backdrop-blur">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {onBell && (
          <button
            onClick={onBell}
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <Bell size={18} />
            {hasNotifications && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            )}
          </button>
        )}

        {user && (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-b from-indigo-500 to-indigo-700 text-sm font-bold text-white">
            {user.initials}
          </div>
        )}
      </div>
    </header>
  );
}