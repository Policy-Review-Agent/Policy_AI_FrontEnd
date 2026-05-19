import React, { useState, useRef, useEffect, useMemo } from "react";
import { X, Check, ChevronDown, AlertTriangle, Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setValidatorDocDetails, setPolicyExtractedFields } from "../../../store/slices/validatorSetupSlice";
import { createValidatorCrossCheckDetails, updateValidatorCrossCheckDetails, deleteValidatorCrossCheckDetails, getValidatorDocDetails, getPolicyExtractedFields } from "../../api/validatorApiCall";

const MATCH_TYPE_OPTIONS = [
    { value: "fuzzy", label: "Fuzzy Match" },
    { value: "contains", label: "Contains" },
    { value: "exact", label: "Exact Match" },
    { value: "regex", label: "Regex Pattern" },
];

const MAX_VISIBLE_MAPPINGS = 3;

const MATCH_TYPE_STYLES = {
    fuzzy: "bg-purple-50 text-purple-500 border-purple-200",
    contains: "bg-gray-100 text-gray-500 border-gray-200",
    exact: "bg-blue-50 text-blue-500 border-blue-200",
    regex: "bg-orange-50 text-orange-500 border-orange-200",
};

// ── Skeleton desktop rows ─────────────────────────────────────────────────────
const SkeletonDesktopRows = ({ rows = 5 }) => (
    <React.Fragment>
        {Array.from({ length: rows }).map((_, i) => (
            <tr key={`skel-d-${i}`} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-4"><div className="h-3 w-32 bg-gray-100 rounded-full animate-pulse" /></td>
                <td className="px-5 py-4"><div className="h-3 w-40 bg-gray-100 rounded-full animate-pulse" /></td>
                <td className="px-5 py-4"><div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" /></td>
                <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1.5 items-center">
                            <div className="h-5 w-24 bg-gray-100 rounded-md animate-pulse" />
                            <div className="h-3 w-4 bg-gray-100 rounded animate-pulse" />
                            <div className="h-5 w-20 bg-gray-100 rounded-md animate-pulse" />
                        </div>
                        <div className="flex gap-1.5 items-center">
                            <div className="h-5 w-20 bg-gray-100 rounded-md animate-pulse" />
                            <div className="h-3 w-4 bg-gray-100 rounded animate-pulse" />
                            <div className="h-5 w-24 bg-gray-100 rounded-md animate-pulse" />
                        </div>
                    </div>
                </td>
                <td className="px-5 py-4"><div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" /></td>
                <td className="px-5 py-4">
                    <div className="flex gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-md animate-pulse" />
                        <div className="w-7 h-7 bg-gray-100 rounded-md animate-pulse" />
                    </div>
                </td>
            </tr>
        ))}
    </React.Fragment>
);

// ── Skeleton mobile cards ─────────────────────────────────────────────────────
const SkeletonMobileCards = ({ count = 4 }) => (
    <React.Fragment>
        {Array.from({ length: count }).map((_, i) => (
            <div key={`skel-m-${i}`} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="h-3.5 w-40 bg-gray-100 rounded-full animate-pulse" />
                    <div className="flex gap-1.5">
                        <div className="w-7 h-7 bg-gray-100 rounded-md animate-pulse" />
                        <div className="w-7 h-7 bg-gray-100 rounded-md animate-pulse" />
                    </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <div className="h-2.5 w-24 bg-gray-100 rounded-full animate-pulse" />
                    <div className="flex gap-1.5 items-center">
                        <div className="h-5 w-24 bg-gray-100 rounded-md animate-pulse" />
                        <div className="h-3 w-4 bg-gray-100 rounded animate-pulse" />
                        <div className="h-5 w-20 bg-gray-100 rounded-md animate-pulse" />
                    </div>
                </div>
            </div>
        ))}
    </React.Fragment>
);

