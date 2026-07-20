import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

const AppLayout = lazy(() => import("./components/layout/AppLayout"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const Tasks = lazy(() => import("./pages/client/Tasks"));
const Assignments = lazy(() => import("./pages/client/Assignments"));
const UserProfile = lazy(() => import("./pages/client/Profile"));
const Dashboard = lazy(() => import("./pages/client/Dashboard"));
const Schedule = lazy(() => import("./pages/client/Schedule"));
const Reminders = lazy(() => import("./pages/client/Reminder"));
const AIRecommendation = lazy(() => import("./pages/client/AIRecommendation"));
const Exams = lazy(() => import("./pages/client/Exam"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/User"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/app" replace />;
  return children;
}
// public

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading…</div>}>
          <Routes>
          {/* public */}

          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout role="student" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="recommendations" element={<AIRecommendation />} />
            <Route path="exams" element={<Exams />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Admin app (admins only) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="Admin">
                <AppLayout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/*  Default */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
