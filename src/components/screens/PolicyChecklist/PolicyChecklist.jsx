import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navigate } from "../../../store/slices/navigationSlice";
import { selectCurrentPolicy, selectCurrentBatch, setChecklistSummary, setPolicyList, setPolicyCheckList, setDocumentData, } from "../../../store/slices/batchSlice";
import { setSelectedDocViewerIdx } from "../../../store/slices/validationSlice";
import { getChecklistSummary, getPolicyList, getPolicyCheckList, getDocumentData, checkPolicyReviwed } from "../../api/apisCall";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";
import ChecklistRow from "./ChecklistRow";

const TABLE_HEADS = ["#", "Document Name", "Detected", "Confidence", "Validation Rules", "Document"];

// ─── Sort Icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ active, dir }) => {
    if (!active) return <ArrowUpDown size={11} className="text-gray-500 ms-1 inline" />;
    return dir === "asc"
        ? <ArrowUp size={11} className="text-indigo-500 ms-1 inline" />
        : <ArrowDown size={11} className="text-indigo-500 ms-1 inline" />;
};

// Desktop skeleton rows
const SkeletonTableRows = ({ rows = 5, cols = 6 }) => (
    <React.Fragment>
        {Array.from({ length: rows }).map((_, i) => (
            <tr key={`skel-row-${i}`} className="border-b border-gray-100">
                {Array.from({ length: cols }).map((_, j) => (
                    <td key={`skel-col-${j}`} className="px-4 py-3">
                        <div
                            className="h-3 bg-gray-100 rounded-full animate-pulse"
                            style={{ width: `${45 + (j * 11) % 45}%` }}
                        />
                    </td>
                ))}
            </tr>
        ))}
    </React.Fragment>
);

// Mobile skeleton cards
const SkeletonMobileCards = ({ count = 5 }) => (
    <React.Fragment>
        {Array.from({ length: count }).map((_, i) => (
            <tr key={`skel-card-${i}`} className="md:hidden">
                <td colSpan={6} className="px-3 py-2 pb-1">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="h-3 w-36 bg-gray-100 rounded-full animate-pulse" />
                                <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-1">
                                    {Array.from({ length: 4 }).map((_, k) => (
                                        <div key={k} className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
                                    ))}
                                </div>
                                <div className="h-3 w-10 bg-gray-100 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        ))}
    </React.Fragment>
);

// Skeleton stat cards
const SkeletonStatCards = () => (
    <React.Fragment>
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card px-2 py-2 rounded border w-full bg-gray-50 border-gray-100">
                <div className="flex flex-col justify-center items-center gap-2 py-1">
                    <div className="h-6 w-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-3 w-14 bg-gray-100 rounded-full animate-pulse" />
                </div>
            </div>
        ))}
    </React.Fragment>
);

