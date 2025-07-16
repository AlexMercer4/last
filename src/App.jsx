import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "./components/layout/Header";
import "./App.css";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import StudentDashboard from "@/pages/StudentDashboard";
import CounselorDashboard from "@/pages/CounselorDashboard";
import ChairpersonDashboard from "@/pages/ChairpersonDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AppointmentsPage from "@/pages/AppointmentsPage";
import MessagesPage from "@/pages/MessagesPage";
import ProfilePage from "@/pages/ProfilePage";
import StudentsPage from "@/pages/StudentsPage";
import StudentProfilePage from "@/pages/StudentProfilePage";
import StudentNotesPage from "@/pages/StudentNotesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import NotificationsPage from "@/pages/NotificationsPage";

// Role-based route components
const RoleBasedRoute = ({ roles, children }) => {
  const { user } = useAuth();
  return roles.includes(user?.role) ? children : null;
};

function App() {
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              userRole === "student" ? (
                <StudentDashboard />
              ) : userRole === "chairperson" ? (
                <ChairpersonDashboard />
              ) : userRole === "admin" ? (
                <AdminDashboard />
              ) : (
                <CounselorDashboard />
              )
            }
          />

          <Route
            path="/appointments"
            element={
              <RoleBasedRoute roles={["student", "counselor"]}>
                <AppointmentsPage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <RoleBasedRoute roles={["student", "counselor"]}>
                <MessagesPage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <RoleBasedRoute roles={["chairperson", "counselor"]}>
                <StudentsPage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/students/:studentId"
            element={
              <RoleBasedRoute roles={["chairperson", "counselor"]}>
                <StudentProfilePage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/students/:studentId/notes"
            element={
              <RoleBasedRoute roles={["chairperson", "counselor"]}>
                <StudentNotesPage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <RoleBasedRoute roles={["chairperson", "counselor", "admin"]}>
                <AnalyticsPage />
              </RoleBasedRoute>
            }
          />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />

          <Route path="/notifications" element={<NotificationsPage />} />

          <Route
            path="/user-management"
            element={
              <RoleBasedRoute roles={["chairperson", "admin"]}>
                <UserManagementPage />
              </RoleBasedRoute>
            }
          />
        </Route>

        {/* Catch-all route */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <ProtectedRoute>
                {userRole === "student" && <StudentDashboard />}
                {userRole === "counselor" && <CounselorDashboard />}
                {userRole === "chairperson" && <ChairpersonDashboard />}
                {userRole === "admin" && <AdminDashboard />}
              </ProtectedRoute>
            ) : (
              <LandingPage />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
