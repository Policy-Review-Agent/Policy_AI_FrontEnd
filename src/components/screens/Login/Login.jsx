import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../../store/slices/authSlice";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  // Clear existing errors when mounting
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(login({ email, password }));
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl border border-gray-100 py-6 px-8 z-10 relative">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-color rounded-xl flex items-center justify-center mb-3 text-primary">
            <Shield size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-[13px] text-gray-500 mt-1">Sign in to Agentic Policy Reviewer</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 mt-4 bg-btn hover:bg-btn text-black font-semibold rounded-lg shadow-sm shadow-primary/30 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign In <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center">
          <p className="text-xs text-gray-400">Secure Access Portal</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