const PolicyChecklist = () => {
    const dispatch = useDispatch();
    const policy = useSelector(selectCurrentPolicy);
    const batch = useSelector(selectCurrentBatch);
    const { checklistSummary, policyCheckList, policyList, selectedPolicyIdx } = useSelector((state) => state.batch);
    const [loading, setLoading] = useState(true);
    const [sortDir, setSortDir] = useState(null); // null | "asc" | "desc"

    const present = (policyCheckList || []).filter((d) => (d.detected_status === "found" || d.st === "YES")).length;
    const missing = (policyCheckList || []).filter((d) => (d.detected_status === "missing" || d.st === "NO")).length;
    const partial = (policyCheckList || []).filter((d) => (d.detected_status === "partial" || d.st === "PARTIAL")).length;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (batch?.batch_id && !policy) {
                    await getPolicyList(setPolicyList, batch.batch_id, dispatch);
                }
                if (policy.policy_id) {
                    const idStr = policy.policy_id;
                    await getChecklistSummary(setChecklistSummary, idStr, dispatch);
                    await getPolicyCheckList(setPolicyCheckList, idStr, dispatch);
                }
            } catch (error) {
                console.error("Error in API calls:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [batch?.batch_id, dispatch, policy]);

    // ── Sort handler — cycles: null → asc → desc → null ──
    const handleSort = () => {
        setSortDir((prev) => {
            if (prev === null) return "asc";
            if (prev === "asc") return "desc";
            return null;
        });
    };

    // ── Apply sort to checklist ──
    const sortedList = React.useMemo(() => {
        if (!policyCheckList) return [];
        if (!sortDir) return policyCheckList;
        return [...policyCheckList].sort((a, b) => {
            const aName = (a.document_name || a.name || "").toLowerCase();
            const bName = (b.document_name || b.name || "").toLowerCase();
            const cmp = aName.localeCompare(bName);
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [policyCheckList, sortDir]);

    const dashaboardCard = [
        { discription: "Detected", count: present },
        { discription: "Missing", count: missing },
        { discription: "Partial", count: partial },
    ];

    const handleViewDoc = (idx) => {
        const doc = policyCheckList[idx];
        const checklistItemId = doc.id || doc.checklist_item_id || doc.checklist_id;
        const idStr = policy.policy_id;
        getDocumentData(setDocumentData, idStr, dispatch, checklistItemId);
        dispatch(setSelectedDocViewerIdx(idx));
        dispatch(navigate("documents"));
    };

    const handleCheckReviwed = () => {
        const policyId = policyList[selectedPolicyIdx].policy_id;
        checkPolicyReviwed(policyId);
        setTimeout(() => {
            getPolicyList(setPolicyList, batch.batch_id, dispatch);
        }, [2000])

    }
    return (
        <div>
            <Breadcrumb
                crumbs={[
                    { label: "Dashboard", screen: "dashboard" },
                    { label: "Policy List", screen: "policyList" },
                    { label: `${policy?.policy_number} – ${policy?.customer_name}` },
                ]}
            />

            {/* Page Header */}
            <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                        {checklistSummary?.customer_name}-{checklistSummary?.policy_type} Insurance
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-0.5">
                        {checklistSummary?.policy_number} . Sold {checklistSummary?.sold_date}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => dispatch(navigate("policyList"))}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition"
                    >
                        <ArrowLeft size={12} /> Back
                    </button>
                </div>
            </div>

            {/* Mobile Stat Cards */}
            <div className="text-gray-800 flex justify-between items-center gap-3 mb-2 md:hidden">
                {loading ? (
                    <SkeletonStatCards />
                ) : (
                    dashaboardCard.map((item, index) => (
                        <div
                            key={index}
                            className={`card px-2 py-2 rounded border w-full ${item.discription === "Detected" ? "bg-[#F0FDF4] border-[#BBF7D0]"
                                : item.discription === "Missing" ? "bg-[#FEF2F2] border-[#FECACA]"
                                    : item.discription === "Partial" ? "bg-[#FFFBEB] border-[#FDE68A]"
                                        : "bg-white"
                                }`}
                        >
                            <div className="card-body flex flex-col justify-center items-center">
                                <p className={`text-[20px] font-bold ${item.discription === "Detected" ? "text-[#16A34A]"
                                    : item.discription === "Missing" ? "text-[#DC2626]"
                                        : item.discription === "Partial" ? "text-[#D97706]"
                                            : "text-gray-500"
                                    }`}>
                                    {item.count}
                                </p>
                                <span className={`${item.discription === "Detected" ? "text-[#16A34A]"
                                    : item.discription === "Missing" ? "text-[#DC2626]"
                                        : item.discription === "Partial" ? "text-[#D97706]"
                                            : "text-gray-500"
                                    }`}>
                                    {item.discription}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                {/* Title Row */}
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100">
                    <p className="text-[15px] font-semibold text-gray-800">Required Documents</p>
                    <div className="flex gap-2">
                        <button className="flex-shrink-0 flex items-center gap-1 h-8 px-3 text-[13px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] rounded-md transition-all whitespace-nowrap"
                            onClick={handleCheckReviwed}
                        >
                            Reviewed
                        </button>
                        <span className="text-[11px] font-semibold bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                            ✓ Pass
                        </span>
                        <span className="text-[11px] font-semibold bg-red-50 text-red-500 px-2.5 py-1 rounded-full">
                            ✗ Fail
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="hidden md:table-header-group">
                            <tr className="bg-gray-50 text-left">
                                {TABLE_HEADS.map((h) => {
                                    const isDocName = h === "Document Name";
                                    return (
                                        <th
                                            key={h}
                                            onClick={() => isDocName && handleSort()}
                                            className={`text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 whitespace-nowrap select-none transition-colors ${isDocName
                                                ? "cursor-pointer hover:bg-gray-100 hover:text-gray-600"
                                                : "cursor-default"
                                                } ${isDocName && sortDir ? "text-indigo-500" : "text-gray-400"}`}
                                        >
                                            {h}
                                            {isDocName && (
                                                <SortIcon active={!!sortDir} dir={sortDir} />
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody className="md:table-row-group p-1 md:p-0 space-y-2 md:space-y-0">
                            {loading ? (
                                <>
                                    <SkeletonTableRows rows={5} cols={TABLE_HEADS.length} />
                                    <SkeletonMobileCards count={5} />
                                </>
                            ) : sortedList.length > 0 ? (
                                sortedList.map((doc, index) => (
                                    <ChecklistRow
                                        key={doc.id}
                                        doc={doc}
                                        index={index}
                                        onViewDoc={() => handleViewDoc(index)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={TABLE_HEADS.length} className="text-center py-8 text-sm text-gray-400">
                                        No documents found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PolicyChecklist;