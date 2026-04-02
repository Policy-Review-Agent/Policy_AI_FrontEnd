import React, { useState, useRef, useEffect } from "react";
import { FileText, X, Check, ChevronDown, AlertTriangle, Pencil, Trash2 } from "lucide-react";

const INITIAL_RULES = [
    {
        id: 1,
        name: "insured_name_consistent",
        description: "Named insured / client name must match across all documents",
        matchType: "fuzzy",
        status: true,
        mappings: [
            { doc: "Insurance Receipt", field: "client_name" },
            { doc: "Policy Declarations", field: "named_insured" },
            { doc: "Premium Bill", field: "insured_name" },
            { doc: "Driver License", field: "full_name" },
        ],
    },
    {
        id: 2,
        name: "policy_number_consistent",
        description: "Policy number must match across all documents",
        matchType: "contains",
        status: true,
        mappings: [
            { doc: "Insurance Receipt", field: "policy_number" },
            { doc: "Policy Declarations", field: "policy_number" },
            { doc: "Premium Bill", field: "policy_number" },
            { doc: "Vehicle Record", field: "policy_number" },
        ],
    },
    {
        id: 3,
        name: "effective_date_match",
        description: "Effective date must be consistent across policy documents",
        matchType: "exact",
        status: false,
        mappings: [
            { doc: "Policy Declarations", field: "policy_term_start" },
            { doc: "Proof of Insurance", field: "effective_date" },
            { doc: "Loss Payee Endorsement", field: "effective_date" },
        ],
    },
];

const DOC_OPTIONS = [
    "Insurance Receipt", "Policy Declarations", "Insurance Application",
    "Coverage Acknowledgement", "Driver Exclusion Endorsement",
    "Vehicle Release Authorization", "Proof of Insurance",
    "Loss Payee Endorsement", "Umbrella Policy", "Vehicle Record",
    "Identification Document", "Privacy Policy", "Passport", "Driver License",
];

const FIELD_OPTIONS = [
    "client_name", "policy_number", "payment_amount", "payment_date",
    "named_insured", "policy_term_start", "policy_term_end", "coverage_amount",
    "agent_name", "number_of_drivers", "number_of_vehicles", "date_of_birth",
    "agent_fee_amount", "signatures", "excluded_drivers", "insured_name",
    "effective_date", "expiration_date", "lienholder_name", "vehicle_vin",
    "coverage_limit", "owner_name", "vin_number", "vehicle_make",
    "vehicle_model_year", "license_plate", "full_name", "id_type",
    "passport_number", "nationality", "license_number", "state",
    "payment_method", "premium_amount", "customer_name",
];

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

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, onClose }) => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 min-w-[260px] max-w-[320px]"
                style={{ animation: "slideIn 0.25s ease" }}>
                <div className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${t.type === "success" ? "bg-green-50" : t.type === "error" ? "bg-red-50" : "bg-gray-100"
                    }`}>
                    {t.type === "success" && <Check size={13} className="text-green-500" />}
                    {t.type === "error" && <X size={13} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-800">{t.title}</p>
                    {t.subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{t.subtitle}</p>}
                </div>
                <button onClick={() => onClose(t.id)} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                    <X size={13} />
                </button>
            </div>
        ))}
    </div>
);

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
const ConfirmDialog = ({ rule, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                    <h3 className="text-[15px] font-bold text-gray-800">Remove Rule</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">This action cannot be undone.</p>
                </div>
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-gray-800 font-mono">"{rule?.name}"</span> from the configuration?
            </p>
            <div className="flex items-center justify-end gap-3 pt-1">
                <button onClick={onCancel} className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-all">
                    Cancel
                </button>
                <button onClick={onConfirm} className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all">
                    <X size={13} /> Remove
                </button>
            </div>
        </div>
    </div>
);

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
    <button onClick={onChange}
        className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-[#6B55E8]" : "bg-gray-300"}`}>
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
);

