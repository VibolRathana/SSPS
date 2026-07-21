<<<<<<< HEAD
// eslint-disable-next-line no-unused-vars
import React from "react";
=======
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid, CheckSquare, FileText, Calendar,
<<<<<<< HEAD
  Bell, Brain, GraduationCap, Users, ShieldCheck,Clock3,Target,BellRing, X,
=======
  Bell, Brain, GraduationCap, Users, BellRing, X,
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { usePushNotification } from "../../hooks/usePushNotification";

const studentNav = [
  { to: "/app",                 label: "Dashboard",           icon: LayoutGrid   },
  { to: "/app/tasks",           label: "Tasks",                icon: CheckSquare  },
  { to: "/app/assignments",     label: "Assignments",          icon: FileText     },
  { to: "/app/exams",           label: "Exams",                icon: GraduationCap},
  { to: "/app/study-availability", label:"Study Availability", icon: Clock3 },
  { to: "/app/reminders",       label: "Reminders",            icon: Bell         },
  { to: "/app/priorities"      ,label: "Priorities_Item" ,     icon:Target},
  { to: "/app/recommendations", label: "AI recommendations", icon: Brain   },
  { to: "/app/schedule",        label: "Schedule",             icon: Calendar     },
 
];

const adminNav = [
  { to: "/admin",       label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/users", label: "Users",     icon: Users      },
];

const BANNER_KEY = "push_banner_dismissed";

function PushBanner() {
  const { supported, subscribed, loading, subscribe } = usePushNotification();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (supported && !subscribed && !sessionStorage.getItem(BANNER_KEY)) {
      // Show after a short delay so the page has loaded first
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, [supported, subscribed]);

  function dismiss() {
    sessionStorage.setItem(BANNER_KEY, "1");
    setVisible(false);
  }

  async function handleEnable() {
    await subscribe();
    dismiss();
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-indigo-100 bg-white shadow-xl shadow-indigo-100/40 flex items-start gap-3 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 mt-0.5">
        <BellRing size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">Enable reminders</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Get browser pop-ups when a reminder is due — no need to have the app open.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Enabling…" : "Enable notifications"}
          </button>
          <button
            onClick={dismiss}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Not now
          </button>
        </div>
      </div>
      <button onClick={dismiss} className="text-slate-400 hover:text-slate-600 mt-0.5">
        <X size={16} />
      </button>
    </div>
  );
}

function Layout({ role }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { open, close } = useSidebar();
  const items = role === "admin" ? adminNav : studentNav;

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const currentUser = { name: user?.fullName || "User", email: user?.email || "", initials };

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={close}
        />
      )}

      <Sidebar
        items={items}
        user={currentUser}
        onLogout={handleLogout}
        label={role === "admin" ? "Administration" : "Workspace"}
        profileTo={role === "admin" ? "/admin/profile" : "/app/profile"}
      />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>

      <PushBanner />
    </div>
  );
}

export default function AppLayout({ role = "student" }) {
  return (
    <SidebarProvider>
      <Layout role={role} />
    </SidebarProvider>
  );
}