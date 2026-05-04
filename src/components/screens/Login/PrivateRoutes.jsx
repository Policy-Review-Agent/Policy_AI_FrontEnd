import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  const user = sessionStorage.getItem("access_token");
  const loginData = useSelector((s) => s.slicer.loginDetails);
  return user && loginData.data?.is_approved ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
