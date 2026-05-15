import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { loginRequest, msalInstance } from "../../msalConfig/msalConfig";
import { setLoginDetails } from "../../../store/slices/navigationSlice";
import { getUserInfo } from "../../api/getUserInfo";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = useCallback(async () => {
        try {
            await msalInstance.initialize();
            await msalInstance.loginRedirect(loginRequest);
        } catch (error) {
            console.error("❌ Error during login redirect:", error);
        }
    }, []);

    const getUserDetails = useCallback(async (token) => {
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
            } else {
                navigate("/Error", { replace: true });
            }
        } catch (e) {
            navigate("/Error");
            console.log("Error in user info api :: ", e);
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        const token = sessionStorage.getItem("access_token");
        if (token) {
            getUserDetails(token);
        } else {
            handleLogin();
        }
    }, [getUserDetails, handleLogin]);

    return <div></div>;
};

export default Login;