import React from "react";
import { useDispatch } from "react-redux";
import { selectBatch, setPolicySummary, setPolicyList, resetPolicyList } from "../../../store/slices/batchSlice";
import { navigate } from "../../../store/slices/navigationSlice";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getPolicySummary, getPolicyList } from "../../api/apisCall";

const STATUS_MAP = {
  completed: "bg-green-50 text-green-600",
  "in progress": "bg-blue-50 text-blue-600",
  "needs attention": "bg-red-50 text-red-600",
  processing: "bg-blue-50 text-blue-600",
};

const BatchCard = ({ batch }) => {
  const dispatch = useDispatch();

  const handleOpen = () => {
    dispatch(resetPolicyList());
    getPolicySummary(setPolicySummary, batch.batch_id, dispatch);
    getPolicyList(setPolicyList, batch.batch_id, dispatch);
    dispatch(selectBatch(batch.batch_id));
    dispatch(navigate("policyList"));
  };

  return (
    <>
      {/* ── Desktop: table row ── */}
      <tr
        onClick={handleOpen}
        className="hidden md:table-row border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
      >
        {/* Serial / Batch ID column */}
        <td className="px-4 py-1.5 text-[13px] font-bold text-gray-700">
          {batch.serial}
        </td>

        <td className="px-3 py-1.5 text-[13px] text-gray-600">{batch.batch_date || "0"}</td>
        <td className="px-4 py-1.5 text-[13px] font-bold text-gray-700">{batch.total_policies || "0"}</td>
        <td className="px-4 py-1.5 text-[13px] font-semibold text-green-600">{batch.processed || "0"}</td>
        <td className="px-4 py-1.5 text-[13px] font-semibold text-amber-500">{batch.reviewed || "0"}</td>
        <td className="px-3 py-1.5">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_MAP[batch.status] || "bg-gray-100 text-gray-500"}`}>
            {batch.status}
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
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2 flex-wrap mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-primary font-mono">
                    #{batch.serial}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_MAP[batch.status] || "bg-gray-100 text-gray-500"}`}>
                    {batch.status}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </div>
              <p className="text-[11px] text-gray-400 mb-2">{batch.batch_date}</p>
              <div className="flex gap-3 text-[11px] text-gray-500">
                <span>Total <strong className="text-gray-800">{batch.total_policies}</strong></span>
                <span>Done <strong className="text-green-600">{batch.processed}</strong></span>
                <span>Pending <strong className="text-amber-500">{batch.pending}</strong></span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default BatchCard;