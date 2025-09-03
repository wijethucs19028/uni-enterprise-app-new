// src/app/AdminApp.jsx
import { useState } from "react";
import { App as AntApp } from "antd";
import LayoutShell from "../ui/LayoutShell";
import { AuthProviderNoHeader } from "../auth/AuthContext";

// Panels
import CoursesPanelPro from "../panels/CoursesPanelPro";
import RegistrationsPanelPro from "../panels/RegistrationsPanelPro";
import StudentsPanelPro from "../panels/StudentsPanelPro";
import ResultsPanelPro from "../panels/ResultsPanelPro";

export default function AdminApp() {
  const [active, setActive] = useState("courses");

  return (
    <AntApp>
      <AuthProviderNoHeader>
        <LayoutShell active={active} onChange={setActive}>
          {active === "courses" && <CoursesPanelPro />}
          {active === "registrations" && <RegistrationsPanelPro />}
          {active === "students" && <StudentsPanelPro />}
          {active === "results" && <ResultsPanelPro />}
        </LayoutShell>
      </AuthProviderNoHeader>
    </AntApp>
  );
}
