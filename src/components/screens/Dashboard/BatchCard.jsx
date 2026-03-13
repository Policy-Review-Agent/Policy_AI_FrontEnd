import React from "react";
import { useDispatch } from "react-redux";
import { selectBatch } from "../../../store/slices/batchSlice";
import { navigate } from "../../../store/slices/navigationSlice";
import { ArrowRight, ChevronRight } from "lucide-react";

const STATUS_MAP = {
  Completed:         "bg-green-50 text-green-600",
  "In Progress":     "bg-blue-50 text-blue-600",
  "Needs Attention": "bg-red-50 text-red-600",
};

const BatchCard = ({ batch }) => {
  const dispatch = useDispatch();
  const pending  = batch.total - batch.done;

  const handleOpen = () => {
    dispatch(selectBatch(batch.id));
    dispatch(navigate("policyList"));
  };

  return (
    <>
      {/* ── Desktop: table row ── */}
      <tr
        onClick={handleOpen}
        className="hidden md:table-row border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
      >
        <td className="px-4 py-1.5 text-[13px] font-semibold text-primary font-mono">{batch.id}</td>
        <td className="px-4 py-1.5 text-[13px] text-gray-600">{batch.date}</td>
        <td className="px-4 py-1.5 text-[13px] font-bold text-gray-800">{batch.total}</td>
        <td className="px-4 py-1.5 text-[13px] font-semibold text-green-600">{batch.done}</td>
        <td className="px-4 py-1.5 text-[13px] font-semibold text-amber-500">{pending}</td>
        <td className="px-4 py-1.5">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_MAP[batch.st] || "bg-gray-100 text-gray-500"}`}>
            {batch.st}
          </span>
        </td>
        <td className="px-4 py-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpen(); }}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 border border-gray-200 bg-white hover:border-gray-300 hover:text-gray-700 px-2.5 py-1 rounded-md transition"
          >
            View <ArrowRight size={11} />
          </button>
        </td>
      </tr>

      {/* ── Mobile: card row ── */}
      <tr className="md:hidden">
        <td colSpan={7} className="px-3 py-2">
          <div
            onClick={handleOpen}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm active:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Left content */}
            <div className="flex-1 min-w-0">
              {/* Batch ID + status */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[12px] font-semibold text-primary font-mono">{batch.id}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_MAP[batch.st] || "bg-gray-100 text-gray-500"}`}>
                  {batch.st}
                </span>
              </div>
              {/* Date */}
              <p className="text-[11px] text-gray-400 mb-2">{batch.date}</p>
              {/* Stats row */}
              <div className="flex gap-3 text-[11px] text-gray-500">
                <span>Total <strong className="text-gray-800">{batch.total}</strong></span>
                <span>Done <strong className="text-green-600">{batch.done}</strong></span>
                <span>Pending <strong className="text-amber-500">{pending}</strong></span>
              </div>
            </div>

            {/* Right arrow */}
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </div>
        </td>
      </tr>
    </>
  );
};

export default BatchCard;