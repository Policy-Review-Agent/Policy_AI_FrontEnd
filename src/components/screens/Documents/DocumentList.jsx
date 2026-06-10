import React from "react";
import { ChevronRight, FileText, AlertCircle, XCircle, Loader2 } from "lucide-react";

const STATUS_META = {
    found: { Icon: FileText, bg: "bg-green-50", ic: "text-green-500", badge: "bg-green-50 text-green-600", label: "Detected" },
    partial: { Icon: AlertCircle, bg: "bg-amber-50", ic: "text-amber-500", badge: "bg-amber-50 text-amber-600", label: "Partial" },
    missing: { Icon: XCircle, bg: "bg-red-50", ic: "text-red-500", badge: "bg-red-50 text-red-500", label: "Missing" },
    YES: { Icon: FileText, bg: "bg-green-50", ic: "text-green-500", badge: "bg-green-50 text-green-600", label: "Detected" },
    PARTIAL: { Icon: AlertCircle, bg: "bg-amber-50", ic: "text-amber-500", badge: "bg-amber-50 text-amber-600", label: "Partial" },
    NO: { Icon: XCircle, bg: "bg-red-50", ic: "text-red-500", badge: "bg-red-50 text-red-500", label: "Missing" },
};

const DocListItem = ({ d, i, selectedDocViewerIdx, handleSelectDoc }) => {
    const status = d?.status || d?.detected_status || d?.st || "missing";
    const meta = STATUS_META[status] || STATUS_META["missing"];
    const { Icon, bg, ic, badge, label } = meta;
    const isActive = selectedDocViewerIdx === i;

    const name = d?.document_name || d?.name;
    const filename = d?.file_name || d?.file || d?.filename || (d.pdf_url ? d.pdf_url.split('/').pop() : "");

    return (
        <button
            onClick={() => handleSelectDoc(i)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${isActive ? "bg-gray-100 border-l-2 border-l-primary" : ""}`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={13} className={ic} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800 truncate" title={name}>{name}</p>
                <p className="text-[10.5px] text-gray-400 mt-0.5 truncate" title={filename}>{filename}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
                <ChevronRight size={14} className="text-gray-300" />
            </div>
        </button>
    );
};

const DocumentList = ({ activeList, selectedDocViewerIdx, handleSelectDoc, validFilesLength }) => {
    return (
        <div className="border-r border-gray-100 bg-white h-full max-h-[620px] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                <span className="text-sm font-semibold text-gray-800">Documents</span>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{validFilesLength} files</span>
            </div>
            <div className="overflow-y-auto flex-1 relative">
                {activeList && activeList.length > 0 ? (
                    activeList.map((d, i) => (
                        <DocListItem
                            key={d.id || i}
                            d={d}
                            i={i}
                            selectedDocViewerIdx={selectedDocViewerIdx}
                            handleSelectDoc={handleSelectDoc}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[150px] gap-3">
                        <Loader2 size={24} className="animate-spin text-primary" />
                        <span className="text-xs font-medium text-gray-400">Loading documents...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentList;