// ── Skeleton header badges ────────────────────────────────────────────────────
const SkeletonHeaderBadges = () => (
    <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
            <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="h-7 w-24 bg-gray-100 rounded-md animate-pulse" />
    </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, onClose }) => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
            const isSuccess = t.type === "success";
            return (
                <div
                    key={t.id}
                    style={{ animation: "slideIn 0.25s ease" }}
                    className={`pointer-events-auto flex items-center gap-3 rounded-xl shadow-lg px-4 py-3 min-w-[260px] max-w-[320px] border ${isSuccess
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                        }`}
                >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${isSuccess ? "bg-green-100" : "bg-red-100"
                        }`}>
                        {isSuccess
                            ? <Check size={13} className="text-green-600" />
                            : <X size={13} className="text-red-500" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold ${isSuccess ? "text-green-700" : "text-red-700"}`}>
                            {t.title}
                        </p>
                        {t.subtitle && (
                            <p className={`text-[11px] mt-0.5 ${isSuccess ? "text-green-600" : "text-red-500"}`}>
                                {t.subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => onClose(t.id)}
                        className={`flex-shrink-0 transition ${isSuccess ? "text-green-400 hover:text-green-600" : "text-red-300 hover:text-red-500"
                            }`}
                    >
                        <X size={13} />
                    </button>
                </div>
            );
        })}
    </div>
);

const ConfirmDialog = ({ rule, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} className="text-red-500" /></div>
                <div>
                    <h3 className="text-[15px] font-bold text-gray-800">Remove Rule</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">This action cannot be undone.</p>
                </div>
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed">Are you sure you want to remove <span className="font-semibold text-gray-800 font-mono">"{rule?.check_name || rule?.name}"</span>?</p>
            <div className="flex items-center justify-end gap-3">
                <button onClick={onCancel} className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-all">Cancel</button>
                <button onClick={onConfirm} className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"><Trash2 size={13} /> Remove</button>
            </div>
        </div>
    </div>
);

