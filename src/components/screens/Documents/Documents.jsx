import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setSelectedDocViewerIdx,
    setZoom2,
} from "../../../store/slices/validationSlice";
import { navigate } from "../../../store/slices/navigationSlice";
import { selectCurrentPolicy } from "../../../store/slices/batchSlice";
import { docChecklist } from "../../../data/checklist";
import { dvMetaData } from "../../../data/validation";
import {
    ArrowLeft,
    ZoomIn,
    ZoomOut,
    FileText,
    AlertCircle,
    XCircle,
    Check,
    X,
    ChevronRight,
    ChevronLeft,
    ExternalLink,
    Loader2,
} from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";

const FALLBACK_PDF_URL = "/doc/Policy_ChuckShirey.pdf";
const getPdfUrl = (doc) => doc?.pdfUrl || FALLBACK_PDF_URL;

const STATUS_META = {
    YES: { Icon: FileText, bg: "bg-green-50", ic: "text-green-500", badge: "bg-green-50 text-green-600", label: "Detected" },
    PARTIAL: { Icon: AlertCircle, bg: "bg-amber-50", ic: "text-amber-500", badge: "bg-amber-50 text-amber-600", label: "Partial" },
    NO: { Icon: XCircle, bg: "bg-red-50", ic: "text-red-500", badge: "bg-red-50 text-red-500", label: "Missing" },
};

// ── PDF.js canvas viewer ───────────────────────────────────────────────────
const PdfCanvasViewer = ({ url, zoom }) => {
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null);
    const [pdf, setPdf] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setPdf(null);
        setPageNum(1);

        const init = async () => {
            try {
                if (!window.pdfjsLib) {
                    await new Promise((resolve, reject) => {
                        const s = document.createElement("script");
                        s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
                        s.onload = resolve;
                        s.onerror = reject;
                        document.head.appendChild(s);
                    });
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                }
                const pdfDoc = await window.pdfjsLib.getDocument({ url, withCredentials: false }).promise;
                if (cancelled) return;
                setPdf(pdfDoc);
                setNumPages(pdfDoc.numPages);
            } catch (err) {
                if (cancelled) return;
                console.error("PDF load error:", err);
                setError("Failed to load PDF. Check the URL or network.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        init();
        return () => { cancelled = true; };
    }, [url]);

    useEffect(() => {
        if (!pdf || !canvasRef.current) return;
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
            renderTaskRef.current = null;
        }
        pdf.getPage(pageNum).then((page) => {
            const viewport = page.getViewport({ scale: zoom });
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const ctx = canvas.getContext("2d");
            const task = page.render({ canvasContext: ctx, viewport });
            renderTaskRef.current = task;
            task.promise.catch((err) => {
                if (err?.name !== "RenderingCancelledException") console.error(err);
            });
        });
    }, [pdf, pageNum, zoom]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-72 gap-3 bg-gray-100">
            <Loader2 size={28} className="animate-spin text-primary" />
            <span className="text-sm font-medium text-gray-400">Loading document…</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-72 gap-2 bg-gray-100">
            <XCircle size={36} className="text-red-300" />
            <p className="text-sm font-semibold text-gray-400">{error}</p>
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-3 py-5 px-4 bg-gray-200">
            <div className="shadow-xl rounded-lg overflow-hidden border border-gray-300 bg-white">
                <canvas ref={canvasRef} className="block max-w-full" />
            </div>
            {numPages > 1 && (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                    <button
                        onClick={() => setPageNum((p) => Math.max(p - 1, 1))}
                        disabled={pageNum === 1}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
                    >
                        <ChevronLeft size={14} className="text-gray-600" />
                    </button>
                    <span className="text-[11px] font-semibold text-gray-600 tabular-nums select-none">
                        Page {pageNum} of {numPages}
                    </span>
                    <button
                        onClick={() => setPageNum((p) => Math.min(p + 1, numPages))}
                        disabled={pageNum === numPages}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
                    >
                        <ChevronRight size={14} className="text-gray-600" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────
const Documents = () => {
    const dispatch = useDispatch();
    const policy = useSelector(selectCurrentPolicy);
    const { selectedDocViewerIdx, zoom2 } = useSelector((s) => s.validation);
    const [mobileDetail, setMobileDetail] = React.useState(false);

    const doc = docChecklist[selectedDocViewerIdx];
    const validFiles = docChecklist.filter((d) => d.st !== "NO");
    const pdfUrl = getPdfUrl(doc);

    const handleZoomIn = () => dispatch(setZoom2(Math.min(zoom2 + 0.25, 3)));
    const handleZoomOut = () => dispatch(setZoom2(Math.max(zoom2 - 0.25, 0.5)));

    const handleSelectDoc = (idx) => {
        dispatch(setSelectedDocViewerIdx(idx));
        dispatch(setZoom2(1));
        setMobileDetail(true);
    };

    const DocListItem = ({ d, i }) => {
        const { Icon, bg, ic, badge, label } = STATUS_META[d.st];
        const isActive = selectedDocViewerIdx === i;
        return (
            <button
                onClick={() => handleSelectDoc(i)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${isActive ? "bg-gray-50 border-l-2 border-l-primary" : ""
                    }`}
            >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={13} className={ic} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{d.name}</p>
                    <p className="text-[10.5px] text-gray-400 mt-0.5 truncate">{d.file || "No file"}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                </div>
            </button>
        );
    };

    const PreviewPane = () => {
        const [activeTab, setActiveTab] = React.useState("document");
        const tabs = [
            { key: "document", label: "Document" },
            { key: "metadata", label: "Metadata" },
            { key: "rules", label: "Validation Rules" },
        ];

        return (
            <div className="flex flex-col h-[620px]">

                {/* ─── Header bar ─────────────────────────────────────────── */}
                <div className="flex items-stretch border-b border-gray-100 bg-white min-h-[48px]">

                    {/* List button — mobile only, acts as left border-separated back btn */}
                    <button
                        onClick={() => setMobileDetail(false)}
                        className="md:hidden flex items-center text-[13px] font-semibold text-gray-500 border-r border-gray-200 bg-white hover:bg-gray-50 px-3 transition flex-shrink-0"
                    >
                        List
                    </button>

                    {/* LEFT — filename */}
                    <div className="flex items-center min-w-0 py-2 px-0 flex-1 sm:ps-3 ps-0">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                            {doc?.file || "Select a document"}
                        </span>
                    </div>

                    {/* RIGHT — tabs + AI badge (scrollable on mobile) */}
                    <div className="flex items-stretch flex-shrink-0 overflow-x-auto scrollbar-none">
                        {doc && doc.st !== "NO" && tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`relative flex items-center px-3 text-[13px] font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === t.key
                                    ? "text-primary border-primary"
                                    : "text-gray-400 hover:text-gray-600 border-transparent"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}

                        {doc?.conf > 0 && (
                            <div className="flex items-center px-3">
                                <span className="text-[11px] font-bold text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    AI: {doc.conf}%
                                </span>
                            </div>
                        )}
                    </div>

                </div>

                {/* ── Tab content (scrollable) ── */}
                <div className="flex-1 overflow-y-auto">

                    {/* DOCUMENT tab */}
                    {activeTab === "document" && (
                        doc && doc.st !== "NO" ? (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white">
                                    <button onClick={handleZoomIn} title="Zoom in" className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-primary transition"><ZoomIn size={13} /></button>
                                    <button onClick={handleZoomOut} title="Zoom out" className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-primary transition"><ZoomOut size={13} /></button>
                                    <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                                        {Math.round(zoom2 * 100)}%
                                    </span>
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-primary px-2.5 py-1.5 rounded-md transition"
                                    >
                                        <ExternalLink size={11} /> Open
                                    </a>
                                </div>
                                <PdfCanvasViewer url={pdfUrl} zoom={zoom2} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-16 bg-gray-50">
                                <XCircle size={40} className="text-gray-200 mb-3" />
                                <p className="text-sm font-semibold text-gray-400">{doc ? doc.name : "No document selected"}</p>
                                <p className="text-xs mt-1 text-gray-300">Document not yet uploaded</p>
                            </div>
                        )
                    )}

                    {/* METADATA tab */}
                    {activeTab === "metadata" && doc && doc.st !== "NO" && (
                        <div className="py-4 px-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Document Metadata
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {(dvMetaData[selectedDocViewerIdx] || []).map((m, i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{m.lbl}</p>
                                        <p className="text-sm font-semibold text-gray-800 font-mono break-all">{m.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* VALIDATION RULES tab */}
                    {activeTab === "rules" && doc && doc.st !== "NO" && (
                        <div className="py-4 px-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Validation Results
                            </p>
                            <div className="flex flex-col gap-2">
                                {doc.rules.map((r, ri) => (
                                    <div key={ri} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <span className="text-gray-600 font-medium text-sm">{doc.ruleNames[ri]}</span>
                                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${r ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                                            }`}>
                                            {r ? <><Check size={11} /> Pass</> : <><X size={11} /> Fail</>}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    };

    return (
        <div>
            <Breadcrumb
                crumbs={[
                    { label: "Dashboard", screen: "dashboard" },
                    { label: "Policy List", screen: "policyList" },
                    { label: "Policy Checklist", screen: "checklist" },
                    { label: "Document Viewer" },
                ]}
            />

            <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Document Viewer</h1>
                    {policy && <p className="text-sm text-gray-400 mt-0.5">{policy.customer_name} · {policy.policy_number}</p>}
                </div>
                <div className="flex gap-2">
                    {/* <button
                        onClick={() => dispatch(navigate("validation"))}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition"
                    >
                        <ArrowLeft size={11} /> Back to Validation
                    </button> */}
                    <button
                        onClick={() => dispatch(navigate("checklist"))}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition"
                    >
                        <ArrowLeft size={11} /> Checklist
                    </button>
                </div>
            </div>

            {/* DESKTOP */}
            <div className="hidden md:grid grid-cols-[240px_1fr] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="border-r border-gray-100">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                        <span className="text-sm font-semibold text-gray-800">Documents</span>
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {validFiles.length} files
                        </span>
                    </div>
                    <div className="overflow-y-auto max-h-[580px]">
                        {docChecklist.map((d, i) => <DocListItem key={d.id} d={d} i={i} />)}
                    </div>
                </div>
                <PreviewPane />
            </div>

            {/* MOBILE */}
            <div className="md:hidden bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {!mobileDetail && (
                    <>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <span className="text-sm font-semibold text-gray-800">Documents</span>
                            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {validFiles.length} files
                            </span>
                        </div>
                        <div>{docChecklist.map((d, i) => <DocListItem key={d.id} d={d} i={i} />)}</div>
                    </>
                )}
                {mobileDetail && <PreviewPane />}
            </div>
        </div>
    );
};

export default Documents;