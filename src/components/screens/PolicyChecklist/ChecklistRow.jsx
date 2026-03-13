import React from "react";
import { Folder, Check, X, ChevronRight } from "lucide-react";

const STATUS_MAP = {
  YES: { cls: "bg-green-50 text-green-600", label: "YES" },
  PARTIAL: { cls: "bg-amber-50 text-amber-600", label: "PARTIAL" },
  NO: { cls: "bg-red-50 text-red-500", label: "NO" },
};

const ChecklistRow = ({ doc, onViewDoc }) => {
  const { cls } = STATUS_MAP[doc.st];
  const passed = doc.rules.filter(Boolean).length;

  const confColor =
    doc.conf >= 80 ? "text-green-600" :
      doc.conf >= 60 ? "text-amber-500" :
        "text-red-500";

  // ── Rule pips (shared between desktop & mobile) ──────────────────────────
  const RulePips = () => (
    <div className="flex items-center gap-1">
      {doc.rules.map((r, ri) => (
        <div
          key={ri}
          title={doc.ruleNames[ri]}
          className={`w-5 h-5 rounded-[4px] flex items-center justify-center ${r ? "bg-green-50" : "bg-red-50"
            }`}
        >
          {r
            ? <Check size={10} className="text-green-500" />
            : <X size={10} className="text-red-500" />}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ════ DESKTOP ROW (md and above) ════ */}

      <tr className="hidden md:table-row border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0">
        <td className="px-4 py-1.5 text-[13px] text-gray-400 font-mono">
          {String(doc.id).padStart(2, "0")}
        </td>
        <td className="px-4 py-1.5 text-[13px] font-semibold text-gray-800">{doc.name}</td>
        <td className="px-4 py-1.5">
           <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
            {doc.st}
           </span>
        </td>
        <td className="px-4 py-1.5">
          {doc.conf > 0
            ? <span className={`text-[13px] font-bold font-mono ${confColor}`}>{doc.conf}%</span>
            : <span className="text-gray-300">—</span>}
        </td>
        <td className="px-4 py-1.5"><RulePips /></td>
        <td className="px-4 py-1.5">
          {doc.file ? (
            <button
              onClick={onViewDoc}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 border border-gray-200 bg-white hover:border-gray-300 hover:text-gray-700 px-2.5 py-1 rounded-md transition"
            >
              <Folder size={11} /> View
            </button>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </td>
      </tr>

      {/* ════ MOBILE CARD ROW (below md) ════ */}

      <tr className="md:hidden">
        <td colSpan={6} className="px-3 py-2 pb-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            onClick={onViewDoc}
          >
            <div className="px-4 py-3">
              <div>
                <div className="flex justify-between items-center gap-2 min-w-0 flex-1  ">
                  <div className="flex gap-1 items-center">
                    <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">
                      {String(doc.id).padStart(2, "0")}
                    </span>
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{doc.name}</p>
                  </div>
                  <div>
                    {/* <ChevronRight size={15} className="text-gray-300" /> */}
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${cls}`}>
                      {doc.st === "YES" ? "Detected" : doc.st === "NO" ? "Missing" : doc.st === "PARTIAL" ? "Partial" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2 mt-3">
                  <RulePips />
                  {doc.conf > 0
                    ? <span className={`text-[12px] font-bold font-mono ${confColor}`}>{doc.conf}%</span>
                    : <span className="text-gray-300 text-[12px]">—</span>}
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default ChecklistRow;