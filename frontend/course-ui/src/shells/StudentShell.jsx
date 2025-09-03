import { Outlet, useNavigate } from "react-router-dom";
import LayoutShell from "../ui/LayoutShell";

export default function StudentShell() {
  const nav = useNavigate();
  return (
    <LayoutShell
      // only Results tab for students
      tabs={[{ key: "results", label: "Results", path: "/student" }]}
      active="results"
      onChange={() => nav("/student")}
    >
      <Outlet />
    </LayoutShell>
  );
}
