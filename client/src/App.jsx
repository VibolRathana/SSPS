import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";

// Auth pages (built)
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Student pages — import the real ones as you build them
import Tasks from "./pages/client/Tasks";
import UserProfile from "./pages/client/Profile";
// import Dashboard from "./pages/client/Dashboard";
// import Assignments from "./pages/client/Assignments";
// import Schedule from "./pages/client/Schedule";
// import Reminders from "./pages/client/Reminders";
// import AIRecommendations from "./pages/client/AIRecommendations";
// import Exams from "./pages/client/Exams";

// Admin pages — import the real ones as you build them
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import Users from "./pages/admin/Users";
// import Security from "./pages/admin/Security";

// Temporary stand-in for any page you haven't built yet
function Placeholder({ title }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">This page is coming soon.</p>
    </div>
  );
}

// Auth guard — also blocks students from admin pages
function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ---------- Public ---------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ---------- Student app ---------- */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout role="student" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Placeholder title="Dashboard" />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="assignments" element={<Placeholder title="Assignments" />} />
            <Route path="schedule" element={<Placeholder title="Schedule" />} />
            <Route path="reminders" element={<Placeholder title="Reminders" />} />
            <Route path="recommendations" element={<Placeholder title="AI recommendations" />} />
            <Route path="exams" element={<Placeholder title="Exams" />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* ---------- Admin app (admins only) ---------- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="Admin">
                <AppLayout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Placeholder title="Admin dashboard" />} />
            <Route path="users" element={<Placeholder title="Users" />} />
            <Route path="security" element={<Placeholder title="Security" />} />
          </Route>

          {/* ---------- Default ---------- */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}