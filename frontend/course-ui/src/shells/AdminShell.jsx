import { Outlet, useLocation, useNavigate } from "react-router-dom";
import LayoutShell from "../ui/LayoutShell";

export default function AdminShell() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const active = pathname.split("/")[2] || "courses"; // /admin/<tab>

  return (
    <LayoutShell
      // show all tabs for admin
      tabs={[
        { key: "courses", label: "Courses", path: "/admin/courses" },
        { key: "registrations", label: "Registrations", path: "/admin/registrations" },
        { key: "students", label: "Students", path: "/admin/students" },
        { key: "results", label: "Results", path: "/admin/results" },
      ]}
      active={active}
      onChange={(key, path) => nav(path)}
    >
      <Outlet />
    </LayoutShell>
  );
}