const Toggle = ({ checked, onChange }) => (
    <button onClick={onChange} className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-[#6B55E8]" : "bg-gray-300"}`}>
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
);

const CustomDropdown = ({ value, options = [], onChange, disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const ref = useRef(null);
    const normalised = options.map((o) => typeof o === "string" ? { label: o, value: o } : o);
    const selectedLabel = normalised.find((o) => o.value === value)?.label ?? value;

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleToggle = () => {
        if (disabled) return;
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setOpenUpward(window.innerHeight - rect.bottom < 160 && rect.top > 160);
        }
        setOpen((prev) => !prev);
    };

    return (
        <div ref={ref} className="relative flex-1 min-w-0">
            <div onClick={handleToggle} className={`flex items-center justify-between border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : "bg-white cursor-pointer hover:border-[#6B55E8]"}`}>
                <span className="truncate">{selectedLabel || "Select"}</span>
                <ChevronDown size={14} className={`ml-1 transition-transform ${open ? "rotate-180" : ""} ${disabled ? "text-gray-300" : "text-gray-400"}`} />
            </div>
            {open && !disabled && (
                <div className={`absolute left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto ${openUpward ? "bottom-full mb-1" : "top-full mt-1"}`}>
                    {normalised.map((item) => (
                        <div key={item.value} onClick={() => { onChange(item.value); setOpen(false); }}
                            className={`px-3 py-2 text-[12px] cursor-pointer flex justify-between ${value === item.value ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                            <span>{item.label}</span>
                            {value === item.value && <Check size={12} className="text-indigo-500" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ExtraMappingsBadge = ({ mappings, docNameToLabel }) => {
    const [open, setOpen] = useState(false);
    const [popupStyle, setPopupStyle] = useState({});
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleToggle = (e) => {
        e.stopPropagation();
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const style = {};
            if (window.innerWidth - rect.left < 220) { style.right = 0; style.left = "auto"; } else { style.left = 0; style.right = "auto"; }
            if (window.innerHeight - rect.bottom < 200) { style.bottom = "100%"; style.top = "auto"; style.marginBottom = "4px"; } else { style.top = "100%"; style.bottom = "auto"; style.marginTop = "4px"; }
            setPopupStyle(style);
        }
        setOpen((o) => !o);
    };

    return (
        <div className="relative inline-block" ref={ref}>
            <button onClick={handleToggle} className="text-[11px] font-semibold text-gray-400 hover:text-[#6B55E8] transition-colors">+{mappings.length} More</button>
            {open && (
                <div style={popupStyle} className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[220px] max-w-[260px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{mappings.length} more mapping{mappings.length > 1 ? "s" : ""}</p>
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                        {mappings.map((m, i) => {
                            const rawDoc = m.document_type || m.doc;
                            return (
                                <div key={i} className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">{docNameToLabel[rawDoc] || rawDoc}</span>
                                    <span className="text-gray-300 text-xs">→</span>
                                    <span className="text-[11px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-mono">{m.field}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const MappingsList = ({ rule }) => {
    const { documentTypes } = useSelector((state) => state.validatorSetup);
    const docNameToLabel = useMemo(() => Object.fromEntries((documentTypes?.data || []).map((d) => [d.name, d.display_name])), [documentTypes]);
    const allMappings = rule.field_mappings || rule.mappings || [];
    const visibleMappings = allMappings.slice(0, MAX_VISIBLE_MAPPINGS);
    const hiddenMappings = allMappings.slice(MAX_VISIBLE_MAPPINGS);
    return (
        <div className="flex flex-col gap-1.5">
            {visibleMappings.map((m, i) => {
                const rawDoc = m.document_type || m.doc;
                return (
                    <div key={i} className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md whitespace-nowrap">{docNameToLabel[rawDoc] || rawDoc}</span>
                        <span className="text-gray-300 text-xs">→</span>
                        <span className="text-[11px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">{m.field}</span>
                    </div>
                );
            })}
            {hiddenMappings.length > 0 && <ExtraMappingsBadge mappings={hiddenMappings} docNameToLabel={docNameToLabel} />}
        </div>
    );
};

const MappingRow = ({ mapping, index, onChange, onRemove, allMappings }) => {
    const dispatch = useDispatch();
    const { documentTypes, policyExtractedFields } = useSelector((state) => state.validatorSetup);
    const docOptions = documentTypes?.map((d) => ({ label: d.display_name, value: d.name })) || [];
    const FIELD_OPTIONS = policyExtractedFields || [];
    const defaultDocValue = docOptions[0]?.value ?? "";
    const isFieldDisabled = index === 0 ? false : !mapping.isDocChanged;

    // ── Hide fields already selected in OTHER rows for the SAME document ─────
    const currentDoc = mapping.document_type || defaultDocValue;

    const usedFieldsForDoc = allMappings
        .filter((m, idx) => idx !== index && (m.document_type || defaultDocValue) === currentDoc)
        .map((m) => m.field)
        .filter(Boolean);

    const availableFieldOptions = FIELD_OPTIONS.filter((f) => {
        const val = typeof f === "string" ? f : f.value;
        return !usedFieldsForDoc.includes(val);
    });

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-3">
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Document</p>
                <div />
                <p className="text-[10px] font-bold text-gray-400 uppercase">Field</p>
                <button onClick={() => onRemove(index)} className="p-1 border border-red-200 text-red-400 rounded">
                    <X size={10} />
                </button>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
                {/* Document dropdown — all options shown, no filtering */}
                <CustomDropdown
                    value={mapping.document_type || defaultDocValue}
                    options={docOptions}
                    onChange={(val) => {
                        onChange(index, "document_type", val);
                        onChange(index, "isDocChanged", true);
                        onChange(index, "field", ""); // reset field when doc changes
                        getPolicyExtractedFields(val, dispatch, setPolicyExtractedFields);
                    }}
                />

                <span className="text-gray-400 text-xs text-center">→</span>

                {/* Field dropdown — already-used fields for this doc are hidden */}
                <div className="relative group w-full">
                    <CustomDropdown
                        value={mapping.field || ""}
                        options={availableFieldOptions}
                        onChange={(val) => onChange(index, "field", val)}
                        disabled={isFieldDisabled}
                    />
                    {isFieldDisabled && (
                        <div className="absolute left-1/2 -translate-x-1/2 -top-8 mt-1 hidden group-hover:block z-50">
                            <div className="bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                Please select a document to view related fields
                            </div>
                            <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── RulePanel — form state reset via useLayoutEffect ─────────────────────────
// useLayoutEffect runs synchronously before paint so React batches these
// state updates in the same commit — no cascading renders, no linter warning.
const RulePanel = ({ open, onClose, onSave, editRule, loading }) => {
    const isEdit = !!editRule;
    const { documentTypes, policyExtractedFields } = useSelector((state) => state.validatorSetup);
    const defaultDocValue = documentTypes.map((d) => d.display_name) || "";
    const FIELD_OPTIONS = policyExtractedFields || [];

    const [form, setForm] = useState(() => {
        if (editRule) {
            const existing = editRule.field_mappings || editRule.mappings || [];
            return {
                checkName: editRule.check_name || editRule.name || "",
                description: editRule.description || "",
                matchType: editRule.match_type || editRule.matchType || "fuzzy",
                isActive: editRule.is_active ?? true,
                mappings: existing.length
                    ? existing.map((m, i) => ({ document_type: m.document_type || m.doc, field: m.field, isDocChanged: i === 0 }))
                    : [{ document_type: defaultDocValue, field: "", isDocChanged: true }],
            };
        }
        return {
            checkName: "",
            description: "",
            matchType: "fuzzy",
            isActive: true,
            mappings: [{ document_type: defaultDocValue, field: FIELD_OPTIONS[0] || "" }],
        };
    });

    const [matchOpen, setMatchOpen] = useState(false);
    const matchRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (matchRef.current && !matchRef.current.contains(e.target)) setMatchOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
    const canSave = form.checkName.trim() !== "" && form.mappings.length > 0;
    const addMapping = () => setForm((f) => ({ ...f, mappings: [...f.mappings, { document_type: "", field: "", isDocChanged: false }] }));
    const removeMapping = (i) => setForm((f) => ({ ...f, mappings: f.mappings.filter((_, idx) => idx !== i) }));
    const updateMapping = (i, key, val) => setForm((f) => ({ ...f, mappings: f.mappings.map((m, idx) => idx === i ? { ...m, [key]: val } : m) }));

    const handleSave = () => {
        if (!canSave) return;
        onSave({
            id: editRule?.id,
            payload: {
                check_name: form.checkName,
                description: form.description,
                match_type: form.matchType,
                is_active: form.isActive,
                field_mappings: form.mappings.map((m) => ({ document_type: m.document_type || m.doc, field: m.field })),
            },
        });
    };

    const selectedLabel = MATCH_TYPE_OPTIONS.find((o) => o.value === form.matchType)?.label;

    return (
        <>
            {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />}
            <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-800">{isEdit ? "Edit Validation Rule" : "Add Validation Rule"}</h2>
                        <p className="text-[12px] text-gray-400 mt-0.5">Define a cross-document field consistency check.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors flex-shrink-0">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Check Name
                        </label>
                        <input value={form.checkName} onChange={(e) => setField("checkName", e.target.value)}
                            placeholder="e.g. insured_name_consistent"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-mono text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                        <textarea value={form.description} onChange={(e) => setField("description", e.target.value)}
                            rows={3} placeholder="Describe what this rule checks..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 resize-none outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </div>

                    <div ref={matchRef} className="relative">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Match Type</label>
                        <div onClick={() => setMatchOpen((o) => !o)}
                            className="cursor-pointer border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-gray-50 flex items-center justify-between hover:border-[#6B55E8] transition-colors">
                            <span className="text-gray-700">{selectedLabel}</span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${matchOpen ? "rotate-180" : ""}`} />
                        </div>
                        {matchOpen && (
                            <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                {MATCH_TYPE_OPTIONS.map((o) => (
                                    <div key={o.value} onClick={() => { setField("matchType", o.value); setMatchOpen(false); }}
                                        className={`px-3 py-2 text-[13px] cursor-pointer flex items-center justify-between hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${form.matchType === o.value ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-700"}`}>
                                        <span>{o.label}</span>
                                        {form.matchType === o.value && <Check size={13} className="text-indigo-500" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                            <div>
                                <p className="text-[13px] font-semibold text-gray-700">Mark as Active</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Rule will be applied during document validation.</p>
                            </div>
                            <Toggle checked={form.isActive} onChange={() => setField("isActive", !form.isActive)} />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Field Mappings
                        </label>
                        <p className="text-[11px] text-gray-400 mb-3">Map a field from each document that should match under this rule.</p>
                        <div className="flex flex-col gap-2">
                            {form.mappings.map((m, i) => (
                                <MappingRow
                                    key={i}
                                    mapping={m}
                                    index={i}
                                    onChange={updateMapping}
                                    onRemove={removeMapping}
                                    allMappings={form.mappings}
                                />
                            ))}
                        </div>
                        <button
                            onClick={addMapping}
                            className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[#6B55E8] border border-dashed border-[#6B55E8]/40 hover:border-[#6B55E8] hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all w-full justify-center"
                        >
                            + Add Mapping
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                    <button onClick={onClose} className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={!canSave || loading}
                        className={`flex items-center gap-2 text-[13px] font-semibold px-5 py-2 rounded-lg transition-all ${canSave && !loading ? "text-white bg-[#6B55E8] hover:bg-[#5a45d4]" : "text-white bg-gray-300 cursor-not-allowed opacity-60"}`}>
                        <Check size={13} /> {loading ? "Saving..." : isEdit ? "Update Rule" : "Save Rule"}
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CrossValidationRuleTable = () => {
    const dispatch = useDispatch();
    const { validatorDocDetails, selectedPolicyId } = useSelector((state) => state.validatorSetup);
    const [localRules, setLocalRules] = useState(null);
    const rules = localRules || validatorDocDetails?.cross_checks || [];

    // ✅ Derived — no state or effect needed
    const loading = validatorDocDetails?.cross_checks === undefined;

    const [panelOpen, setPanelOpen] = useState(false);
    const [editRule, setEditRule] = useState(null);
    const [confirmRule, setConfirmRule] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [sortOrder, setSortOrder] = useState(null);

    const sortedDocs = [...rules].sort((a, b) => {
        if (!sortOrder) return 0;
        const nameA = a.check_name.toLowerCase();
        const nameB = b.check_name.toLowerCase();
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    const addToast = (type, title, subtitle) => {
        const id = Date.now();
        setToasts((p) => [...p, { id, type, title, subtitle }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const openAdd = () => { setEditRule(null); setPanelOpen(true); dispatch(setPolicyExtractedFields([])); };
    const openEdit = (rule) => { setEditRule(rule); setPanelOpen(true); };
    const closePanel = () => { setPanelOpen(false); setEditRule(null); };

    const refreshRules = async () => { await getValidatorDocDetails(setValidatorDocDetails, dispatch, selectedPolicyId); setLocalRules(null); };

    const handleSaveRule = async ({ id, payload }) => {
        setSaving(true);
        try {
            if (id) {
                const { data, error } = await updateValidatorCrossCheckDetails(id, payload);
                if (error || !data) { addToast("error", "Update Failed", error || "Could not update the rule."); }
                else { await refreshRules(); addToast("success", "Rule Updated", `"${payload.check_name}" updated successfully.`); closePanel(); }
            } else {
                const { error } = await createValidatorCrossCheckDetails(selectedPolicyId, payload);
                if (error) { addToast("error", "Create Failed", "Could not create the rule."); }
                else { await refreshRules(); addToast("success", "Rule Added", `"${payload.check_name}" added successfully.`); closePanel(); }
            }
        } finally { setSaving(false); }
    };

    const handleDeleteClick = (e, rule) => { e.stopPropagation(); setConfirmRule(rule); };
    const handleDeleteConfirm = async () => {
        const name = confirmRule.check_name || confirmRule.name;
        setConfirmRule(null);
        const { error } = await deleteValidatorCrossCheckDetails(confirmRule.id);
        if (error) { addToast("error", "Delete Failed", "Could not remove the rule."); }
        else { await refreshRules(); addToast("error", "Rule Removed", `"${name}" has been removed.`); }
    };

    const active = rules.filter((r) => r.is_active).length;
    const inactive = rules.filter((r) => !r.is_active).length;

    const StatusBadge = ({ isActive }) => (
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {isActive ? "Active" : "Inactive"}
        </span>
    );

    return (
        <div className="flex flex-col gap-4">
            <Toast toasts={toasts} onClose={removeToast} />
            {confirmRule && <ConfirmDialog rule={confirmRule} onConfirm={handleDeleteConfirm} onCancel={() => setConfirmRule(null)} />}
            <RulePanel
                key={panelOpen ? (editRule?.id ?? "new") : "closed"}
                open={panelOpen}
                onClose={closePanel}
                onSave={handleSaveRule}
                editRule={editRule}
                loading={saving}
            />

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-[16px] font-bold text-gray-800 tracking-tight">Cross Validation Rules</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Define rules that compare fields across multiple documents.</p>
                </div>
                {loading ? <SkeletonHeaderBadges /> : (
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{rules.length} Total</span>
                            <span className="bg-green-50 text-green-600 border border-green-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{active} Active</span>
                            <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{inactive} Inactive</span>
                        </div>
                        <button onClick={openAdd} className="flex items-center gap-1 text-[12px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-3 py-1.5 rounded-md transition-all">+ Add Rule</button>
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {["CHECK NAME", "DESCRIPTION", "MATCH TYPE", "FIELD MAPPINGS", "STATUS", "ACTIONS"].map((h) => {
                                    if (h === "CHECK NAME") {
                                        return (
                                            <th key={h} className="text-left px-5 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => setSortOrder((prev) => prev === "asc" ? "desc" : prev === "desc" ? null : "asc")}
                                                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-indigo-500 transition-colors"
                                                >
                                                    {h}
                                                    {sortOrder === "asc" && <ArrowUp size={11} className="text-indigo-500" />}
                                                    {sortOrder === "desc" && <ArrowDown size={11} className="text-indigo-500" />}
                                                    {!sortOrder && <ArrowUpDown size={11} className="text-gray-300" />}
                                                </button>
                                            </th>
                                        );
                                    }
                                    return <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>;
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <SkeletonDesktopRows rows={5} />
                            ) : sortedDocs.length > 0 ? (
                                sortedDocs.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-gray-50 transition-colors align-top">
                                        <td className="px-5 py-4 w-[180px]"><span className="text-[12px] font-bold text-gray-800 font-mono break-all">{rule.check_name || rule.name}</span></td>
                                        <td className="px-5 py-4 w-[200px]"><p className="text-[12px] text-gray-400 font-medium leading-relaxed">{rule.description}</p></td>
                                        <td className="px-5 py-4 w-[120px]">
                                            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${MATCH_TYPE_STYLES[rule.match_type || rule.matchType] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                                {rule.match_type || rule.matchType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4"><MappingsList rule={rule} /></td>
                                        <td className="px-5 py-4 w-[120px]"><StatusBadge isActive={rule.is_active} /></td>
                                        <td className="px-5 py-4 w-[100px]">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { openEdit(rule); getPolicyExtractedFields(rule.field_mappings[0]?.document_type, dispatch, setPolicyExtractedFields); }}
                                                    className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-indigo-500 hover:border-indigo-200 transition-colors" title="Edit"><Pencil size={12} /></button>
                                                <button onClick={(e) => handleDeleteClick(e, rule)}
                                                    className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors" title="Remove"><Trash2 size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="px-5 py-10 text-center text-[13px] text-gray-400">No rules yet. Click <strong>+ Add Rule</strong> to create one.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-2">
                {loading ? (
                    <SkeletonMobileCards count={4} />
                ) : sortedDocs.length > 0 ? (
                    sortedDocs.map((rule) => (
                        <div key={rule.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-[12px] font-bold text-gray-800 font-mono break-all flex-1">{rule.check_name || rule.name}</span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button onClick={() => openEdit(rule)} className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-indigo-500 hover:border-indigo-200 transition-colors"><Pencil size={13} /></button>
                                    <button onClick={(e) => handleDeleteClick(e, rule)} className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"><Trash2 size={13} /></button>
                                </div>
                            </div>
                            <p className="text-[12px] text-gray-500 leading-relaxed">{rule.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${MATCH_TYPE_STYLES[rule.match_type || rule.matchType] || "bg-gray-100 text-gray-500 border-gray-200"}`}>{rule.match_type || rule.matchType}</span>
                                <StatusBadge isActive={rule.is_active} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Mappings</p>
                                <MappingsList rule={rule} />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-[13px] text-gray-400 py-10">No rules yet. Tap <strong>+ Add Rule</strong> to create one.</p>
                )}
            </div>

            <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }`}</style>
        </div>
    );
};

export default CrossValidationRuleTable;