import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setZoom2 } from "../../../store/slices/validationSlice";
import {
    ZoomIn,
    ZoomOut,
    Check,
    X,
    ExternalLink,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle
} from "lucide-react";

// ── PDF.js canvas viewer ───────────────────────────────────────────────────
const PdfCanvasViewer = ({ url, zoom, initialPage = 1, pageRanges }) => {
    const canvasRef = React.useRef(null);
    const renderTaskRef = React.useRef(null);
    const [pdf, setPdf] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        let cancelled = false;
        if (!url) { setLoading(false); return; }

        setLoading(true);
        setError(null);
        setPdf(null);
        setPageNum(initialPage);

        const init = async () => {
            try {
                if (!window.pdfjsLib) {
                    await new Promise((resolve, reject) => {
                        const s = document.createElement("script");
                        s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
                        s.async = true;
                        s.onload = resolve;
                        s.onerror = () => reject(new Error("Failed to load PDF.js library"));
                        document.head.appendChild(s);
                        setTimeout(() => reject(new Error("PDF.js library load timeout")), 10000);
                    });
                }

                if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                }

                const loadingTask = window.pdfjsLib.getDocument({
                    url,
                    withCredentials: false,
                    disableRange: false,
                    disableAutoFetch: false
                });

                const pdfDoc = await loadingTask.promise;
                if (cancelled) return;

                setPdf(pdfDoc);
                setNumPages(pdfDoc.numPages);
            } catch (err) {
                if (cancelled) return;
                console.error("PDF load error:", err);
                setError(err.message || "Failed to load PDF.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        init();
        return () => { cancelled = true; };
    }, [url, initialPage]);

    React.useEffect(() => {
        setPageNum(initialPage);
    }, [initialPage, pdf]);

    React.useEffect(() => {
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
                if (err?.name !== "RenderingCancelledException") console.error("Render error:", err);
            });
        }).catch(err => {
            console.error("Page get error:", err);
        });
    }, [pdf, pageNum, zoom]);

    if (!url) return (
        <div className="flex flex-col items-center justify-center h-72 py-16 bg-gray-50">
            <AlertCircle size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-400">No PDF URL provided</p>
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[100vh] gap-3 bg-gray-100">
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

    const minNavPage = pageRanges && pageRanges.length > 0 ? pageRanges[0] : 1;
    const maxNavPage = pageRanges && pageRanges.length > 1
        ? (numPages > 0 ? Math.min(pageRanges[1], numPages) : pageRanges[1])
        : (pageRanges && pageRanges.length === 1 ? pageRanges[0] : numPages);

    const showPagination = numPages > 1 || (pageRanges && pageRanges.length > 0);

    let pageLabel = `Page ${pageNum} of ${numPages}`;
    if (pageRanges?.length > 0) {
        pageLabel = minNavPage === maxNavPage
            ? `Page ${pageNum}`
            : `Page ${pageNum} of ${maxNavPage}`;
    }

    return (
        <div className="flex flex-col items-center gap-3 py-5 px-4 bg-gray-200">
            <div className="shadow-xl rounded-lg overflow-hidden border border-gray-300 bg-white">
                <canvas ref={canvasRef} className="block max-w-full" />
            </div>
            {showPagination && (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                    <button
                        onClick={() => setPageNum((p) => Math.max(p - 1, minNavPage))}
                        disabled={pageNum <= minNavPage}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
                    >
                        <ChevronLeft size={14} className="text-gray-600" />
                    </button>
                    <span className="text-[11px] font-semibold text-gray-600 tabular-nums select-none">
                        {pageLabel}
                    </span>
                    <button
                        onClick={() => setPageNum((p) => Math.min(p + 1, maxNavPage))}
                        disabled={pageNum >= maxNavPage || (numPages > 0 && pageNum >= numPages)}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
                    >
                        <ChevronRight size={14} className="text-gray-600" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ── DocumentView component ───────────────────────────────────────────────────
const DocumentView = ({ doc, documentData, isApiDataObject, pdfUrl, setMobileDetail }) => {
    const dispatch = useDispatch();
    const { zoom2 } = useSelector((s) => s.validation);
    const [activeTab, setActiveTab] = useState("document");

    const handleZoomIn  = () => dispatch(setZoom2(Math.min(zoom2 + 0.25, 3)));
    const handleZoomOut = () => dispatch(setZoom2(Math.max(zoom2 - 0.25, 0.5)));

    const tabs = [
        { key: "document", label: "Document" },
        { key: "metadata", label: "Metadata" },
        { key: "rules",    label: "Validation Rules" },
    ];

    const docStatus = (doc?.status || doc?.detected_status || doc?.st || "missing").toLowerCase();
    const isPresent_pane = docStatus !== "no" && docStatus !== "missing";

    let confidenceValue = 0;
    if (isApiDataObject && documentData.extracted_fields) {
        const fields = Object.values(documentData.extracted_fields);
        if (fields.length > 0) {
            const sum = fields.reduce((acc, f) => acc + (f.confidence || 0), 0);
            confidenceValue = Math.round((sum / fields.length) * 100);
        }
    } else {
        confidenceValue = typeof doc?.confidence === "number"
            ? (doc.confidence < 1 ? Math.round(doc.confidence * 100) : doc.confidence)
            : (doc?.conf || 0);
    }

    const rules = (isApiDataObject && documentData.validation_rules)
        ? documentData.validation_rules
        : (doc?.validation_rules || doc?.rules || []);

    const metadataList = [];
    if (isApiDataObject && documentData.metadata) {
        Object.entries(documentData.metadata).forEach(([key, val]) => {
            metadataList.push({ lbl: key.replace(/_/g, " ").toUpperCase(), val: String(val), isTechnical: true });
        });
    }
    if (isApiDataObject && documentData.extracted_fields) {
        Object.entries(documentData.extracted_fields).forEach(([key, info]) => {
            const baseLabel = key.replace(/_/g, " ").replace(/s$/, "").toUpperCase();
            const val = info.value;
            const explodeObject = (obj, prefix) =>
                Object.entries(obj).map(([k, v]) => ({
                    lbl: `${prefix} ${k.replace(/_/g, " ").toUpperCase()}`.trim(),
                    val: v === null ? "None" : String(v),
                    isExtracted: true,
                }));
            if (Array.isArray(val)) {
                val.forEach((item, idx) => {
                    const suffix = val.length > 1 ? ` (${idx + 1})` : "";
                    if (typeof item === "object" && item !== null) {
                        metadataList.push(...explodeObject(item, baseLabel).map(card => ({ ...card, lbl: `${card.lbl}${suffix}` })));
                    } else {
                        metadataList.push({ lbl: `${baseLabel}${suffix}`, val: String(item), isExtracted: true });
                    }
                });
            } else if (typeof val === "object" && val !== null) {
                metadataList.push(...explodeObject(val, baseLabel));
            } else {
                metadataList.push({ lbl: key.replace(/_/g, " ").toUpperCase(), val: String(val), isExtracted: true });
            }
        });
    }
    if (metadataList.length === 0) {
        const fallback = doc?.metadata || [];
        metadataList.push(...fallback.map(m => ({ lbl: m.lbl || m.label, val: m.val || m.value })));
    }

    return (
        <div className="flex flex-col h-[620px] overflow-hidden">

            {/* ── Tab bar ── */}
            <div className="flex items-stretch border-b border-gray-100 bg-white min-h-[48px] overflow-hidden">

                {/* Mobile back button */}
                <button
                    onClick={() => setMobileDetail(false)}
                    className="md:hidden flex items-center text-[13px] font-semibold text-gray-500 border-r border-gray-200 bg-white hover:bg-gray-50 px-3 transition flex-shrink-0"
                >
                    List
                </button>

                <div className="flex flex-1 items-stretch overflow-hidden min-w-0">

                    {/* Filename — capped so it doesn't push tabs off */}
                    <div className="flex items-center py-2 px-3 border-r border-gray-100 flex-shrink-0 max-w-[160px]">
                        <span className="text-sm font-semibold text-gray-800 truncate" title={
                            doc?.file_name || doc?.file || doc?.filename ||
                            (doc?.pdf_url ? doc.pdf_url.split("/").pop() : "Select a document")
                        }>
                            {doc?.file_name || doc?.file || doc?.filename ||
                             (doc?.pdf_url ? doc.pdf_url.split("/").pop() : "Select a document")}
                        </span>
                    </div>

                    {/* Tabs + confidence — scrollable row */}
                    <div className="flex flex-row justify-between items-stretch overflow-x-auto scrollbar-none flex-1">
                        <div className="flex">
                        {doc && tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex-shrink-0 flex items-center px-3 sm:px-4 text-[13px] font-semibold transition-colors whitespace-nowrap border-b-2
                                    ${activeTab === t.key
                                        ? "text-indigo-600 border-indigo-600"
                                        : "text-gray-400 hover:text-gray-600 border-transparent"}`}
                            >
                                {t.label}
                            </button>
                        ))}
                        </div>
                        {confidenceValue > 0 && (
                            <div className="flex items-center px-3 flex-shrink-0 border-b-2 border-transparent">
                                <span className="text-[11px] font-bold text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    AI: {confidenceValue}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">

                {/* Document tab */}
                {activeTab === "document" && (
                    doc && (isPresent_pane || (isApiDataObject && documentData.selected_document?.blob_url)) ? (
                        <div className="flex flex-col">
                            {/* Zoom toolbar — sticky so it stays visible while scrolling */}
                            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <button onClick={handleZoomIn} title="Zoom in"
                                    className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-primary transition">
                                    <ZoomIn size={13} />
                                </button>
                                <button onClick={handleZoomOut} title="Zoom out"
                                    className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-primary transition">
                                    <ZoomOut size={13} />
                                </button>
                                <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                                    {Math.round(zoom2 * 100)}%
                                </span>
                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                                    className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-primary px-2.5 py-1.5 rounded-md transition">
                                    <ExternalLink size={11} /> Open
                                </a>
                            </div>

                            {/* PDF canvas — horizontal scroll when zoomed */}
                            <div className="overflow-x-auto">
                                <PdfCanvasViewer
                                    url={pdfUrl}
                                    zoom={zoom2}
                                    initialPage={
                                        (isPresent_pane && isApiDataObject && documentData?.metadata?.pages?.length > 0)
                                            ? documentData.metadata.pages[0] : 1
                                    }
                                    pageRanges={
                                        (isPresent_pane && isApiDataObject && documentData?.metadata?.pages?.length > 0)
                                            ? documentData.metadata.pages : null
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-16 bg-gray-50">
                            <XCircle size={40} className="text-gray-200 mb-3" />
                            <p className="text-sm font-semibold text-gray-400">
                                {doc ? (doc.document_name || doc.name) : "No document selected"}
                            </p>
                            <p className="text-xs mt-1 text-gray-300">Document not yet uploaded</p>
                        </div>
                    )
                )}

                {/* Metadata tab */}
                {activeTab === "metadata" && doc && (
                    <div className="py-4 px-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Document Metadata
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {metadataList.map((m, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{m.lbl}</p>
                                    <p className="font-semibold text-gray-800 break-all text-sm font-mono">{m.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rules tab */}
                {activeTab === "rules" && doc && (
                    <div className="py-4 px-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Validation Results
                        </p>
                        <div className="flex flex-col gap-2">
                            {rules.map((r, ri) => {
                                const isPass   = r.status === "pass" || r === true;
                                const ruleName = r.name || doc?.ruleNames?.[ri] || "Rule";
                                const desc     = r.description;
                                return (
                                    <div key={ri}
                                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-gray-600 font-medium text-sm">{ruleName}</span>
                                            {desc && <span className="text-[11px] text-gray-400">{desc}</span>}
                                        </div>
                                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full
                                            ${isPass ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                                            {isPass ? <><Check size={11} /> Pass</> : <><X size={11} /> Fail</>}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentView;