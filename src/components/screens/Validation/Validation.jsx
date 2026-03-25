import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setValDocIdx,
    setZoom,
    approveAllFields,
    setSelectedDocViewerIdx,
} from "../../../store/slices/validationSlice";
import { navigate } from "../../../store/slices/navigationSlice";
import { selectCurrentPolicy, selectPolicy } from "../../../store/slices/batchSlice";
import { showToast } from "../../../store/slices/toastSlice";
import { selectCurrentPolicies } from "../../../store/slices/batchSlice";
import { mockDocHTML } from "../../../data/validation";
import {
    ArrowLeft,
    ArrowRight,
    ZoomIn,
    ZoomOut,
    Folder,
    Check,
    X,
} from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";
import ValidationField from "./ValidationField";

const Validation = () => {
    const dispatch = useDispatch();
    const policy = useSelector(selectCurrentPolicy);
    const policies = useSelector(selectCurrentPolicies);
    const polIdx = useSelector((s) => s.batch.selectedPolicyIdx);
    const { docs, curDocIdx, zoom } = useSelector((s) => s.validation);

    const doc = docs[curDocIdx];

    const switchDoc = (i) => dispatch(setValDocIdx(i));
    const handleZoomIn = () => dispatch(setZoom(Math.min(zoom + 0.2, 2)));
    const handleZoomOut = () => dispatch(setZoom(Math.max(zoom - 0.2, 0.5)));

    const handleMarkValidated = () => {
        dispatch(showToast({ title: "Validated", msg: `${doc.name} marked validated.`, ok: true }));
        if (curDocIdx < docs.length - 1) {
            setTimeout(() => dispatch(setValDocIdx(curDocIdx + 1)), 400);
        }
    };

    const handleRejectDoc = () =>
        dispatch(showToast({ title: "Rejected", msg: `${doc.name} rejected.`, ok: false }));

    const handleApproveAll = () => {
        dispatch(approveAllFields());
        dispatch(showToast({ title: "All Fields Approved", msg: "", ok: true }));
    };

    const handleFinishAndNext = () => {
        const next = polIdx + 1;
        if (next < policies.length) {
            dispatch(showToast({ title: "Validation Complete", msg: `Moving to ${policies[next].id}`, ok: true }));
            setTimeout(() => {
                dispatch(selectPolicy(next));
                dispatch(navigate("checklist"));
            }, 700);
        } else {
            dispatch(showToast({ title: "All Policies Done", msg: "Batch processing complete!", ok: true }));
            setTimeout(() => dispatch(navigate("policyList")), 700);
        }
    };

    const handleOpenDocViewer = () => {
        dispatch(setSelectedDocViewerIdx(curDocIdx));
        dispatch(navigate("documents"));
    };

    const confColor =
        doc.conf >= 80 ? "text-green-500" :
            doc.conf >= 60 ? "text-amber-500" :
                "text-red-500";

    const detBadge =
        doc.det === "YES" ? "bg-green-50 text-green-600" :
            doc.det === "PARTIAL" ? "bg-amber-50 text-amber-600" :
                "bg-red-50 text-red-500";

    const detLabel =
        doc.det === "YES" ? "Detected" :
            doc.det === "PARTIAL" ? "Partial" :
                "Not Detected";

    return (
        <div>
            <Breadcrumb
                crumbs={[
                    { label: "Dashboard", screen: "dashboard" },
                    { label: "Policy List", screen: "policyList" },
                    { label: "Policy Checklist", screen: "checklist" },
                    { label: doc.name },
                ]}
            />

            {/* ── Card ── */}
            <div className="bg-white border border-gray-200 rounded-t-xl shadow-sm overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
                    <div>
                        <p className="text-[15px] font-semibold text-gray-800">{doc.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{doc.file}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">AI Confidence</span>
                        <span className={`text-sm font-bold font-mono ${confColor}`}>
                            {doc.conf > 0 ? `${doc.conf}%` : "—"}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${detBadge}`}>
                            {detLabel}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto border-b border-gray-100 px-5">
                    {docs.map((d, i) => {
                        const allPass = d.rules.every((r) => r.st);
                        const dot = allPass ? "bg-green-500" : d.det === "PARTIAL" ? "bg-amber-500" : "bg-primary";
                        return (
                            <button
                                key={i}
                                onClick={() => switchDoc(i)}
                                className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-all ${i === curDocIdx
                                    ? "text-primary border-primary font-semibold"
                                    : "text-gray-400 border-transparent hover:text-gray-700"
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${dot}`} />
                                {d.name}
                            </button>
                        );
                    })}
                </div>

                {/* Body */}
                <div className="flex min-h-[420px]">

                    {/* Left: preview + rules */}
                    <div className="flex-1 border-r border-gray-100 flex flex-col">

                        {/* Doc preview */}
                        <div
                            className="flex-1 bg-gray-100 flex items-start justify-center p-6 cursor-pointer overflow-auto"
                            onClick={handleOpenDocViewer}
                            title="Click to open Full Document View"
                        >
                            <div
                                className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden w-full max-w-xs"
                                style={{ transform: `scale(${zoom})`, transformOrigin: "top center", pointerEvents: "none" }}
                                dangerouslySetInnerHTML={{ __html: mockDocHTML[curDocIdx] || "" }}
                            />
                        </div>

                        {/* Zoom bar */}
                        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-100">
                            <button onClick={handleZoomIn} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-primary transition"><ZoomIn size={13} /></button>
                            <button onClick={handleZoomOut} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-primary transition"><ZoomOut size={13} /></button>
                            <span className="text-xs text-gray-400 flex-1 font-mono">Doc {curDocIdx + 1} of {docs.length}</span>
                            <button
                                onClick={handleOpenDocViewer}
                                className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-2.5 py-1.5 rounded-md transition"
                            >
                                <Folder size={11} /> Full View
                            </button>
                        </div>

                        {/* Rule results */}
                        <div className="border-t border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2 bg-gray-50 border-b border-gray-100">
                                Rule Results
                            </p>
                            {doc.rules.map((r, ri) => (
                                <div key={ri} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0 text-sm">
                                    <span className="text-gray-500 font-medium">{r.name}</span>
                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${r.st ? "text-green-500" : "text-red-500"}`}>
                                        {r.st ? <Check size={12} /> : <X size={12} />}
                                        {r.st ? "Pass" : "Fail"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: fields panel */}
                    <div className="w-72 flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-[13px] font-semibold text-gray-800">Fields Requiring Validation</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Confirm or reject extracted values</p>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto max-h-[420px] flex flex-col gap-2.5">
                            {doc.fields.map((f, i) => (
                                <ValidationField key={i} field={f} idx={i} />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 bg-gray-50">
                            <p className="text-[11px] text-gray-400 flex-1">
                                {doc.fields.filter((f) => f.st === "approved").length} approved ·{" "}
                                {doc.fields.filter((f) => f.st === "rejected").length} rejected ·{" "}
                                {doc.fields.filter((f) => f.st === "pending").length} pending
                            </p>
                            <button
                                onClick={handleApproveAll}
                                className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-md transition border border-green-200"
                            >
                                <Check size={11} /> Approve All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-white border border-t-0 border-gray-200 rounded-b-xl shadow-sm flex-wrap">
                <button
                    onClick={() => curDocIdx > 0 && switchDoc(curDocIdx - 1)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition"
                >
                    <ArrowLeft size={11} /> Prev
                </button>
                <button
                    onClick={() =>
                        curDocIdx < docs.length - 1
                            ? switchDoc(curDocIdx + 1)
                            : dispatch(showToast({ title: "Last Document", msg: "Use Finish to proceed.", ok: false }))
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition"
                >
                    Next <ArrowRight size={11} />
                </button>
                <div className="flex-1" />
                <button
                    onClick={handleRejectDoc}
                    className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition border border-red-200"
                >
                    <X size={11} /> Reject Document
                </button>
                <button
                    onClick={handleMarkValidated}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition"
                >
                    <Check size={11} /> Mark Validated
                </button>
                <button
                    onClick={handleFinishAndNext}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-md transition"
                >
                    Finish Validation <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default Validation;