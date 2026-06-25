import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid, CheckSquare, FileText, Calendar,
  Bell, Brain, GraduationCap, Users, ShieldCheck,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";

const studentNav = [
  { to: "/app",              label: "Dashboard",        icon: LayoutGrid   },
  { to: "/app/tasks",        label: "Tasks",            icon: CheckSquare  },
  { to: "/app/assignments",  label: "Assignments",      icon: FileText     },
  { to: "/app/exams",        label: "Exams",            icon: GraduationCap},
  { to: "/app/schedule",     label: "Schedule",         icon: Calendar     },
  { to: "/app/reminders",    label: "Reminders",        icon: Bell         },
  { to: "/app/recommendations", label: "AI recommendations", icon: Brain   },
];

const adminNav = [
  { to: "/admin",          label: "Dashboard", icon: LayoutGrid  },
  { to: "/admin/users",    label: "Users",     icon: Users       },
  { to: "/admin/security", label: "Security",  icon: ShieldCheck },
];

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
