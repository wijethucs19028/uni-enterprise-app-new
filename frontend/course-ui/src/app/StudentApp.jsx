// src/app/StudentApp.jsx
import { App as AntApp } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import StudentLoginPage from "../pages/StudentLoginPage";
import ResultsPanelPro from "../panels/ResultsPanelPro";

/**
 * Routes:
 * /student/login  -> student login form
 * /student        -> results page (requires login in your UI logic)
 */
export default function StudentApp() {
  return (
    <AntApp>
      <AuthProvider>
        <Routes>
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/student" element={<ResultsPanelPro />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </AuthProvider>
    </AntApp>
  );
}
