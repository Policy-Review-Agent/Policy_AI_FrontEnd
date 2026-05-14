import React from "react";
import { Folder, Check, X } from "lucide-react";

const STATUS_MAP = {
    found:   { cls: "bg-green-50 text-green-600", label: "YES"     },
    partial: { cls: "bg-amber-50 text-amber-600", label: "PARTIAL" },
    missing: { cls: "bg-red-50 text-red-500",     label: "NO"      },
    YES:     { cls: "bg-green-50 text-green-600", label: "YES"     },
    PARTIAL: { cls: "bg-amber-50 text-amber-600", label: "PARTIAL" },
    NO:      { cls: "bg-red-50 text-red-500",     label: "NO"      },
};

// ── Rule pips — declared OUTSIDE ChecklistRow ─────────────────────────────────
const RulePips = ({ rules, ruleNames }) => (
    <div className="flex items-center gap-1">
        {rules.map((r, ri) => {
            const isPass    = typeof r === "object" ? r.status === "pass" : r;
            const ruleName  = typeof r === "object" ? r.name : (ruleNames?.[ri] || "Rule");
            return (
                <div key={ri} className="relative group">
                    <div
                        className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-colors ${
                            isPass ? "bg-green-50 hover:bg-green-100" : "bg-red-50 hover:bg-red-100"
                        }`}
                    >
                        {isPass
                            ? <Check size={10} className="text-green-500" />
                            : <X    size={10} className="text-red-500"   />}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 pointer-events-none">
                        <div className="bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap relative">
                            {ruleName}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-gray-800" />
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

// ─── ChecklistRow ─────────────────────────────────────────────────────────────
const ChecklistRow = ({ doc, onViewDoc, index }) => {
    const status = doc?.detected_status || doc?.st || "missing";
    const { cls, label } = STATUS_MAP[status] || STATUS_MAP["missing"];
    const rules      = doc?.validation_rules || doc?.rules || [];
    const ruleNames  = doc?.ruleNames;

    const confidenceValue = typeof doc?.confidence === "number"
        ? (doc.confidence < 1 ? Math.round(doc.confidence * 100) : doc.confidence)
        : (doc?.conf || 0);

    const confColor =
        confidenceValue >= 80 ? "text-green-600" :
        confidenceValue >= 60 ? "text-amber-500" :
                                "text-red-500";

    const docName = doc?.document_name || doc?.name;

    return (
        <>
            {/* ════ DESKTOP ROW ════ */}
            <tr className="hidden md:table-row border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0">
                <td className="px-4 py-1.5 text-[13px] text-gray-400 font-mono">
                    {index + 1}
                </td>
                <td className="px-4 py-1.5 text-[13px] font-semibold text-gray-800">{docName}</td>
                <td className="px-4 py-1.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                        {label}
                    </span>
                </td>
                <td className="px-4 py-1.5">
                    {confidenceValue > 0
                        ? <span className={`text-[13px] font-bold font-mono ${confColor}`}>{confidenceValue}%</span>
                        : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-1.5">
                    <RulePips rules={rules} ruleNames={ruleNames} />
                </td>
                <td className="px-4 py-1.5">
                    <button
                        onClick={onViewDoc}
                        className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 border border-gray-200 bg-white hover:border-gray-300 hover:text-gray-700 px-2.5 py-1 rounded-md transition"
                    >
                        <Folder size={11} /> View
                    </button>
                </td>
            </tr>

            {/* ════ MOBILE CARD ROW ════ */}
            <tr className="md:hidden">
                <td colSpan={6} className="px-3 py-2 pb-1">
                    <div
                        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                        onClick={onViewDoc}
                    >
                        <div className="px-4 py-3">
                            <div className="flex justify-between items-center gap-2 min-w-0 flex-1">
                                <div className="flex gap-1 items-center">
                                    <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <p className="text-[12px] font-semibold text-gray-800 truncate">{docName}</p>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${cls}`}>
                                    {label}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-2 mt-3">
                                <RulePips rules={rules} ruleNames={ruleNames} />
                                {confidenceValue > 0
                                    ? <span className={`text-[12px] font-bold font-mono ${confColor}`}>{confidenceValue}%</span>
                                    : <span className="text-gray-300 text-[12px]">—</span>}
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </>
    );
};

export default ChecklistRow;