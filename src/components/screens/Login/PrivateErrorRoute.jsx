import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { getUserInfo } from "../../api/getUserInfo";
import { setLoginDetails } from "../../../store/slices/navigationSlice";

const PrivateErrorRoute = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = sessionStorage.getItem("access_token");

    const getUserDetails = useCallback(async (accessToken) => {
        try {
            const resp = await getUserInfo("/api/user-profile", accessToken);
            if (resp && resp?.data?.is_approved) {
                sessionStorage.setItem("client_id", resp.data?.client_id);
                sessionStorage.setItem("company_id", resp.data?.company_id);
                sessionStorage.setItem("company_name", resp.data?.company_name);
                sessionStorage.setItem("email", resp.data?.user_email);
                sessionStorage.setItem("is_approved", "true");           // ✅ was missing here
                dispatch(setLoginDetails(resp));                           // ✅ also persists to sessionStorage
                navigate("/home", { replace: true });

            } else {
                navigate("/Error", { replace: true });
            }
        } catch (e) {
            navigate("/Error");
            console.log("Error in user info api :: ", e);
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        const isApproved = sessionStorage.getItem("is_approved") === "true";
        if (token && isApproved) {
            navigate("/home", { replace: true });
        } else if (token) {
            getUserDetails(token);
        } else {
            navigate("/");
        }
    }, [token, getUserDetails, navigate]);

    return token ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateErrorRoute;