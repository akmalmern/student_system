import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function AdminRoute({ children }) {
  const { accessToken, me } = useAppSelector((s) => s.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (!me) return <Navigate to="/profile" replace />;
  if (me.role !== "ADMIN") return <Navigate to="/profile" replace />;
  return children;
}
