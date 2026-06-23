import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setZoom2 } from "../../../store/slices/validationSlice";
import { baseInstance } from "../../api/instance";
import {
    ZoomIn, ZoomOut, Check, X, XCircle,
    ChevronLeft, ChevronRight, Loader2,
    ExternalLink, Download
} from "lucide-react";

// ─── PDF canvas viewer ────────────────────────────────────────────────────────
const PdfCanvasViewer = ({ pdfUrl, zoom, pageRanges }) => {
    const canvasRef = React.useRef(null);
    const renderTaskRef = React.useRef(null);
    const pdfRef = React.useRef(null);

    const [pageNum, setPageNum] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const minPage = pageRanges?.length > 0 ? pageRanges[0] : 1;
    const maxPage = pageRanges?.length > 1
        ? pageRanges[pageRanges.length - 1]
        : (pageRanges?.length === 1 ? pageRanges[0] : null);

    // ── Load PDF once when pdfUrl changes ─────────────────────────────────
    React.useEffect(() => {
        if (!pdfUrl) { setLoading(false); return; }

        setLoading(true);
        setError(null);
        pdfRef.current = null;
        setPageNum(null);
        setNumPages(0);

        let isMounted = true;

        const init = async () => {
            try {
                // ── Load PDF.js script ─────────────────────────────────────
                if (!window.pdfjsLib) {
                    await new Promise((resolve, reject) => {
                        const existing = document.querySelector('script[src*="pdf.min.js"]');
                        if (existing) { resolve(); return; }
                        const s = document.createElement("script");
                        s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
                        s.async = true;
                        s.onload = resolve;
                        s.onerror = () => reject(new Error("Failed to load PDF.js"));
                        document.head.appendChild(s);
                        setTimeout(() => reject(new Error("PDF.js timeout")), 15000);
                    });
                }

                // Wait for pdfjsLib to be ready
                let attempts = 0;
                while (!window.pdfjsLib && attempts < 20) {
                    await new Promise(r => setTimeout(r, 100));
                    attempts++;
                }
                if (!window.pdfjsLib) throw new Error("PDF.js failed to initialize");

                if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                }

                // ── Fetch PDF using baseInstance (same auth as all other API calls) ──
                // responseType: "arraybuffer" gets raw binary bytes — no JSON corruption
                console.log("[PDF] Fetching:", pdfUrl);
                const response = await baseInstance.get(pdfUrl, {
                    responseType: "arraybuffer",
                });

                console.log("[PDF] Status:", response.status, "| Size:", response.data?.byteLength, "bytes");

                if (!isMounted) return;

                const buffer = response.data;
                if (!buffer || buffer.byteLength === 0) {
                    throw new Error("Empty PDF response from server");
                }

                // ── Load into PDF.js directly from bytes ───────────────────
                const pdfDoc = await window.pdfjsLib.getDocument({
                    data: new Uint8Array(buffer),
                }).promise;

                console.log("[PDF] Loaded successfully, pages:", pdfDoc.numPages);

                if (!isMounted) return;

                const total = pdfDoc.numPages;
                const startPage = Math.min(Math.max(minPage ?? 1, 1), total);

                pdfRef.current = pdfDoc;
                setNumPages(total);
                setPageNum(startPage);
                setLoading(false);

            } catch (err) {
                console.error("[PDF] Load error:", err);
                if (isMounted) {
                    setError(err.message || "Failed to load PDF.");
                    setLoading(false);
                }
            }
        };

        init();
        return () => { isMounted = false; };
    }, [pdfUrl]); // eslint-disable-line

    // ── Jump to page when sidebar item changes ────────────────────────────
    React.useEffect(() => {
        if (!pdfRef.current || !numPages) return;
        const target = Math.min(Math.max(minPage ?? 1, 1), numPages);
        setPageNum(target);
    }, [pageRanges]); // eslint-disable-line

    // ── Render canvas when pageNum or zoom changes ────────────────────────
    React.useEffect(() => {
        const pdf = pdfRef.current;
        if (!pdf || !canvasRef.current || !pageNum) return;

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
            const task = page.render({
                canvasContext: canvas.getContext("2d"),
                viewport,
            });
            renderTaskRef.current = task;
            task.promise.catch((err) => {
                if (err?.name !== "RenderingCancelledException") console.error(err);
            });
        }).catch(console.error);
    }, [pageNum, zoom]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[480px] gap-3 bg-gray-100">
            <Loader2 size={28} className="animate-spin text-primary" />
            <span className="text-sm font-medium text-gray-400">Loading PDF…</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-72 gap-2 bg-gray-100 px-4">
            <XCircle size={36} className="text-red-300" />
            <p className="text-sm font-semibold text-gray-400 text-center">{error}</p>
        </div>
    );

    const effectiveMin = numPages > 0 ? Math.min(Math.max(minPage ?? 1, 1), numPages) : (minPage ?? 1);
    const effectiveMax = numPages > 0
        ? (maxPage ? Math.min(Math.max(maxPage, effectiveMin), numPages) : numPages)
        : (maxPage ?? 1);
    const isSinglePage = effectiveMin === effectiveMax;

    return (
        <div className="flex flex-col items-center gap-3 py-5 px-4 bg-gray-200">
            <div className="shadow-xl rounded-lg overflow-hidden border border-gray-300 bg-white">
                <canvas ref={canvasRef} className="block max-w-full" />
            </div>

            {!isSinglePage && (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                    <button
                        onClick={() => setPageNum(p => Math.max(p - 1, effectiveMin))}
                        disabled={!pageNum || pageNum <= effectiveMin}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
                    >
                        <ChevronLeft size={14} className="text-gray-600" />
                    </button>
                    <span className="text-[11px] font-semibold text-gray-600 tabular-nums select-none">
                        Page {pageNum} of {effectiveMax}
                    </span>
                    <button
                        onClick={() => setPageNum(p => Math.min(p + 1, effectiveMax))}
                        disabled={!pageNum || pageNum >= effectiveMax}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
                    >
                        <ChevronRight size={14} className="text-gray-600" />
                    </button>
                </div>
            )}

            {isSinglePage && pageNum && (
                <div className="bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                    <span className="text-[11px] font-semibold text-gray-500">Page {pageNum}</span>
                </div>
            )}
        </div>
    );
};

