import { useMemo, useState } from "react";
import { App as AntApp } from "antd";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, AuthProviderNoHeader, useAuth } from "./auth/AuthContext";

import CoursesPanelPro from "./panels/CoursesPanelPro";
import RegistrationsPanelPro from "./panels/RegistrationsPanelPro";
import StudentsPanelPro from "./panels/StudentsPanelPro";
import ResultsPanelPro from "./panels/ResultsPanelPro";

import LayoutShell from "./ui/LayoutShell";
import Login from "./pages/LoginPage";
import HomeDashboard from "./pages/HomeDashboard"; // NEW landing page

/* ---------------- Route Guards (Student only) ---------------- */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to={`/login`} replace state={{ from: loc.pathname }} />;
  return children;
}
function RequireRole({ roles = [], children }) {
  const { hasAny, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!hasAny(roles)) return <Navigate to={`/login`} replace state={{ from: loc.pathname }} />;
  return children;
}

/* ---------------- Admin App (Basic Auth) ---------------- */
function AdminApp() {
  const [active, setActive] = useState("courses");
  const visibleTabs = useMemo(
    () => ({ courses: true, registrations: true, students: true, results: true }),
    []
  );

  // Admin sign-out: ping backend to force a 401 and then hard redirect home
  async function adminBasicSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "GET", cache: "no-store" });
    } catch { /* ignore */ }
    window.location.replace("/"); // triggers fresh Basic-Auth next time /admin is opened
  }

  return (
    <AuthProviderNoHeader>
      <LayoutShell
        active={active}
        onChange={setActive}
        visibleTabs={visibleTabs}
        title="U-CMS • Admin"
        onSignOut={adminBasicSignOut}
      >
        {active === "courses" && <CoursesPanelPro />}
        {active === "registrations" && <RegistrationsPanelPro />}
        {active === "students" && <StudentsPanelPro />}
        {active === "results" && <ResultsPanelPro />}
      </LayoutShell>
    </AuthProviderNoHeader>
  );
}

/* ---------------- Student App (Results only) ---------------- */
function StudentApp() {
  const [active, setActive] = useState("results");
  const visibleTabs = useMemo(
    () => ({ courses: false, registrations: false, students: false, results: true }),
    []
  );

  return (
    <LayoutShell active={active} onChange={setActive} visibleTabs={visibleTabs} title="U-CMS • Student">
      <ResultsPanelPro />
    </LayoutShell>
  );
}

/* ---------------- Root App & Routes ---------------- */
export default function App() {
  return (
    <AntApp>
      <Routes>
        <Route path="/" element={<HomeDashboard />} />  {/* NEW: professional home */}

        {/* Student auth pages */}
        <Route
          path="/login"
          element={
            <AuthProvider>
              <Login />
            </AuthProvider>
          }
        />
        <Route
          path="/student"
          element={
            <AuthProvider>
              <RequireAuth>
                <RequireRole roles={["ROLE_STUDENT"]}>
                  <StudentApp />
                </RequireRole>
              </RequireAuth>
            </AuthProvider>
          }
        />

        {/* Admin panel (browser Basic Auth) */}
        <Route path="/admin" element={<AdminApp />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AntApp>
  );
}
