import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { login, clearError } from "../../../store/slices/authSlice";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";
import { loginRequest, msalInstance } from "../../msalConfig/msalConfig";
import { setLoginDetails } from "../../../store/slices/navigationSlice";

const Login = () => {
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

        // setTimeout(() => {
        //   console.log("After navigating to home");
        //   console.log("Current path:", window.location.pathname);
        //   console.log("History length:", window.history.length);
        // }, 100);
      } else {
        navigate("/Error", { replace: true });
      }
    } catch (e) {
      navigate("/Error");
      console.log("Erro in user info api :: ", e);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("access_token")
    if (token) {
      getUserDetails(sessionStorage.getItem("access_token"));
    } else {
      handleLogin();
    }
  }, []);

  const handleLogin = async () => {
    try {
      await msalInstance.initialize();
      await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("❌ Error during login redirect:", error);
    }
  };

  return (
    <div></div>
    // <div className="min-h-screen bg-bg flex items-center justify-center p-4">
    //   {/* Background decoration */}
    //   <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    //     <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
    //     <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl"></div>
    //   </div>

    //   <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl border border-gray-100 py-6 px-8 z-10 relative">
    //     <div className="flex flex-col items-center mb-6">
    //       <div className="w-10 h-10 bg-color rounded-xl flex items-center justify-center mb-3 text-primary">
    //         <Shield size={20} />
    //       </div>
    //       <h1 className="text-xl font-bold text-gray-800">Welcome Back</h1>
    //       <p className="text-[13px] text-gray-500 mt-1">Sign in to Agentic Policy Reviewer</p>
    //     </div>

    //     {error && (
    //       <div className="mb-4 p-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium text-center">
    //         {error}
    //       </div>
    //     )}

    //     <form onSubmit={handleSubmit} className="space-y-4">
    //       <div>
    //         <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
    //           Email Address
    //         </label>
    //         <div className="relative">
    //           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    //             <Mail size={16} className="text-gray-400" />
    //           </div>
    //           <input
    //             type="email"
    //             value={email}
    //             onChange={(e) => setEmail(e.target.value)}
    //             autoComplete="email"
    //             className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
    //             placeholder="you@example.com"
    //             required
    //           />
    //         </div>
    //       </div>

    //       <div>
    //         <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
    //           Password
    //         </label>
    //         <div className="relative">
    //           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    //             <Lock size={16} className="text-gray-400" />
    //           </div>
    //           <input
    //             type="password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             autoComplete="current-password"
    //             className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
    //             placeholder="••••••••"
    //             required
    //           />
    //         </div>
    //       </div>

    //       <button
    //         type="submit"
    //         className="w-full flex items-center justify-center gap-2 py-2 px-4 mt-4 bg-btn hover:bg-btn text-black font-semibold rounded-lg shadow-sm shadow-primary/30 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    //       >
    //         Sign In <ArrowRight size={16} />
    //       </button>
    //     </form>

    //     <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center">
    //       <p className="text-xs text-gray-400">Secure Access Portal</p>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Login;