// ─── DocumentView ─────────────────────────────────────────────────────────────
const DocumentView = ({ doc, documentData, isApiDataObject, documentPageData, setMobileDetail }) => {
    const dispatch = useDispatch();
    const { zoom2 } = useSelector((s) => s.validation);
    const [activeTab, setActiveTab] = useState("document");

    const handleZoomIn = () => dispatch(setZoom2(Math.min(zoom2 + 0.25, 3)));
    const handleZoomOut = () => dispatch(setZoom2(Math.max(zoom2 - 0.25, 0.5)));

    // ── ALL hooks before any early return ─────────────────────────────────
    const rawPages = isApiDataObject ? documentData?.metadata?.pages : null;
    const pageRanges = React.useMemo(() => {
        if (!rawPages) return null;
        if (Array.isArray(rawPages)) return rawPages;
        if (typeof rawPages === "string") {
            const parts = rawPages.split("-").map(Number).filter(n => !isNaN(n));
            if (parts.length === 1) return [parts[0], parts[0]];
            if (parts.length >= 2) return [parts[0], parts[parts.length - 1]];
        }
        return null;
    }, [rawPages]);

    const pdfUrl = documentPageData?.pdfUrl || null;

    // ── Early return AFTER all hooks ──────────────────────────────────────
    if (documentData === null) return (
        <div className="flex flex-col items-center justify-center h-[620px] gap-3 bg-gray-50">
            <span className="w-7 h-7 border-2 border-[#6B55E8] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-400">Loading document…</span>
        </div>
    );

    const tabs = [
        { key: "document", label: "Document" },
        { key: "metadata", label: "Metadata" },
        { key: "rules", label: "Validation Rules" },
    ];

    const rawStatus = (doc?.status || doc?.detected_status || doc?.st || "missing").toLowerCase();
    const isPresent_pane = rawStatus !== "no" && rawStatus !== "missing" && rawStatus !== "not_found";

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
            metadataList.push({ lbl: key.replace(/_/g, " ").toUpperCase(), val: String(val) });
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
                }));
            if (Array.isArray(val)) {
                val.forEach((item, idx) => {
                    const suffix = val.length > 1 ? ` (${idx + 1})` : "";
                    if (typeof item === "object" && item !== null) {
                        metadataList.push(...explodeObject(item, baseLabel).map(c => ({ ...c, lbl: `${c.lbl}${suffix}` })));
                    } else {
                        metadataList.push({ lbl: `${baseLabel}${suffix}`, val: String(item) });
                    }
                });
            } else if (typeof val === "object" && val !== null) {
                metadataList.push(...explodeObject(val, baseLabel));
            } else {
                metadataList.push({ lbl: key.replace(/_/g, " ").toUpperCase(), val: String(val) });
            }
        });
    }
    if (metadataList.length === 0) {
        (doc?.metadata || []).forEach(m =>
            metadataList.push({ lbl: m.lbl || m.label, val: m.val || m.value })
        );
    }

    const canShowDocument = doc && (isPresent_pane || !!pdfUrl);

    // Open/download use VITE_BASEURL + path so auth token isn't needed in URL
    const fullPdfUrl = pdfUrl
        ? `${import.meta.env.VITE_BASEURL}${pdfUrl}`
        : null;

