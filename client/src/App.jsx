import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";

// Auth pages (built)
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Student pages — import the real ones as you build them
import Tasks from "./pages/client/Tasks";
import Assignments from "./pages/client/Assignments";
import UserProfile from "./pages/client/Profile";
import Dashboard from "./pages/client/Dashboard";
import Schedule from "./pages/client/Schedule";
import StudyAvailability from "./pages/client/studyAvailability";
import Reminders from "./pages/client/Reminder";
import AIRecommendation from "./pages/client/AIRecommendation";
import Exams from "./pages/client/Exam";
import Priorities from "./pages/client/priorities";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/User";
import Security from "./pages/admin/Security";

// Auth guard — also blocks students from admin pages
function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ---------- Public ---------- */}
          <Route path="/" element={<Landing />} />
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
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="study-availability" element={<StudyAvailability/>}/>
            <Route path="reminders" element={<Reminders />} />
            <Route path="recommendations" element={<AIRecommendation />} />
            <Route path="exams" element={<Exams />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="priorities" element={<Priorities/>} />
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
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="security" element={<Security />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* ---------- Default ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}