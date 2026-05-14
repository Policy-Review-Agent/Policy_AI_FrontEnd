import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { getUserInfo } from "../../api/getUserInfo";
import { setLoginDetails } from "../../../store/slices/navigationSlice";

const PrivateErrorRoute = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = sessionStorage.getItem("access_token");
  const getUserDetails = async (token) => {
    try {
      const resp = await getUserInfo("/api/user-profile", token);
      if (resp && resp?.data?.is_approved) {
        dispatch(setLoginDetails(resp));
        sessionStorage.setItem("client_id", resp.data?.client_id);
        sessionStorage.setItem("company_id", resp.data?.company_id);
        sessionStorage.setItem("company_name", resp.data?.company_name);
        sessionStorage.setItem("email", resp.data?.user_email);
        navigate("/home", { replace: true });
      } else {
        navigate("/Error", { replace: true });
      }
    } catch (e) {
      navigate("/Error");
      console.log("Erro in user info api :: ", e);
    }
  };

  useEffect(() => {
    token ? getUserDetails(token) : navigate("/");
  }, []);
  return token ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateErrorRoute;
