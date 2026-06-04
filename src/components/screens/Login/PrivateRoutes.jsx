// src/components/screens/Login/PrivateRoutes.jsx
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  const token = sessionStorage.getItem("access_token");
  const isApproved = sessionStorage.getItem("is_approved") === "true";
  return token && isApproved ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoutes;