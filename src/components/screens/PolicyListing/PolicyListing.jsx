import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectCurrentBatch,
    selectCurrentPolicies,
    selectPolicy,
} from "../../../store/slices/batchSlice";
import { navigate } from "../../../store/slices/navigationSlice";
import { ArrowRight, ChevronRight } from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";

const AI_MAP  = { Complete: "bg-green-50 text-green-600",  Running: "bg-amber-50 text-amber-600",  Failed: "bg-red-50 text-red-600"   };
const CK_MAP  = { "All Present": "bg-green-50 text-green-600", Pending: "bg-amber-50 text-amber-600", Missing: "bg-red-50 text-red-600" };
const VAL_MAP = { Pass: "bg-green-50 text-green-600", "Failed": "bg-amber-50 text-amber-600", };
const TYPE_MAP= { Auto: "bg-blue-50 text-blue-600", Home: "bg-green-50 text-green-600", Commercial: "bg-purple-50 text-purple-600" };
const ST_MAP  = { Completed: "bg-green-50 text-green-600", "In Progress": "bg-blue-50 text-blue-600", "Needs Attention": "bg-red-50 text-red-600" };

const TABLE_HEADS = ["Policy #", "Customer", "Customer Office Name", "Customer CSR", "Type", "Sold Date", "Docs", "AI Status",  "Validation", "Action"];

const Badge = ({ label, map }) => (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[label] || "bg-gray-100 text-gray-500"}`}>
        {label}
    </span>
);

const PolicyListing = () => {
    const dispatch = useDispatch();
    const batch    = useSelector(selectCurrentBatch);
    const policies = useSelector(selectCurrentPolicies);
    const pending  = batch ? batch.total - batch.done : 0;

    const handleOpenPolicy = (idx) => {
        dispatch(selectPolicy(idx));
        dispatch(navigate("checklist"));
    };

    if (!batch) return <p className="text-sm text-gray-400">No batch selected.</p>;

    return (
        <div className="min-w-0 w-full">
            <Breadcrumb crumbs={[{ label: "Dashboard", screen: "dashboard" }, { label: "Policy List" }]} />

            {/* ── Page header ── */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Policies – {batch.id}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Batch Date: {batch.date}</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ST_MAP[batch.st] || "bg-gray-100 text-gray-500"}`}>
                        {batch.st}
                    </span>
                    <div className="text-sm text-gray-500 flex gap-3">
                        <span>Total: <strong className="text-gray-800">{batch.total}</strong></span>
                        <span>Processed: <strong className="text-green-600">{batch.done}</strong></span>
                        <span>Pending: <strong className="text-amber-500">{pending}</strong></span>
                    </div>
                </div>
            </div>

            {/* ── Outer wrapper card (same on both desktop & mobile) ── */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                {/* Title row */}
                <div className="px-5 py-2.5 border-b border-gray-100">
                    <p className="text-[15px] font-semibold text-gray-800">Policies</p>
                </div>

                {/* ════ DESKTOP TABLE (md and above) ════ */}
                <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                {TABLE_HEADS.map((h) => (
                                    <th key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((p, i) => (
                                <tr key={p.id} onClick={() => handleOpenPolicy(i)}
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0">
                                    <td className="px-4 py-1.5 text-[13px] font-semibold text-primary font-mono">{p.id}</td>
                                    <td className="px-4 py-1.5 max-w-[140px]">
                                        <div className="relative group w-full">
                                            <p className="text-[13px] font-semibold text-gray-800 truncate">{p.name}</p>
                                            <div className="absolute left-0 top-full mt-1.5 z-50 hidden group-hover:block">
                                                <div className="bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">{p.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-1.5 text-[13px] font-semibold text-gray-800">{p.customerofficename}</td>
                                    <td className="px-4 py-1.5 text-[13px] font-semibold text-gray-800">{p.customercsr}</td>
                                    <td className="px-4 py-1.5 text-[13px] text-gray-500">{p.type}</td>
                                    <td className="px-4 py-1.5 max-w-[140px]">
                                        <div className="relative group w-full">
                                            <p className="text-[13px] text-gray-500 truncate">{p.soldDate}</p>
                                            <div className="absolute left-0 top-full mt-1.5 z-50 hidden group-hover:block">
                                                <div className="bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">{p.soldDate}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-1.5 text-[13px] font-bold text-gray-800">{p.docs}</td>
                                    <td className="px-4 py-1.5"><Badge label={p.aiSt} map={AI_MAP} /></td>
                                    {/* <td className="px-4 py-1.5"><Badge label={p.ck}   map={CK_MAP} /></td> */}
                                    <td className="px-4 py-1.5"><Badge label={p.val}  map={VAL_MAP} /></td>
                                    <td className="px-4 py-1.5">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenPolicy(i); }}
                                            className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 border border-gray-200 bg-white hover:border-gray-300 hover:text-gray-700 px-2.5 py-1 rounded-md transition">
                                            View <ArrowRight size={11} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ════ MOBILE CARDS inside the outer card (below md) ════ */}
                <div className="md:hidden flex flex-col gap-3 p-3">
                    {policies.map((p, i) => {
                        const typeCls = TYPE_MAP[p.type] || "bg-gray-100 text-gray-500";
                        return (
                            <div
                                key={p.id}
                                onClick={() => handleOpenPolicy(i)}
                                className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer active:bg-gray-50 transition-colors overflow-hidden"
                            >
                                {/* Card header */}
                                <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-gray-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[12px] font-bold text-primary font-mono">{p.id}</span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeCls}`}>{p.type}</span>
                                    </div>
                                    <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
                                </div>

                                {/* Card body */}
                                <div className="px-4 pt-2.5 pb-3">
                                    <p className="text-[13px] font-bold text-gray-800 truncate mb-0.5">{p.name}</p>
                                    <p className="text-[11px] text-gray-400 truncate mb-3">{p.customerofficename} · {p.customercsr}</p>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Sold Date</p>
                                            <p className="text-[12px] font-semibold text-gray-700">{p.soldDate}</p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Documents</p>
                                            <p className="text-[12px] font-bold text-gray-700">{p.docs}</p>
                                        </div>
                                    </div>

                                    {/* Status badges */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] text-gray-400">AI</span>
                                        <Badge label={p.aiSt} map={AI_MAP} />
                                        {/* <span className="text-[10px] text-gray-400 ml-1">CK</span>
                                        <Badge label={p.ck} map={CK_MAP} /> */}
                                        <span className="text-[10px] text-gray-400 ml-1">VAL</span>
                                        <Badge label={p.val} map={VAL_MAP} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>{/* end outer card */}
        </div>
    );
};

export default PolicyListing;