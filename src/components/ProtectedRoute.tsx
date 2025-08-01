import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

// Simulated login state (you can replace with real auth logic later)
const isAuthenticated = localStorage.getItem("isAdmin") === "true";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
