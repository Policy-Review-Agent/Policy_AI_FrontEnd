import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  const user = sessionStorage.getItem("access_token");
  const {loginDetails} = useSelector((s) => s.navigation);
  return user && loginDetails.data?.is_approved ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
