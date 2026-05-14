import React, { useState, useRef, useEffect } from "react";
import { X, Check, ChevronDown, Search, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setValidatorDocDetails, setPolicyExtractedFields } from "../../../store/slices/validatorSetupSlice";
import { createValidatorDocDetails, getValidatorDocDetails, deleteValidatorDocDetails, updateValidatorDocDetails, getPolicyExtractedFields } from "../../api/validatorApiCall";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
const MAX_VISIBLE_FIELDS = 2;

// ── Skeleton rows (desktop) ───────────────────────────────────────────────────
const SkeletonDesktopRows = ({ rows = 5 }) => (
    <React.Fragment>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={`skel-d-${i}`} className="grid grid-cols-[50px_220px_120px_1fr_80px_100px] gap-4 px-5 py-3 border-b border-gray-100 last:border-0 items-center">
                <div className="w-5 h-5 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-3 w-36 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="flex gap-1.5">
                    <div className="h-5 w-20 bg-gray-100 rounded-md animate-pulse" />
                    <div className="h-5 w-16 bg-gray-100 rounded-md animate-pulse" />
                </div>
                <div className="h-3 w-6 bg-gray-100 rounded-full animate-pulse" />
                <div className="flex gap-2">
                    <div className="w-7 h-7 bg-gray-100 rounded-md animate-pulse" />
                    <div className="w-7 h-7 bg-gray-100 rounded-md animate-pulse" />
                </div>
            </div>
        ))}
    </React.Fragment>
);

// ── Skeleton cards (mobile) ───────────────────────────────────────────────────
const SkeletonMobileCards = ({ count = 4 }) => (
    <React.Fragment>
        {Array.from({ length: count }).map((_, i) => (
            <div key={`skel-m-${i}`} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                        <div className="h-3.5 w-36 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-md animate-pulse" />
                        <div className="w-7 h-7 bg-gray-100 rounded-md animate-pulse" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <div className="h-2.5 w-24 bg-gray-100 rounded-full animate-pulse" />
                    <div className="flex gap-1.5">
                        <div className="h-5 w-20 bg-gray-100 rounded-md animate-pulse" />
                        <div className="h-5 w-16 bg-gray-100 rounded-md animate-pulse" />
                    </div>
                </div>
            </div>
        ))}
    </React.Fragment>
);

