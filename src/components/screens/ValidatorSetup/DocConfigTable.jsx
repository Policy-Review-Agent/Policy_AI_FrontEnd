import React, { useState, useRef, useEffect } from "react";
import { FileText, X, Check, ChevronDown, Search, AlertTriangle } from "lucide-react";

const INITIAL_DOCS = [
    { id: 1,  name: "Insurance Receipt",            status: "Required", fields: ["client_name", "policy_number", "payment_amount", "payment_date", "receipt_id", "insurer_name"] },
    { id: 2,  name: "Policy Declarations",          status: "Required", fields: ["named_insured", "policy_number", "policy_term_start", "policy_term_end", "coverage_amount", "deductible", "agent_name"] },
    { id: 3,  name: "Insurance Application",        status: "Required", fields: ["named_insured", "policy_number", "number_of_drivers", "number_of_vehicles", "address", "date_of_birth"] },
    { id: 4,  name: "Coverage Acknowledgement",     status: "Required", fields: ["agent_fee_amount", "signatures"] },
    { id: 5,  name: "Driver Exclusion Endorsement", status: "Optional", fields: ["excluded_drivers", "policy_number", "signatures"] },
    { id: 6,  name: "Vehicle Release Authorization",status: "Optional", fields: ["insured_name", "policy_number", "effective_date", "vehicles_listed", "authorization_code"] },
    { id: 7,  name: "Proof of Insurance",           status: "Required", fields: ["policy_number", "insured_name", "effective_date", "expiration_date"] },
    { id: 8,  name: "Loss Payee Endorsement",       status: "Required", fields: ["lienholder_name", "policy_number", "vehicle_vin", "effective_date"] },
    { id: 9,  name: "Umbrella Policy",              status: "Optional", fields: ["policy_number", "coverage_limit", "insured_name"] },
    { id: 10, name: "Vehicle Record",               status: "Required", fields: ["owner_name", "vin_number", "vehicle_make", "vehicle_model_year", "license_plate"] },
    { id: 11, name: "Identification Document",      status: "Required", fields: ["full_name", "id_type", "signatures"] },
    { id: 12, name: "Privacy Policy",               status: "Required", fields: ["signatures"] },
    { id: 13, name: "Passport",                     status: "Required", fields: ["full_name", "passport_number", "nationality", "expiration_date", "date_of_birth"] },
    { id: 14, name: "Driver License",               status: "Required", fields: ["full_name", "license_number", "nationality", "expiration_date", "state"] },
];

const FIELD_SUGGESTIONS = [
    "client_name", "policy_number", "payment_amount", "payment_date", "receipt_id",
    "insurer_name", "named_insured", "policy_term_start", "policy_term_end",
    "coverage_amount", "deductible", "agent_name", "number_of_drivers",
    "number_of_vehicles", "address", "date_of_birth", "agent_fee_amount",
    "signatures", "excluded_drivers", "insured_name", "effective_date",
    "vehicles_listed", "authorization_code", "expiration_date", "lienholder_name",
    "vehicle_vin", "coverage_limit", "owner_name", "vin_number", "vehicle_make",
    "vehicle_model_year", "license_plate", "full_name", "id_type", "passport_number",
    "nationality", "license_number", "state", "payment_method", "premium_amount",
];

const DOC_TYPE_OPTIONS = [
    "Insurance Receipt", "Policy Declarations", "Insurance Application",
    "Coverage Acknowledgement", "Driver Exclusion Endorsement",
    "Vehicle Release Authorization", "Proof of Insurance",
    "Loss Payee Endorsement", "Umbrella Policy", "Vehicle Record",
    "Identification Document", "Privacy Policy", "Passport", "Driver License",
    "Custom Document",
];

