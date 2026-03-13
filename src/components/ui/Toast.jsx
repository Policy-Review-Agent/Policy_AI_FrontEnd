import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../../store/slices/toastSlice";
import { CheckCircle, XCircle, X } from "lucide-react";

const Toast = () => {
  const dispatch = useDispatch();
  const { visible, title, msg, ok } = useSelector((s) => s.toast);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => dispatch(hideToast()), 3200);
    return () => clearTimeout(t);
  }, [visible, dispatch]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white border rounded-xl px-4 py-3 shadow-xl min-w-[260px] max-w-sm transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      } ${ok ? "border-green-200" : "border-red-200"}`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          ok ? "bg-green-50" : "bg-red-50"
        }`}
      >
        {ok
          ? <CheckCircle size={14} className="text-green-500" />
          : <XCircle    size={14} className="text-red-500"   />}
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold text-gray-800">{title}</p>
        {msg && <p className="text-xs text-gray-500 mt-0.5">{msg}</p>}
      </div>

      <button
        onClick={() => dispatch(hideToast())}
        className="text-gray-300 hover:text-gray-500 leading-none mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;