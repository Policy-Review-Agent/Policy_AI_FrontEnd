// src/components/msalConfig/RedirectHandler.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { msalInstance, msalInitPromise } from "./msalConfig";

export default function RedirectHandler() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                await msalInitPromise; // ✅ await shared promise, not initialize() again
                const response = await msalInstance.handleRedirectPromise();

                if (response?.accessToken) {
                    sessionStorage.setItem("access_token", response.accessToken);
                }
            } catch (error) {
                console.error("❌ Error during redirect handling:", error);
            } finally {
                setLoading(false);
                navigate("/", { replace: true }); // ✅ always go back to Login to finish flow
            }
        };

        handleRedirect();
    }, [navigate]);

    return loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <img
                src="/assets/images/Policy AI Check Mark.gif"
                alt="Loading..."
                style={{ width: 300, height: 300 }}
            />
        </div>
    ) : null;
}