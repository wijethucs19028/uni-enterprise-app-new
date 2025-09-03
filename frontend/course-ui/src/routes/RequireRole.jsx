import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RequireRole({ need }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (role !== need) return <Navigate to="/" replace />;
  return <Outlet />;
}