const MAX_VISIBLE_FIELDS = 2;

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, onClose }) => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
            <div
                key={t.id}
                className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 min-w-[260px] max-w-[320px] animate-slide-in"
                style={{ animation: "slideIn 0.25s ease" }}
            >
                {/* Icon */}
                <div className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${
                    t.type === "success" ? "bg-green-50"
                    : t.type === "error"  ? "bg-red-50"
                    : "bg-gray-100"
                }`}>
                    {t.type === "success" && <Check size={13} className="text-green-500" />}
                    {t.type === "error"   && <X    size={13} className="text-red-500"   />}
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-800">{t.title}</p>
                    {t.subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{t.subtitle}</p>}
                </div>
                {/* Close */}
                <button onClick={() => onClose(t.id)} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                    <X size={13} />
                </button>
            </div>
        ))}
    </div>
);

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
const ConfirmDialog = ({ doc, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                    <h3 className="text-[15px] font-bold text-gray-800">Remove Document</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">This action cannot be undone.</p>
                </div>
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-gray-800">"{doc?.name}"</span> from the configuration?
            </p>
            <div className="flex items-center justify-end gap-3 pt-1">
                <button
                    onClick={onCancel}
                    className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
                >
                    <X size={13} /> Remove
                </button>
            </div>
        </div>
    </div>
);

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
            checked ? "bg-[#6B55E8]" : "bg-gray-300"
        }`}
    >
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
        }`} />
    </button>
);

// ── Field tag ─────────────────────────────────────────────────────────────────
const FieldTag = ({ label }) => (
    <span className="text-[11px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
        {label}
    </span>
);

// ── Extra fields popup ────────────────────────────────────────────────────────
const ExtraFieldsBadge = ({ fields }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
                className="text-[11px] font-semibold text-gray-400 hover:text-[#6B55E8] transition-colors"
            >
                +{fields.length} More
            </button>
            {open && (
                <div className="absolute z-50 top-8 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[200px] w-max max-w-[260px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        {fields.length} more field{fields.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                        {fields.map((f) => <FieldTag key={f} label={f} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Extract Fields Input ──────────────────────────────────────────────────────
const ExtractFieldsInput = ({ fields, onChange }) => {
    const [inputVal, setInputVal] = useState("");
    const [showSug,  setShowSug]  = useState(false);
    const inputRef = useRef(null);
    const wrapRef  = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSug(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const suggestions = FIELD_SUGGESTIONS.filter(
        (s) => s.toLowerCase().includes(inputVal.toLowerCase()) && !fields.includes(s)
    ).slice(0, 10);

    const addField = (val) => {
        const trimmed = val.trim().replace(/,/g, "");
        if (trimmed && !fields.includes(trimmed)) onChange([...fields, trimmed]);
        setInputVal("");
        inputRef.current?.focus();
    };

    const removeField = (f) => onChange(fields.filter((x) => x !== f));

    const handleKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
            e.preventDefault();
            addField(inputVal);
        } else if (e.key === "Backspace" && !inputVal && fields.length > 0) {
            onChange(fields.slice(0, -1));
        }
    };

    return (
        <div ref={wrapRef} className="relative">
            <div
                className="min-h-[40px] border border-gray-200 rounded-lg p-2.5 flex flex-wrap gap-1.5 cursor-text focus-within:border-[#6B55E8] focus-within:ring-1 focus-within:ring-[#6B55E8]/20 transition-all"
                onClick={() => { inputRef.current?.focus(); setShowSug(true); }}
            >
                {fields.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-[11px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-mono">
                        {f}
                        <button onClick={(e) => { e.stopPropagation(); removeField(f); }} className="hover:text-red-500 transition-colors">
                            <X size={10} />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    value={inputVal}
                    onChange={(e) => { setInputVal(e.target.value); setShowSug(true); }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSug(true)}
                    placeholder={fields.length === 0 ? "Type field name and press Enter..." : ""}
                    className="flex-1 min-w-[160px] text-[12px] text-gray-600 bg-transparent outline-none placeholder-gray-300"
                />
            </div>
            {showSug && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <Search size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[11px] text-gray-400">
                            {inputVal ? `Results for "${inputVal}"` : "Available fields"}
                        </span>
                        <span className="ml-auto text-[10px] text-gray-300">{suggestions.length} found</span>
                    </div>
                    {suggestions.length > 0 ? (
                        <div className="max-h-44 overflow-y-auto">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onMouseDown={(e) => { e.preventDefault(); addField(s); }}
                                    className="w-full text-left px-3 py-2 text-[12px] font-mono text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between group"
                                >
                                    <span>{s}</span>
                                    <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">+ add</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-3 py-3 text-center">
                            <p className="text-[12px] text-gray-400">
                                {inputVal ? `No match — press Enter to add "${inputVal}"` : "All fields added"}
                            </p>
                        </div>
                    )}
                </div>
            )}
            <p className="text-[11px] text-gray-400 mt-1.5">
                Press <strong>Enter</strong> or <strong>,</strong> to add · <strong>Backspace</strong> to remove last
            </p>
        </div>
    );
};

// ── Add / Edit Panel ──────────────────────────────────────────────────────────
const AddDocumentPanel = ({ open, onClose, onSave, editDoc }) => {
    const isEdit = !!editDoc;
    const [docType,     setDocType]     = useState("Insurance Receipt");
    const [required,    setRequired]    = useState(true);
    const [description, setDescription] = useState("");
    const [fields,      setFields]      = useState([]);
    const [dropOpen,    setDropOpen]    = useState(false);
    const [docSearch,   setDocSearch]   = useState("");
    const dropRef = useRef(null);

    useEffect(() => {
        if (open) {
            if (editDoc) {
                setDocType(editDoc.name);
                setRequired(editDoc.status === "Required");
                setDescription(editDoc.description || "");
                setFields(editDoc.fields || []);
            } else {
                setDocType("Insurance Receipt");
                setRequired(true);
                setDescription("");
                setFields([]);
            }
            setDropOpen(false);
            setDocSearch("");
        }
    }, [open, editDoc]);

    useEffect(() => {
        const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const canSave = docType.trim() !== "" && fields.length > 0;

    const filteredDocs = DOC_TYPE_OPTIONS.filter((d) =>
        d.toLowerCase().includes(docSearch.toLowerCase())
    );

    const handleSave = () => {
        if (!canSave) return;
        onSave({ id: editDoc?.id, name: docType, status: required ? "Required" : "Optional", description, fields });
        onClose();
    };

    return (
        <>
            {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />}
            <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "translate-x-full"
            }`}>
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-800">{isEdit ? "Edit Document" : "Add Document"}</h2>
                        <p className="text-[12px] text-gray-400 mt-0.5">Configure document type and extraction fields.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    {/* Document Type */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Document Type
                        </label>
                        <div className="relative" ref={dropRef}>
                            <button
                                onClick={() => setDropOpen((o) => !o)}
                                className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 bg-gray-50 hover:border-[#6B55E8] transition-colors"
                            >
                                <span>{docType}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                            </button>
                            {dropOpen && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5">
                                            <Search size={12} className="text-gray-400 flex-shrink-0" />
                                            <input autoFocus value={docSearch} onChange={(e) => setDocSearch(e.target.value)} placeholder="Search document type..." className="flex-1 text-[12px] bg-transparent outline-none text-gray-600 placeholder-gray-300" />
                                        </div>
                                    </div>
                                    <div className="max-h-44 overflow-y-auto">
                                        {filteredDocs.map((d) => (
                                            <button key={d} onMouseDown={() => { setDocType(d); setDropOpen(false); setDocSearch(""); }}
                                                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between ${docType === d ? "text-indigo-600 font-semibold bg-indigo-50" : "text-gray-700"}`}>
                                                <span>{d}</span>
                                                {docType === d && <Check size={12} className="text-indigo-500" />}
                                            </button>
                                        ))}
                                        {filteredDocs.length === 0 && <p className="px-3 py-3 text-[12px] text-gray-400 text-center">No results</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Required */}
                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Required</label>
                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                            <div>
                                <p className="text-[13px] font-semibold text-gray-700">Mark as Required</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Document must be present for policy to be valid.</p>
                            </div>
                            <Toggle checked={required} onChange={() => setRequired((r) => !r)} />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the document purpose..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 resize-none outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </div>

                    {/* Extract Fields */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Extract Fields
                            {fields.length === 0 && <span className="ml-1 text-[10px] text-red-400 font-medium normal-case tracking-normal">(at least 1 required)</span>}
                        </label>
                        <ExtractFieldsInput fields={fields} onChange={setFields} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                    <button onClick={onClose} className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={!canSave}
                        className={`flex items-center gap-2 text-[13px] font-semibold px-5 py-2 rounded-lg transition-all ${
                            canSave ? "text-white bg-[#6B55E8] hover:bg-[#5a45d4] cursor-pointer" : "text-white bg-gray-300 cursor-not-allowed opacity-60"
                        }`}>
                        <Check size={13} /> {isEdit ? "Update Document" : "Save Document"}
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const DocConfigTable = () => {
    const [docs,        setDocs]        = useState(INITIAL_DOCS);
    const [panelOpen,   setPanelOpen]   = useState(false);
    const [editDoc,     setEditDoc]     = useState(null);
    const [confirmDoc,  setConfirmDoc]  = useState(null); // doc pending delete confirm
    const [toasts,      setToasts]      = useState([]);

    // ── Toast helpers ──
    const addToast = (type, title, subtitle) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, title, subtitle }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    const openAdd  = ()    => { setEditDoc(null);  setPanelOpen(true); };
    const openEdit = (doc) => { setEditDoc(doc);   setPanelOpen(true); };
    const closePanel = ()  => { setPanelOpen(false); setEditDoc(null); };

    const handleSaveDoc = ({ id, name, status, description, fields }) => {
        if (id) {
            setDocs((prev) => prev.map((d) => d.id === id ? { ...d, name, status, description, fields } : d));
            addToast("success", "Document Updated", `${name} updated successfully.`);
        } else {
            setDocs((prev) => [...prev, { id: Date.now(), name, status, description, fields }]);
            addToast("success", "Document Added", `${name} added.`);
        }
    };

    // Step 1: click X → open confirm dialog
    const handleDeleteClick = (e, doc) => {
        e.stopPropagation();
        setConfirmDoc(doc);
    };

    // Step 2: user confirms → actually delete
    const handleDeleteConfirm = () => {
        setDocs((prev) => prev.filter((d) => d.id !== confirmDoc.id));
        addToast("error", "Document Removed", `${confirmDoc.name} has been removed.`);
        setConfirmDoc(null);
    };

    const required = docs.filter((d) => d.status === "Required").length;
    const optional = docs.filter((d) => d.status === "Optional").length;

    return (
        <div className="flex flex-col gap-4">

            {/* Toast */}
            <Toast toasts={toasts} onClose={removeToast} />

            {/* Confirm delete dialog */}
            {confirmDoc && (
                <ConfirmDialog
                    doc={confirmDoc}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setConfirmDoc(null)}
                />
            )}

            {/* Panel */}
            <AddDocumentPanel open={panelOpen} onClose={closePanel} onSave={handleSaveDoc} editDoc={editDoc} />

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-[16px] font-bold text-gray-800 tracking-tight">Documents Configuration</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Click the edit icon to view or edit details and extraction fields</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{docs.length} Total</span>
                    <span className="bg-green-50 text-green-600 border border-green-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{required} Required</span>
                    <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{optional} Optional</span>
                    <button onClick={openAdd} className="flex items-center gap-1 text-[12px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-3 py-1.5 rounded-md transition-all">
                        + Add Document
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-[50px_220px_120px_1fr_80px_100px] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                    {["#", "DOCUMENT TYPE", "STATUS", "EXTRACT FIELDS", "FIELDS", "ACTIONS"].map((h) => (
                        <p key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</p>
                    ))}
                </div>

                <div className="divide-y divide-gray-100">
                    {docs.map((doc) => {
                        const visibleFields = doc.fields.slice(0, MAX_VISIBLE_FIELDS);
                        const hiddenFields  = doc.fields.slice(MAX_VISIBLE_FIELDS);
                        return (
                            <div key={doc.id} className="group grid grid-cols-1 md:grid-cols-[50px_220px_120px_1fr_80px_100px] gap-3 md:gap-4 px-4 py-2.5 hover:bg-gray-50 transition-colors items-center">
                                <div className="hidden md:flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex-shrink-0">
                                    {doc.id}
                                </div>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[12px] font-bold text-gray-800 leading-snug">{doc.name}</span>
                                </div>
                                <div>
                                    <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${doc.status === "Required" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                        {doc.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {visibleFields.map((f) => <FieldTag key={f} label={f} />)}
                                    {hiddenFields.length > 0 && <ExtraFieldsBadge fields={hiddenFields} />}
                                </div>
                                <div className="hidden md:block">
                                    <span className="text-[13px] font-bold text-indigo-500">{doc.fields.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); openEdit(doc); }}
                                        className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 hover:border-indigo-400 transition-colors" title="Edit">
                                        <FileText size={12} />
                                    </button>
                                    <button onClick={(e) => handleDeleteClick(e, doc)}
                                        className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-400 hover:bg-red-50 transition-colors" title="Remove">
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-2">
                <button className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg transition-all">Discard Changes</button>
                <button className="flex items-center gap-2 text-[13px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-5 py-2 rounded-lg transition-all">
                    <Check size={13} /> Save Configuration
                </button>
            </div>

            {/* Inline keyframe for toast animation */}
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(60px); }
                    to   { opacity: 1; transform: translateX(0);    }
                }
                .animate-slide-in { animation: slideIn 0.25s ease; }
            `}</style>
        </div>
    );
};

export default DocConfigTable;