// ── Skeleton header badges ────────────────────────────────────────────────────
const SkeletonHeaderBadges = () => (
    <div className="flex items-center gap-1.5 flex-wrap">
        <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-7 w-28 bg-gray-100 rounded-md animate-pulse" />
    </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, onClose }) => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
            <div key={t.id} style={{ animation: "slideIn 0.25s ease" }}
                className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 min-w-[260px] max-w-[320px]">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${t.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
                    {t.type === "success" ? <Check size={13} className="text-green-500" /> : <X size={13} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-800">{t.title}</p>
                    {t.subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{t.subtitle}</p>}
                </div>
                <button onClick={() => onClose(t.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0"><X size={13} /></button>
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
                Are you sure you want to remove <span className="font-semibold text-gray-800">"{doc?.display_name}"</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
                <button onClick={onCancel} className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-all">Cancel</button>
                <button onClick={onConfirm} className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all">
                    <Trash2 size={13} /> Remove
                </button>
            </div>
        </div>
    </div>
);

const Toggle = ({ checked, onChange }) => (
    <button onClick={onChange}
        className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-[#6B55E8]" : "bg-gray-300"}`}>
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
);

const FieldTag = ({ label }) => (
    <span className="text-[11px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
        {label}
    </span>
);

const ExtraFieldsBadge = ({ fields }) => {
    const [open, setOpen] = useState(false);
    const [popupStyle, setPopupStyle] = useState({});
    const ref = useRef(null);
    const popRef = useRef(null);
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const handleToggle = (e) => {
        e.stopPropagation();
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const popupW = 220;
            const popupH = 200;
            const spaceRight = window.innerWidth - rect.left;
            const spaceBelow = window.innerHeight - rect.bottom;
            const style = {};
            if (spaceRight < popupW) { style.right = 0; style.left = "auto"; } else { style.left = 0; style.right = "auto"; }
            if (spaceBelow < popupH) { style.bottom = "100%"; style.top = "auto"; style.marginBottom = "4px"; } else { style.top = "100%"; style.bottom = "auto"; style.marginTop = "4px"; }
            setPopupStyle(style);
        }
        setOpen((o) => !o);
    };
    return (
        <div className="relative" ref={ref}>
            <button onClick={handleToggle} className="text-[11px] font-semibold text-gray-400 hover:text-[#6B55E8] transition-colors">
                +{fields.length} More
            </button>
            {open && (
                <div ref={popRef} style={popupStyle} className="absolute z-50 top-8 sm:left-0 left-[-140px] bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[200px] w-max max-w-[260px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{fields.length} more field{fields.length > 1 ? "s" : ""}</p>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                        {fields.map((f) => <FieldTag key={f} label={f} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

const ExtractFieldsInput = ({ fields, onChange }) => {
    const { policyExtractedFields } = useSelector((state) => state.validatorSetup);
    const [inputVal, setInputVal] = useState("");
    const [showSug, setShowSug] = useState(false);
    const [dropUpward, setDropUpward] = useState(false);
    const inputRef = useRef(null);
    const wrapRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSug(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const openSuggestions = () => {
        if (wrapRef.current) {
            const rect = wrapRef.current.getBoundingClientRect();
            setDropUpward(window.innerHeight - rect.bottom < 220);
        }
        setShowSug(true);
    };

    const suggestions = policyExtractedFields.filter(
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
        if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) { e.preventDefault(); addField(inputVal); }
        else if (e.key === "Backspace" && !inputVal && fields.length > 0) onChange(fields.slice(0, -1));
    };

    return (
        <div ref={wrapRef} className="relative">
            <div className="min-h-[40px] border border-gray-200 rounded-lg p-2.5 flex flex-wrap gap-1.5 cursor-text focus-within:border-[#6B55E8] focus-within:ring-1 focus-within:ring-[#6B55E8]/20 transition-all"
                onClick={() => { inputRef.current?.focus(); openSuggestions(); }}>
                {fields.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-[11px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-mono">
                        {f}
                        <button onClick={(e) => { e.stopPropagation(); removeField(f); }} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                    </span>
                ))}
                <input ref={inputRef} value={inputVal} onChange={(e) => { setInputVal(e.target.value); setShowSug(true); }}
                    onKeyDown={handleKeyDown} onFocus={openSuggestions}
                    placeholder={fields.length === 0 ? "Type field name and press Enter..." : ""}
                    className="flex-1 min-w-[160px] text-[12px] text-gray-600 bg-transparent outline-none placeholder-gray-300" />
            </div>
            {showSug && (
                <div className={`absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ${dropUpward ? "bottom-full mb-1" : "top-full mt-1"}`}>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <Search size={12} className="text-gray-500 flex-shrink-0" />
                        <span className="text-[11px] text-gray-500">{inputVal ? `Results for "${inputVal}"` : "Available fields"}</span>
                        <span className="ml-auto text-[10px] text-gray-400">{suggestions.length} found</span>
                    </div>
                    {suggestions.length > 0 ? (
                        <div className="max-h-44 overflow-y-auto">
                            {suggestions.map((s) => (
                                <button key={s} onMouseDown={(e) => { e.preventDefault(); addField(s); }}
                                    className="w-full text-left px-3 py-2 text-[12px] font-mono text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between group">
                                    <span>{s}</span>
                                    <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">+ add</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="px-3 py-3 text-center text-[12px] text-gray-400">No results found for "{inputVal}"</p>
                    )}
                </div>
            )}
            <p className="text-[11px] text-gray-400 mt-1.5"><strong>Backspace</strong> to remove last</p>
        </div>
    );
};

const AddDocumentPanel = ({ open, onClose, onSave, editDoc }) => {
    const { selectedPolicyId, documentTypes, policyExtractedFields } = useSelector((state) => state.validatorSetup);
    const dispatch = useDispatch();
    const isEdit = !!editDoc;
    const [docType, setDocType] = useState("");
    const [required, setRequired] = useState(true);
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState([]);
    const [dropOpen, setDropOpen] = useState(false);
    const [docSearch, setDocSearch] = useState("");
    const dropRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (editDoc) {
                setDocType(editDoc.display_name || "");
                setRequired(editDoc.required === true);
                setDescription(editDoc.description || "");
                setFields(editDoc.extract_fields || []);
            } else {
                setDocType(""); setRequired(true); setDescription(""); setFields([]);
            }
            setDropOpen(false); setDocSearch("");
        }
    }, [open, editDoc]);

    useEffect(() => {
        const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const canSave = docType.trim() !== "" && fields.length > 0;
    const filteredDocs = documentTypes?.filter((d) => d.display_name.toLowerCase().includes(docSearch.toLowerCase())) || [];


    const handleSave = async () => {
        if (!canSave) return;
        try {
            setLoading(true);
            const formattedType = docType
                .toLowerCase()
                .replace(/\s+/g, "_");
            const payload = { document_type: formattedType, display_name: docType, required, description, extract_fields: fields };
            if (isEdit && editDoc?.id) {
                await updateValidatorDocDetails(editDoc.id, payload);
            } else {
                await createValidatorDocDetails(payload, selectedPolicyId);
            }
            await getValidatorDocDetails(setValidatorDocDetails, dispatch, selectedPolicyId);
            onSave({ id: editDoc?.id, name: docType, status: required ? "Required" : "Optional", description, fields });
            onClose();
        } catch (error) {
            console.error("Save Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />}
            <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-800">{isEdit ? "Edit Document" : "Add Document"}</h2>
                        <p className="text-[12px] text-gray-400 mt-0.5">Configure document type and extraction fields.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"><X size={14} /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Document Type
                        </label>
                        <div className="relative" ref={dropRef}>
                            <button onClick={() => setDropOpen((o) => !o)}
                                className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-gray-50 hover:border-[#6B55E8] transition-colors">
                                <span className={docType ? "text-gray-700" : "text-gray-300"}>{docType || "Select document type..."}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                            </button>
                            {dropOpen && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5">
                                            <Search size={12} className="text-gray-400 flex-shrink-0" />
                                            <input autoFocus value={docSearch} onChange={(e) => setDocSearch(e.target.value)} placeholder="Search document type..."
                                                className="flex-1 text-[12px] bg-transparent outline-none text-gray-600 placeholder-gray-300" />
                                        </div>
                                    </div>
                                    <div className="max-h-44 overflow-y-auto">
                                        {filteredDocs.map((d) => (
                                            <button key={d.name} onMouseDown={() => { setDocType(d.display_name); setDropOpen(false); getPolicyExtractedFields(d.name, dispatch, setPolicyExtractedFields); setDocSearch(""); }}
                                                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between ${docType === d.display_name ? "text-indigo-600 font-semibold bg-indigo-50" : "text-gray-700"}`}>
                                                <span>{d.display_name}</span>
                                                {docType === d.display_name && <Check size={12} className="text-indigo-500" />}
                                            </button>
                                        ))}
                                        {filteredDocs.length === 0 && <p className="px-3 py-3 text-[12px] text-gray-400 text-center">No results found for "{docSearch}"</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the document purpose..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 resize-none outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Extract Fields
                            {fields.length === 0 && <span className="ml-1 text-[10px] text-red-400 font-medium normal-case tracking-normal">(at least 1 required)</span>}
                        </label>
                        <ExtractFieldsInput fields={fields} onChange={setFields} />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                    <button onClick={onClose} className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={!canSave || loading}
                        className={`flex items-center gap-2 text-[13px] font-semibold px-5 py-2 rounded-lg transition-all ${canSave && !loading ? "text-white bg-[#6B55E8] hover:bg-[#5a45d4]" : "text-white bg-gray-300 cursor-not-allowed opacity-60"}`}>
                        <Check size={13} /> {loading ? "Saving..." : isEdit ? "Update Document" : "Save Document"}
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const DocConfigTable = () => {
    const { validatorDocDetails, selectedPolicyId, documentTypes } = useSelector((state) => state.validatorSetup);
    const dispatch = useDispatch();
    const [localDocs, setLocalDocs] = useState(null);
    const docs = localDocs || validatorDocDetails?.documents || [];
    const [loading, setLoading] = useState(true);
    const [panelOpen, setPanelOpen] = useState(false);
    const [editDoc, setEditDoc] = useState(null);
    const [confirmDoc, setConfirmDoc] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [sortOrder, setSortOrder] = useState(null);

    const sortedDocs = [...docs].sort((a, b) => {
        if (!sortOrder) return 0;
        const nameA = a.display_name.toLowerCase();
        const nameB = b.display_name.toLowerCase();
        return sortOrder === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
    });

    // Hide loader once documents arrive
    useEffect(() => {
        if (validatorDocDetails?.documents !== undefined) {
            setLoading(false);
        }
    }, [validatorDocDetails]);

    const addToast = (type, title, subtitle) => {
        const id = Date.now();
        setToasts((p) => [...p, { id, type, title, subtitle }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const openAdd = () => { setEditDoc(null); setPanelOpen(true); dispatch(setPolicyExtractedFields([])); };
    const openEdit = (doc) => {
        setEditDoc(doc); setPanelOpen(true);
        const formatted = doc.display_name.toLowerCase().replace(/\s+/g, "_");
        getPolicyExtractedFields(formatted, dispatch, setPolicyExtractedFields);
    };
    const closePanel = () => { setPanelOpen(false); setEditDoc(null); };

    const handleSaveDoc = ({ id, name, status, description, fields }) => {
        const current = localDocs || validatorDocDetails?.documents || [];
        if (id) {
            setLocalDocs(current.map((d) => d.id === id ? { ...d, display_name: name, required: status === "Required", description, extract_fields: fields } : d));
            addToast("success", "Document Updated", `${name} updated successfully.`);
        } else {
            const nextId = `local-${Date.now()}`;
            setLocalDocs([...current, { id: nextId, display_name: name, required: status === "Required", description, extract_fields: fields, extract_fields_count: fields.length }]);
            addToast("success", "Document Added", `${name} added.`);
        }
    };

    const handleDeleteConfirm = async () => {
        await deleteValidatorDocDetails(confirmDoc.id);
        await getValidatorDocDetails(setValidatorDocDetails, dispatch, selectedPolicyId);
        setLocalDocs(null);
        addToast("error", "Document Removed", `${confirmDoc.display_name} has been removed.`);
        setConfirmDoc(null);
    };

    const handleDeleteClick = (e, doc) => { e.stopPropagation(); setConfirmDoc(doc); };

    const ActionButtons = ({ doc }) => (
        <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); openEdit(doc); }}
                className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 hover:border-indigo-400 transition-colors" title="Edit">
                <Pencil size={12} />
            </button>
            <button onClick={(e) => { handleDeleteClick(e, doc); }}
                className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-400 hover:bg-red-50 transition-colors" title="Remove">
                <Trash2 size={12} />
            </button>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <Toast toasts={toasts} onClose={removeToast} />
            {confirmDoc && <ConfirmDialog doc={confirmDoc} onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDoc(null)} />}
            <AddDocumentPanel open={panelOpen} onClose={closePanel} onSave={handleSaveDoc} editDoc={editDoc} />

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-[16px] font-bold text-gray-800 tracking-tight">Documents Configuration</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Click the edit icon to view or edit details and extraction fields</p>
                </div>
                {loading ? <SkeletonHeaderBadges /> : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{validatorDocDetails?.validator?.documents_count?.total || 0} Total</span>
                        <span className="bg-green-50 text-green-600 border border-green-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{validatorDocDetails?.validator?.documents_count?.required || 0} Required</span>
                        <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{validatorDocDetails?.validator?.documents_count?.optional || 0} Optional</span>
                        <button onClick={openAdd} className="flex items-center gap-1 text-[12px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-3 py-1.5 rounded-md transition-all">
                            + Add Document
                        </button>
                    </div>
                )}
            </div>

            {/* ── DESKTOP table ── */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-[50px_220px_120px_1fr_80px_100px] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                    {/* Replace just this one header cell in your .map() */}
                    {["#", "DOCUMENT TYPE", "STATUS", "EXTRACT FIELDS", "FIELDS", "ACTIONS"].map((h) => {
                        if (h === "DOCUMENT TYPE") {
                            return (
                                <button
                                    key={h}
                                    onClick={() =>
                                        setSortOrder((prev) =>
                                            prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
                                        )
                                    }
                                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-indigo-500 transition-colors"
                                >
                                    {h}
                                    {sortOrder === "asc" && <ArrowUp size={11} className="text-indigo-500" />}
                                    {sortOrder === "desc" && <ArrowDown size={11} className="text-indigo-500" />}
                                    {!sortOrder && <ArrowUpDown size={11} className="text-gray-300" />}
                                </button>
                            );
                        }
                        return (
                            <p key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</p>
                        );
                    })}
                </div>
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <SkeletonDesktopRows rows={5} />
                    ) : sortedDocs.length > 0 ? (
                        sortedDocs.map((doc, index) => {
                            const visibleFields = (doc?.extract_fields || []).slice(0, MAX_VISIBLE_FIELDS);
                            const hiddenFields = (doc?.extract_fields || []).slice(MAX_VISIBLE_FIELDS);
                            return (
                                <div key={index} className="grid grid-cols-[50px_220px_120px_1fr_80px_100px] gap-4 px-5 py-2.5 hover:bg-gray-50 transition-colors items-center">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex-shrink-0">{index + 1}</div>
                                    <span className="text-[12px] font-bold text-gray-800 truncate">{doc.display_name}</span>
                                    <div>
                                        <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${doc.required === true ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                            {doc.required === true ? "Required" : "Optional"}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {visibleFields.map((f) => <FieldTag key={f} label={f} />)}
                                        {hiddenFields.length > 0 && <ExtraFieldsBadge fields={hiddenFields} />}
                                    </div>
                                    <span className="text-[13px] font-bold text-indigo-500">{doc.extract_fields_count ?? (doc?.extract_fields || []).length}</span>
                                    <ActionButtons doc={doc} />
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-5 py-10 text-center text-[13px] text-gray-400">
                            No Documents yet. Click <strong>+ Add Document</strong> to create one.
                        </div>
                    )}
                </div>
            </div>

            {/* ── MOBILE cards ── */}
            <div className="md:hidden flex flex-col gap-2">
                {loading ? (
                    <SkeletonMobileCards count={4} />
                ) : sortedDocs.length > 0 ? (
                    sortedDocs.map((doc, index) => {
                        const visibleFields = (doc?.extract_fields || []).slice(0, MAX_VISIBLE_FIELDS);
                        const hiddenFields = (doc?.extract_fields || []).slice(MAX_VISIBLE_FIELDS);
                        return (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex-shrink-0">{index + 1}</span>
                                        <span className="text-[13px] font-bold text-gray-800 leading-snug truncate">{doc.display_name}</span>
                                    </div>
                                    <ActionButtons doc={doc} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${doc.required === true ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                        {doc.required === true ? "Required" : "Optional"}
                                    </span>
                                    <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                        {doc.extract_fields_count ?? (doc?.extract_fields || []).length} fields
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Extract Fields</p>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {visibleFields.map((f) => <FieldTag key={f} label={f} />)}
                                        {hiddenFields.length > 0 && <ExtraFieldsBadge fields={hiddenFields} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="px-5 py-10 text-center text-[13px] text-gray-400">
                        No Documents yet. Click <strong>+ Add Document</strong> to create one.
                    </div>
                )}
            </div>

            <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }`}</style>
        </div>
    );
};

export default DocConfigTable;