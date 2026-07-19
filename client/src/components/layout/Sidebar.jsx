import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

export default function Sidebar({ items = [], user, onLogout, label = "Workspace", profileTo = "/app/profile" }) {
  const { open, close } = useSidebar();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col
      bg-linear-to-b  from-red-700 to-indigo-500 px-4 py-6 text-white
      transition-transform duration-300 ease-in-out
      md:sticky md:top-0 md:h-screen md:translate-x-0 md:w-60
      ${open ? "translate-x-0" : "-translate-x-full"}
    `}>
      {/* Logo row */}
      <div className="mb-4 flex items-center gap-3 border-b border-white/15 px-2 pb-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-lg font-bold">P</div>
        <span className="flex-1 text-lg font-bold tracking-tight">Planner</span>
        {/* Close button — mobile only */}
        <button
          onClick={close}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white md:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/55">{label}</p>

      <nav className="flex flex-col gap-1">
        {items.map(({ to, label: text, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-white font-semibold text-indigo-700 shadow-sm"
                  : "font-medium text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {Icon && <Icon size={18} />}
            {text}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        {user && (
          <NavLink
            to={profileTo}
            onClick={close}
            className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 p-2.5 transition hover:bg-white/20"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/25 text-sm font-bold">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>
          </NavLink>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
