// RedirectHandler.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUserInfo } from "../api/getUserInfo";
import { msalConfig, msalInstance } from "./msalConfig";
import { setLoginDetails } from "../../store/slices/navigationSlice";

export default function RedirectHandler() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getUserDetails = async (token) => {
    try {
      const resp = await getUserInfo("/api/user-profile", token);
      if (resp && resp?.data?.is_approved) {
        dispatch(setLoginDetails(resp));
        sessionStorage.setItem("client_id", resp.data?.client_id);
        sessionStorage.setItem("company_id", resp.data?.company_id);
        sessionStorage.setItem("company_name", resp.data?.company_name);
        sessionStorage.setItem("email", resp.data?.user_email);
        sessionStorage.setItem("display_name", resp.data?.display_name);
        navigate("/home", { replace: true });
        setLoading(false);
      } else {
        navigate("/Error", { replace: true });
      }
    } catch (e) {
      navigate("/Error", { replace: true });
    }
  };

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();
       

        if (response && response?.accessToken) {
          sessionStorage.setItem("access_token", response.accessToken);
          getUserDetails(response.accessToken);
          return;
        }
      } catch (error) {
        console.error("❌ Error during redirect handling:", error);
        setLoading(false);
      }
    };

    handleRedirect();
  }, [navigate]);

  return loading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <img
        src="/assets/images/Spinner.gif"
        alt="Loading..."
        style={{ width: 300, height: 300 }}
      />
    </div>
  ) : null;
}
