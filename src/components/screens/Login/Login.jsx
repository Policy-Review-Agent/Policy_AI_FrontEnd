// src/components/screens/Login/Login.jsx
import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { loginRequest, msalInstance, msalInitPromise } from "../../msalConfig/msalConfig";
import { setLoginDetails } from "../../../store/slices/navigationSlice";
import { getUserInfo } from "../../api/getUserInfo";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = useCallback(async () => {
        try {
            await msalInitPromise;
            const redirect = await msalInstance.handleRedirectPromise();
            if (redirect) return;

            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) return;

            await msalInstance.loginRedirect(loginRequest);
        } catch (error) {
            if (error?.errorCode === "interaction_in_progress") return;
            console.error("❌ Error during login redirect:", error);
        }
    }, []);

  const getUserDetails = useCallback(async (token) => {
    try {
        const resp = await getUserInfo("/api/user-profile", token);
        if (resp && resp?.data?.is_approved) {
            sessionStorage.setItem("client_id",    resp.data?.client_id);
            sessionStorage.setItem("company_id",   resp.data?.company_id);
            sessionStorage.setItem("company_name", resp.data?.company_name);
            sessionStorage.setItem("email",        resp.data?.user_email);
            sessionStorage.setItem("display_name", resp.data?.display_name);
            sessionStorage.setItem("is_approved",  "true");
            dispatch(setLoginDetails(resp));        // ✅ dispatch before navigate
            navigate("/home", { replace: true });   // ✅ navigate last
        } else {
            navigate("/Error", { replace: true });
        }
    } catch (e) {
        navigate("/Error", { replace: true });
        console.error("Error in user info api:", e);
    }
}, [dispatch, navigate]);

    useEffect(() => {
        const token = sessionStorage.getItem("access_token");
        const isApproved = sessionStorage.getItem("is_approved") === "true";

        if (token && isApproved) {
            navigate("/home", { replace: true }); // ✅ replace so back button skips /
        } else if (token) {
            getUserDetails(token);
        } else {
            handleLogin();
        }
    }, [getUserDetails, handleLogin, navigate]);

    return <div />;
};

export default Login;