import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  CheckSquare,
  FileText,
  Calendar,
  Bell,
  Brain,
  GraduationCap,
  Users,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const studentNav = [
  { to: "/app", label: "Dashboard", icon: LayoutGrid },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/assignments", label: "Assignments", icon: FileText },
  { to: "/app/schedule", label: "Schedule", icon: Calendar },
  { to: "/app/reminders", label: "Reminders", icon: Bell },
  { to: "/app/recommendations", label: "AI recommendations", icon: Brain },
  { to: "/app/exams", label: "Exams", icon: GraduationCap },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/security", label: "Security", icon: ShieldCheck },
];

export default function AppLayout({ role = "student" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const items = role === "admin" ? adminNav : studentNav;

  const handleLogout = () => {
    logout();              // clears token + user from AuthContext
    navigate("/login");
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const currentUser = {
    name: user?.fullName || "User",
    email: user?.email || "",
    initials,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        items={items}
        user={currentUser}
        onLogout={handleLogout}
        label={role === "admin" ? "Administration" : "Workspace"}
      />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}