const handleOpen = async () => {
    if (!pdfUrl) return;
    try {
        const response = await baseInstance.get(pdfUrl, { responseType: "arraybuffer" });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        // Revoke after 60s — enough time for browser to load it
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
        console.error("Open PDF error:", err);
    }
};
    const handleDownload = () => fullPdfUrl && window.open(`${fullPdfUrl}?download=true`, "_blank");

    return (
        <div className="flex flex-col h-[620px] overflow-hidden">

            {/* ── Tab bar ── */}
            <div className="flex items-stretch border-b border-gray-100 bg-white min-h-[48px] overflow-hidden">
                <button
                    onClick={() => setMobileDetail(false)}
                    className="md:hidden flex items-center text-[13px] font-semibold text-gray-500 border-r border-gray-200 bg-white hover:bg-gray-50 px-3 transition flex-shrink-0"
                >
                    List
                </button>

                <div className="flex flex-1 items-stretch overflow-hidden min-w-0">
                    <div className="flex items-center py-2 px-3 border-r border-gray-100 flex-shrink-0 max-w-[160px]">
                        <span
                            className="text-sm font-semibold text-gray-800 truncate"
                            title={doc?.file_name || doc?.file || doc?.filename || "Select a document"}
                        >
                            {doc?.file_name || doc?.file || doc?.filename || "Select a document"}
                        </span>
                    </div>

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
                        <div className="flex items-center gap-1 px-2 flex-shrink-0">
                            {confidenceValue > 0 && (
                                <span className="text-[11px] font-bold text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    AI: {confidenceValue}%
                                </span>
                            )}
                            {/* {pdfUrl && (
                                <button
                                    onClick={handleOpen}
                                    title="Open PDF in new tab"
                                    className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition"
                                >
                                    <ExternalLink size={13} />
                                </button>
                            )} */}
                            {/* {pdfUrl && (
                                <button
                                    onClick={handleDownload}
                                    title="Download PDF"
                                    className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition"
                                >
                                    <Download size={13} />
                                </button>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">

                {activeTab === "document" && (
                    canShowDocument ? (
                        <div className="flex flex-col">
                            <div className="flex justify-between items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-1">
                                    <button onClick={handleZoomIn} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-primary transition">
                                        <ZoomIn size={13} />
                                    </button>
                                    <button onClick={handleZoomOut} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-primary transition">
                                        <ZoomOut size={13} />
                                    </button>
                                    <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                                        {Math.round(zoom2 * 100)}%
                                    </span>
                                    {!pdfUrl && (
                                        <span className="ml-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                                            <Loader2 size={11} className="animate-spin" /> Fetching PDF…
                                        </span>
                                    )}
                                </div>
                                <div className="bg-white border border-gray-200 rounded-md px-1 py-0 flex items-center ">
                                    {pdfUrl && (
                                        <button
                                            onClick={handleOpen}
                                            title="Open PDF in new tab"
                                            className="p-1.5 text-[11px] rounded-md text-gray-400 hover:text-indigo-600  transition"
                                        >
                                            <div className="flex items-center gap-1">
                                                Open<ExternalLink size={13} />
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {pdfUrl ? (
                                    <PdfCanvasViewer
                                        pdfUrl={pdfUrl}
                                        zoom={zoom2}
                                        pageRanges={pageRanges}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[480px] gap-3 bg-gray-100">
                                        <Loader2 size={28} className="animate-spin text-primary" />
                                        <span className="text-sm font-medium text-gray-400">Loading PDF…</span>
                                    </div>
                                )}
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

                {activeTab === "metadata" && doc && (
                    <div className="py-4 px-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Document Metadata</p>
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

                {activeTab === "rules" && doc && (
                    <div className="py-4 px-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Validation Results</p>
                        <div className="flex flex-col gap-2">
                            {rules.map((r, ri) => {
                                const isPass = r.status === "pass" || r === true;
                                const ruleName = r.name || doc?.ruleNames?.[ri] || "Rule";
                                const desc = r.description;
                                return (
                                    <div key={ri} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
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