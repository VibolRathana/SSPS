import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Sidebar({ items = [], user, onLogout, label = "Workspace", profileTo = "/app/profile" }) {
  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col bg-linear-to-b from-indigo-500 to-indigo-700 px-4 py-6 text-white">
      <div className="mb-4 flex items-center gap-3 border-b border-white/15 px-2 pb-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-lg font-bold">P</div>
        <span className="text-lg font-bold tracking-tight">Planner</span>
      </div>

      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/55">{label}</p>

      <nav className="flex flex-col gap-1">
        {items.map(({ to, label: text, icon: Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              isActive ? "bg-white font-semibold text-indigo-700 shadow-sm"
                : "font-medium text-white/80 hover:bg-white/10 hover:text-white"}`}>
            {Icon && <Icon size={18} />}
            {text}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        {user && (
          <NavLink to={profileTo}
            className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 p-2.5 transition hover:bg-white/20">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white/25 text-sm font-bold">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>
          </NavLink>
        )}
        <button onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}