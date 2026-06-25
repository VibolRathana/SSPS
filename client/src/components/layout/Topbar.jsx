import React from "react";
import { Bell, Menu } from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

export default function Topbar({
  title,
  subtitle,
  user,
  onBell,
  hasNotifications = false,
  actions,
}) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 sm:px-8 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
          {subtitle && <p className="truncate mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
          <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-linear-to-b from-indigo-500 to-indigo-700 text-sm font-bold text-white">
            {user.initials}
          </div>
        )}
      </div>
    </header>
  );
}
