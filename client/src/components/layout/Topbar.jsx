
import { Bell, Menu } from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Topbar({
  title,
  subtitle,
  onBell,
  hasNotifications = false,
  actions,
}) {
  const { toggle } = useSidebar();
  const { user } = useAuth();
  
  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-8">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggle}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {actions}

        {onBell && (
          <button
            onClick={onBell}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
            aria-label="Notifications"
          >
            <Bell size={18} />

            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            )}
          </button>
        )}

        {/* Profile Avatar */}
        <Link
          to="/app/profile"
          className="group flex items-center gap-3 rounded-full transition"
          title="View Profile"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-sm font-bold text-white shadow-md transition duration-200 group-hover:scale-105 group-hover:shadow-lg">
            {initials}
          </div>

          {/* Hide on mobile */}
          <div className="hidden text-left lg:block">
            <p className="text-sm font-semibold text-slate-800">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs text-slate-500">
              View Profile
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
