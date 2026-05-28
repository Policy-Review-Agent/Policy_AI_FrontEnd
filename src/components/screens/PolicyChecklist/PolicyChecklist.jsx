import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navigate } from "../../../store/slices/navigationSlice";
import { selectCurrentPolicy, selectCurrentBatch, setChecklistSummary, setPolicyList, setPolicyCheckList, setDocumentData, setPolicySummary, setPolicyValidated, resetPolicyCheckList } from "../../../store/slices/batchSlice";
import { setSelectedDocViewerIdx } from "../../../store/slices/validationSlice";
import { getChecklistSummary, getPolicyList, getPolicyCheckList, getDocumentData, checkPolicyReviwed, getPolicySummary } from "../../api/apisCall";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";
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

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast, onClose]);

    if (!toast) return null;

    const isSuccess = toast.type === "success";

    return (
        <div
            className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl shadow-lg px-4 py-3 min-w-[240px] max-w-[340px] border ${isSuccess
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
                }`}
            style={{ animation: "slideInToast 0.25s ease" }}
        >
            <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${isSuccess ? "bg-green-100" : "bg-red-100"
                }`}>
                {isSuccess
                    ? <CheckCircle2 size={14} className="text-green-600" />
                    : <XCircle size={14} className="text-red-500" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold ${isSuccess ? "text-green-700" : "text-red-700"}`}>
                    {toast.title}
                </p>
                {toast.subtitle && (
                    <p className={`text-[11px] mt-0.5 ${isSuccess ? "text-green-600" : "text-red-500"}`}>
                        {toast.subtitle}
                    </p>
                )}
            </div>
            <button
                onClick={onClose}
                className={`flex-shrink-0 transition ${isSuccess ? "text-green-400 hover:text-green-600" : "text-red-300 hover:text-red-500"}`}
            >
                <XCircle size={14} />
            </button>
            <style>{`
                @keyframes slideInToast {
                    from { opacity: 0; transform: translateX(40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

// Desktop skeleton rows
const SkeletonTableRows = ({ rows = 5, cols = 6 }) => (
    <React.Fragment>
        {Array.from({ length: rows }).map((_, i) => (
            <tr key={`skel-row-${i}`} className="border-b border-gray-100">
                {Array.from({ length: cols }).map((_, j) => (
                    <td key={`skel-col-${j}`} className="px-4 py-3">
                        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: `${45 + (j * 11) % 45}%` }} />
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
    const { checklistSummary, policyCheckList, policyList, selectedBatchId, selectedPolicyIdx, policySummary, policyAIStatus, policyvalidation, policyValidated } = useSelector((state) => state.batch);
    // console.log("policyValidated", policyValidated)
    // const [loading, setLoading] = useState(true);
    const loading = policyCheckList === null;
    const [sortDir, setSortDir] = useState(null);
    const [reviewing, setReviewing] = useState(false);
    const [toast, setToast] = useState(null);

    const present = (policyCheckList || []).filter((d) => (d.detected_status === "found" || d.st === "YES")).length;
    const missing = (policyCheckList || []).filter((d) => (d.detected_status === "missing" || d.st === "NO")).length;
    const partial = (policyCheckList || []).filter((d) => (d.detected_status === "partial" || d.st === "PARTIAL")).length;

    useEffect(() => {
        const fetchData = async () => {
            dispatch(resetPolicyCheckList()); // ← clears stale data immediately → loader shows
            try {
                // if (batch?.batch_id && !policy) {
                //     await getPolicyList(setPolicyList, batch.batch_id, dispatch);
                // }
                if (policy?.policy_id) {
                    const idStr = policy.policy_id;
                    await getChecklistSummary(setChecklistSummary, idStr, dispatch);
                    await getPolicyCheckList(setPolicyCheckList, idStr, dispatch);
                }
            } catch (error) {
                console.error("Error in API calls:", error);
                dispatch(setPolicyCheckList([])); // ← fallback so loader doesn't hang
            }
        };
        fetchData();
    }, [batch?.batch_id, dispatch, policy]);

    const handleSort = () => {
        setSortDir((prev) => {
            if (prev === null) return "asc";
            if (prev === "asc") return "desc";
            return null;
        });
    };

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

    const handleCheckReviwed = async () => {
        setReviewing(true);
        try {
            const policyId = policyList[selectedPolicyIdx].policy_id;
            await checkPolicyReviwed(setPolicyValidated, dispatch, policyId);
            // setTimeout(() => getPolicyList(setPolicyList, batch.batch_id, dispatch), 2000);
            setToast({ type: "success", title: "Marked as Reviewed", subtitle: "Policy has been successfully marked as reviewed." });
        } catch (err) {
            setToast({ type: "error", title: "Review Failed", subtitle: "Something went wrong. Please try again." });
        } finally {
            setReviewing(false);
        }
    };
    const Tooltip = ({ label, children }) => (
        <span className="relative group inline-flex items-center">
            {children}
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 whitespace-nowrap">
                <span className="bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded-md shadow-md">
                    {label}
                </span>
            </span>
        </span>
    );
    return (
        <div>
            <Breadcrumb
                crumbs={[
                    { label: "Dashboard", screen: "dashboard" },
                    { label: "Policy List", screen: "policyList" },
                    { label: `${policy?.policy_number} – ${policy?.customer_name}` },
                ]}
            />
           

            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Page Header */}
            <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                        <Tooltip label="Customer Name">{checklistSummary?.customer_name}</Tooltip>
                        {" - "}
                        <Tooltip label="Policy Type">{checklistSummary?.policy_type}</Tooltip>
                        {" Insurance"}
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-0.5 flex justify-start items-center gap-1 flex-wrap">
                        <Tooltip label="Policy Number">{checklistSummary?.policy_number}</Tooltip>
                        {checklistSummary?.sold_date && (
                            <Tooltip label="Sold Date">. Sold {checklistSummary?.sold_date}</Tooltip>
                        )}
                        <Tooltip label="Validator Setup Checklist ID">,
                            {checklistSummary?.validator_setup_checklist_id}
                        </Tooltip>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            dispatch(navigate("policyList"))
                            console
                            getPolicySummary(setPolicySummary, selectedBatchId, dispatch);
                            getPolicyList(setPolicyList, batch.batch_id, dispatch);

                        }}
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

                        {/* ── Reviewed button with loader ── */}
                        {policyvalidation === "in_review" && policyValidated?.validation_status !== "validated" && (
                            <button
                                onClick={handleCheckReviwed}
                                disabled={reviewing}
                                className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 text-[13px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] disabled:bg-[#6B55E8]/60 disabled:cursor-not-allowed rounded-md transition-all whitespace-nowrap"
                            >
                                {reviewing ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                        Reviewing...
                                    </>
                                ) : (
                                    "Review"
                                )}
                            </button>
                        )}
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
                                            className={`text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 whitespace-nowrap select-none transition-colors ${isDocName ? "cursor-pointer hover:bg-gray-100 hover:text-gray-600" : "cursor-default"
                                                } ${isDocName && sortDir ? "text-indigo-500" : "text-gray-400"}`}
                                        >
                                            {h}
                                            {isDocName && <SortIcon active={!!sortDir} dir={sortDir} />}
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