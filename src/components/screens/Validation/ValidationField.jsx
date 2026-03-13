import React from "react";
import { useDispatch } from "react-redux";
import { approveField, rejectField } from "../../../store/slices/validationSlice";
import { Check, X } from "lucide-react";

const ValidationField = ({ field, idx }) => {
  const dispatch = useDispatch();

  const confColor =
    field.conf >= 80 ? "text-green-500" :
    field.conf >= 60 ? "text-amber-500" :
    "text-red-500";

  const borderCls =
    field.st === "approved" ? "border-green-300 bg-green-50/40" :
    field.st === "rejected" ? "border-red-300 bg-red-50/40"    :
    "border-gray-200";

  return (
    <div className={`border rounded-xl p-3.5 transition-colors ${borderCls}`}>
      {/* Label + confidence */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {field.label}
        </span>
        <span className={`text-[11px] font-bold font-mono ${confColor}`}>
          {field.conf}%
        </span>
      </div>

      {/* Extracted value */}
      <div className="text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md font-mono mb-2.5">
        {field.val}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => dispatch(approveField(idx))}
          className={`flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-md transition ${
            field.st === "approved"
              ? "bg-green-100 text-green-600"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >
          <Check size={10} />
          {field.st === "approved" ? "Approved" : "Approve"}
        </button>
        <button
          onClick={() => dispatch(rejectField(idx))}
          className={`flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-md transition ${
            field.st === "rejected"
              ? "bg-red-100 text-red-500"
              : "bg-red-50 text-red-500 hover:bg-red-100"
          }`}
        >
          <X size={10} />
          {field.st === "rejected" ? "Rejected" : "Reject"}
        </button>
      </div>
    </div>
  );
};

export default ValidationField;