// ── Custom Dropdown ───────────────────────────────────────────────────────────
const CustomDropdown = ({ value, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleToggle = () => {
        if (!open) {
            const rect = ref.current.getBoundingClientRect();
            setOpenUpward(window.innerHeight - rect.bottom < 160 && rect.top > 160);
        }
        setOpen((o) => !o);
    };

    return (
        <div ref={ref} className="relative flex-1 min-w-0">
            <div onClick={handleToggle}
                className="flex items-center justify-between border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] bg-white cursor-pointer hover:border-[#6B55E8] transition-colors">
                <span className="truncate text-gray-700">{value}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ml-1 ${open ? "rotate-180" : ""}`} />
            </div>
            {open && (
                <div className={`absolute left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto ${openUpward ? "bottom-full mb-1" : "top-full mt-1"}`}
                    style={{ scrollbarWidth: "none" }}>
                    {options.map((item) => (
                        <div key={item} onClick={() => { onChange(item); setOpen(false); }}
                            className={`px-3 py-2 text-[12px] cursor-pointer flex items-center justify-between ${value === item ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                                }`}>
                            <span className="truncate">{item}</span>
                            {value === item && <Check size={12} className="text-indigo-500 flex-shrink-0 ml-2" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Extra mappings popup ──────────────────────────────────────────────────────
const ExtraMappingsBadge = ({ mappings }) => {
    const [open, setOpen] = useState(false);
    const [popupStyle, setPopupStyle] = useState({});
    const ref = useRef(null);
    const popRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Calculate popup position when opening
    const handleToggle = (e) => {
        e.stopPropagation();
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const popupW = 220;
            const popupH = 200; // approx
            const spaceRight = window.innerWidth - rect.left;
            const spaceBelow = window.innerHeight - rect.bottom;

            const style = {};

            // Horizontal: flip to right-aligned if not enough space on the right
            if (spaceRight < popupW) {
                style.right = 0;
                style.left = "auto";
            } else {
                style.left = 0;
                style.right = "auto";
            }

            // Vertical: flip upward if not enough space below
            if (spaceBelow < popupH) {
                style.bottom = "100%";
                style.top = "auto";
                style.marginBottom = "4px";
            } else {
                style.top = "100%";
                style.bottom = "auto";
                style.marginTop = "4px";
            }

            setPopupStyle(style);
        }
        setOpen((o) => !o);
    };

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                onClick={handleToggle}
                className="text-[11px] font-semibold text-gray-400 hover:text-[#6B55E8] transition-colors"
            >
                +{mappings.length} More
            </button>

            {open && (
                <div
                    ref={popRef}
                    style={popupStyle}
                    className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[220px] max-w-[260px]"
                >
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {mappings.length} more mapping{mappings.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                        {mappings.map((m, i) => (
                            <div key={i} className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-semibold text-gray-700 font-mono bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">{m.doc}</span>
                                <span className="text-gray-300 text-xs">→</span>
                                <span className="text-[11px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-mono">{m.field}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Mappings list ─────────────────────────────────────────────────────────────
const MappingsList = ({ rule }) => {
    const visibleMappings = rule.mappings.slice(0, MAX_VISIBLE_MAPPINGS);
    const hiddenMappings = rule.mappings.slice(MAX_VISIBLE_MAPPINGS);
    return (
        <div className="flex flex-col gap-1.5">
            {visibleMappings.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-gray-700 font-mono bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md whitespace-nowrap">{m.doc}</span>
                    <span className="text-gray-300 text-xs">→</span>
                    <span className="text-[11px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">{m.field}</span>
                </div>
            ))}
            {hiddenMappings.length > 0 && <ExtraMappingsBadge mappings={hiddenMappings} />}
        </div>
    );
};

// ── Mapping Row ───────────────────────────────────────────────────────────────
const MappingRow = ({ mapping, index, onChange, onRemove }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-3">
        <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-0 mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ms-1">Document</p>
            <div />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ms-5">Field</p>
            <button onClick={() => onRemove(index)} className="p-1 rounded-md border border-red-200 text-red-400 hover:bg-red-50 flex-shrink-0">
                <X size={10} />
            </button>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 w-full">
            <CustomDropdown value={mapping.doc} options={DOC_OPTIONS} onChange={(val) => onChange(index, "doc", val)} />
            <span className="text-gray-400 text-xs text-center px-1">→</span>
            <CustomDropdown value={mapping.field} options={FIELD_OPTIONS} onChange={(val) => onChange(index, "field", val)} />
        </div>
    </div>
);

// ── Add / Edit Rule Panel ─────────────────────────────────────────────────────
const RulePanel = ({ open, onClose, onSave, editRule }) => {
    const isEdit = !!editRule;

    const [checkName, setCheckName] = useState("");
    const [description, setDescription] = useState("");
    const [matchType, setMatchType] = useState("fuzzy");
    const [mappings, setMappings] = useState([{ doc: "Insurance Receipt", field: "customer_name" }]);
    const [matchOpen, setMatchOpen] = useState(false);
    const matchRef = useRef(null);

    // Pre-fill when editRule changes
    useEffect(() => {
        if (open) {
            if (editRule) {
                setCheckName(editRule.name);
                setDescription(editRule.description || "");
                setMatchType(editRule.matchType || "fuzzy");
                setMappings(editRule.mappings?.length ? editRule.mappings : [{ doc: "Insurance Receipt", field: "customer_name" }]);
            } else {
                setCheckName("");
                setDescription("");
                setMatchType("fuzzy");
                setMappings([{ doc: "Insurance Receipt", field: "customer_name" }]);
            }
            setMatchOpen(false);
        }
    }, [open, editRule]);

    useEffect(() => {
        const handler = (e) => { if (matchRef.current && !matchRef.current.contains(e.target)) setMatchOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const canSave = checkName.trim() !== "" && mappings.length > 0;

    const addMapping = () => setMappings((p) => [...p, { doc: "Insurance Receipt", field: "customer_name" }]);
    const removeMapping = (i) => setMappings((p) => p.filter((_, idx) => idx !== i));
    const updateMapping = (i, key, val) => setMappings((p) => p.map((m, idx) => idx === i ? { ...m, [key]: val } : m));

    const handleSave = () => {
        if (!canSave) return;
        onSave({ id: editRule?.id, name: checkName, description, matchType, status: editRule?.status ?? true, mappings });
        onClose();
    };

    const selectedLabel = MATCH_TYPE_OPTIONS.find((o) => o.value === matchType)?.label;

    return (
        <>
            {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />}
            <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-800">{isEdit ? "Edit Validation Rule" : "Add Validation Rule"}</h2>
                        <p className="text-[12px] text-gray-400 mt-0.5">Define a cross-document field consistency check.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors flex-shrink-0">
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">

                    {/* Check Name */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Check Name
                        </label>
                        <input value={checkName} onChange={(e) => setCheckName(e.target.value)}
                            placeholder="e.g. insured_name_consistent"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-mono text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                            placeholder="Describe what this rule checks..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 resize-none outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </div>

                    {/* Match Type */}
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
                                    <div key={o.value} onClick={() => { setMatchType(o.value); setMatchOpen(false); }}
                                        className={`px-3 py-2 text-[13px] cursor-pointer flex items-center justify-between hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${matchType === o.value ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-700"
                                            }`}>
                                        <span>{o.label}</span>
                                        {matchType === o.value && <Check size={13} className="text-indigo-500" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Field Mappings */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Field Mappings
                        </label>
                        <p className="text-[11px] text-gray-400 mb-3">Map a field from each document that should match under this rule.</p>
                        <div className="flex flex-col gap-2">
                            {mappings.map((m, i) => (
                                <MappingRow key={i} mapping={m} index={i} onChange={updateMapping} onRemove={removeMapping} />
                            ))}
                        </div>
                        <button onClick={addMapping}
                            className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[#6B55E8] border border-dashed border-[#6B55E8]/40 hover:border-[#6B55E8] hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all">
                            + Add Mapping
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                    <button onClick={onClose} className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={!canSave}
                        className={`flex items-center gap-2 text-[13px] font-semibold px-5 py-2 rounded-lg transition-all ${canSave ? "text-white bg-[#6B55E8] hover:bg-[#5a45d4] cursor-pointer" : "text-white bg-gray-300 cursor-not-allowed opacity-60"
                            }`}>
                        <Check size={13} /> {isEdit ? "Update Rule" : "Save Rule"}
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const CrossValidationRuleTable = () => {
    const [rules, setRules] = useState(INITIAL_RULES);
    const [panelOpen, setPanelOpen] = useState(false);
    const [editRule, setEditRule] = useState(null);
    const [confirmRule, setConfirmRule] = useState(null);
    const [toasts, setToasts] = useState([]);

    // ── Toast helpers ──
    const addToast = (type, title, subtitle) => {
        const id = Date.now();
        setToasts((p) => [...p, { id, type, title, subtitle }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const openAdd = () => { setEditRule(null); setPanelOpen(true); };
    const openEdit = (rule) => { setEditRule(rule); setPanelOpen(true); };
    const closePanel = () => { setPanelOpen(false); setEditRule(null); };

    const handleToggle = (id) =>
        setRules((p) => p.map((r) => r.id === id ? { ...r, status: !r.status } : r));

    const handleDeleteClick = (e, rule) => { e.stopPropagation(); setConfirmRule(rule); };

    const handleDeleteConfirm = () => {
        setRules((p) => p.filter((r) => r.id !== confirmRule.id));
        addToast("error", "Rule Removed", `"${confirmRule.name}" has been removed.`);
        setConfirmRule(null);
    };

    const handleSaveRule = ({ id, name, description, matchType, status, mappings }) => {
        if (id) {
            setRules((p) => p.map((r) => r.id === id ? { ...r, name, description, matchType, mappings } : r));
            addToast("success", "Rule Updated", `"${name}" updated successfully.`);
        } else {
            setRules((p) => [...p, { id: Date.now(), name, description, matchType, status, mappings }]);
            addToast("success", "Rule Added", `"${name}" added successfully.`);
        }
    };

    const active = rules.filter((r) => r.status).length;
    const inactive = rules.filter((r) => !r.status).length;

    return (
        <div className="flex flex-col gap-4">

            <Toast toasts={toasts} onClose={removeToast} />

            {confirmRule && (
                <ConfirmDialog
                    rule={confirmRule}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setConfirmRule(null)}
                />
            )}

            <RulePanel open={panelOpen} onClose={closePanel} onSave={handleSaveRule} editRule={editRule} />

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-[16px] font-bold text-gray-800 tracking-tight">Cross Validation Rules</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Define rules that compare fields across multiple documents to ensure consistency.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{rules.length} Total</span>
                        <span className="bg-green-50 text-green-600 border border-green-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{active} Active</span>
                        <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">{inactive} Inactive</span>
                    </div>
                    <button onClick={openAdd} className="flex items-center gap-1 text-[12px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-3 py-1.5 rounded-md transition-all">
                        + Add Rule
                    </button>
                </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {["CHECK NAME", "DESCRIPTION", "MATCH TYPE", "FIELD MAPPINGS", "STATUS", "ACTIONS"].map((h) => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-50 transition-colors align-top">
                                    <td className="px-5 py-4 w-[180px]">
                                        <span className="text-[12px] font-bold text-gray-800 font-mono break-all">{rule.name}</span>
                                    </td>
                                    <td className="px-5 py-4 w-[200px]">
                                        <p className="text-[12px] text-gray-500 leading-relaxed">{rule.description}</p>
                                    </td>
                                    <td className="px-5 py-4 w-[120px]">
                                        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${MATCH_TYPE_STYLES[rule.matchType] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                            {rule.matchType}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4"><MappingsList rule={rule} /></td>
                                    <td className="px-5 py-4 w-[150px]">
                                        <div className="flex items-center gap-2.5">
                                            <Toggle checked={rule.status} onChange={() => handleToggle(rule.id)} />
                                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${rule.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                                {rule.status ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 w-[100px]">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(rule)}
                                                className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-indigo-500 hover:border-indigo-200 transition-colors" title="Edit">
                                                <Pencil size={12} />
                                            </button>
                                            <button onClick={(e) => handleDeleteClick(e, rule)}
                                                className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors" title="Remove">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-2">
                {rules.map((rule) => (
                    <div key={rule.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[12px] font-bold text-gray-800 font-mono break-all flex-1">{rule.name}</span>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button onClick={() => openEdit(rule)} className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-indigo-500 hover:border-indigo-200 transition-colors">
                                    <Pencil size={13} />
                                </button>
                                <button onClick={(e) => handleDeleteClick(e, rule)} className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                        <p className="text-[12px] text-gray-500 leading-relaxed">{rule.description}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${MATCH_TYPE_STYLES[rule.matchType] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                {rule.matchType}
                            </span>
                            <div className="flex items-center gap-2">
                                <Toggle checked={rule.status} onChange={() => handleToggle(rule.id)} />
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${rule.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                    {rule.status ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Mappings</p>
                            <MappingsList rule={rule} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-2">
                <button className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg transition-all">Discard Changes</button>
                <button className="flex items-center gap-2 text-[13px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-5 py-2 rounded-lg transition-all">
                    <Check size={13} /> Save Configuration
                </button>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(60px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default CrossValidationRuleTable;