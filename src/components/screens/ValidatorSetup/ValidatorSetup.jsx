import React, { useState, useRef, useEffect } from "react";
import ValidatorBreadcrumb from "./ValidatorBreadcrumb";
import { validatorNavigate } from "../../../store/slices/navigationSlice";
import { setInsureTypeIndex } from "../../../store/slices/batchSlice";
import { setValidatorSetupList, setValidatorCreate, setValidatorDocDetails, setSelectedPolicyId, setDocumentTypes, setPolicyExtractedFields } from "../../../store/slices/validatorSetupSlice";
import { Shield, ArrowRight, X, Check, ChevronDown, MapPin, Building2, MoreVertical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getValidatorSetupList, createValidatorPolicy, getValidatorDocDetails, getDocumentTypeOptions } from "../../api/validatorApiCall";

// ── US States ─────────────────────────────────────────────────────────────────
const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming",
];

const BG_PRESETS = [
    "bg-gradient-to-br from-[#8B7FF5] to-[#6B55E8]",
    "bg-gradient-to-br from-[#5BC8F5] to-[#0DA89B]",
    "bg-gradient-to-br from-[#F97A2A] to-[#E8450A]",
    "bg-gradient-to-br from-[#F472B6] to-[#EC4899]",
    "bg-gradient-to-br from-[#34D399] to-[#059669]",
    "bg-gradient-to-br from-[#60A5FA] to-[#2563EB]",
];

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
                <button onClick={() => onClose(t.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                    <X size={13} />
                </button>
            </div>
        ))}
    </div>
);

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-[#6B55E8]" : "bg-gray-300"}`}
    >
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
);

// ── Field — MUST be outside panel to prevent remount bug ──────────────────────
const Field = ({ label, required, children }) => (
    <div>
        <label className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

// ── Add Policy Panel ──────────────────────────────────────────────────────────
const AddPolicyPanel = ({ open, onClose, onSave }) => {
    const dispatch = useDispatch();
    const [checklistName, setChecklistName] = useState("");
    const [provider, setProvider] = useState("");
    const [state, setState] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [active, setActive] = useState(true);
    const [stateOpen, setStateOpen] = useState(false);
    const [stateSearch, setStateSearch] = useState("");
    const stateRef = useRef(null);

    useEffect(() => {
        if (open) {
            setChecklistName(""); setProvider(""); setState("");
            setLocation(""); setDescription(""); setActive(true);
            setStateOpen(false); setStateSearch("");
        }
    }, [open]);

    useEffect(() => {
        const handler = (e) => {
            if (stateRef.current && !stateRef.current.contains(e.target)) setStateOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const canSave = checklistName.trim() && provider.trim() && state && location.trim();
    const filteredStates = US_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()));

    // FIX 4: call onSave after API so parent can refresh + show toast
    const handleSave = () => {
        if (!canSave) return;
        const payload = {
            name: checklistName,
            provider,
            state,
            location,
            description,
            is_active: active,
        };
        dispatch(setValidatorCreate(payload));
        createValidatorPolicy(payload);
        getValidatorSetupList(setValidatorSetupList, dispatch); // refresh list after creation
        onSave({ checklistName, provider, state, location, description, active }); // ← triggers parent refresh + toast
        onClose();
    };

    return (
        <>
            {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />}
            <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-800">New AI Configuration Checklist</h2>
                        <p className="text-[12px] text-gray-400 mt-0.5">Define a new AI checklist for document validation.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
                    <Field label="Checklist Name" required>
                        <input value={checklistName} onChange={(e) => setChecklistName(e.target.value)}
                            placeholder="e.g. Auto Insurance New Policy Checklist"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </Field>

                    <Field label="Provider" required>
                        <input value={provider} onChange={(e) => setProvider(e.target.value)}
                            placeholder="e.g. Bridger Insurance Services"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </Field>

                    <Field label="State" required>
                        <div className="relative" ref={stateRef}>
                            <button onClick={() => setStateOpen((o) => !o)}
                                className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-gray-50 hover:border-[#6B55E8] transition-colors">
                                <span className={state ? "text-gray-700" : "text-gray-300"}>{state || "Select state..."}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${stateOpen ? "rotate-180" : ""}`} />
                            </button>
                            {stateOpen && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                        <input autoFocus value={stateSearch} onChange={(e) => setStateSearch(e.target.value)}
                                            placeholder="Search state..."
                                            className="w-full text-[12px] border border-gray-200 rounded-md px-2.5 py-1.5 outline-none focus:border-[#6B55E8] text-gray-600 placeholder-gray-300" />
                                    </div>
                                    <div className="max-h-44 overflow-y-auto">
                                        {filteredStates.map((s) => (
                                            <button key={s} onMouseDown={() => { setState(s); setStateOpen(false); setStateSearch(""); }}
                                                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between ${state === s ? "text-indigo-600 font-semibold bg-indigo-50" : "text-gray-700"}`}>
                                                <span>{s}</span>
                                                {state === s && <Check size={12} className="text-indigo-500" />}
                                            </button>
                                        ))}
                                        {filteredStates.length === 0 && (
                                            <p className="px-3 py-3 text-[12px] text-gray-400 text-center">No results for "{stateSearch}"</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Field>

                    <Field label="Location" required>
                        <input value={location} onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Houston, TX"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </Field>

                    <Field label="Description">
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                            placeholder="Describe the purpose of this AI configuration checklist..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 resize-none outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300" />
                    </Field>

                    <Field label="Status" required>
                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                            <div>
                                <p className="text-[13px] font-semibold text-gray-700">Active</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Checklist will be immediately visible and selectable.</p>
                            </div>
                            <Toggle checked={active} onChange={() => setActive((a) => !a)} />
                        </div>
                    </Field>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                    <button onClick={onClose} className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={!canSave}
                        className={`flex items-center gap-2 text-[13px] font-semibold px-5 py-2 rounded-lg transition-all ${canSave ? "text-white bg-[#6B55E8] hover:bg-[#5a45d4]" : "text-white bg-gray-300 cursor-not-allowed opacity-60"}`}>
                        <Check size={13} /> Create Checklist
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const ValidatorSetup = () => {
    const dispatch = useDispatch();
    const { validatorlist, } = useSelector((state) => state.validatorSetup);
    const cards = validatorlist || [];

    const [panelOpen, setPanelOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);
    const [toasts, setToasts] = useState([]);

    const addToast = (type, title, subtitle) => {
        const id = Date.now();
        setToasts((p) => [...p, { id, type, title, subtitle }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const openAdd = () => setPanelOpen(true);
    const closePanel = () => setPanelOpen(false);

    // FIX 2: no setCards — just refresh from API, Redux updates cards automatically
    const handleSave = ({ checklistName }) => {
        getValidatorSetupList(setValidatorSetupList, dispatch);
        addToast("success", "Checklist Created", `"${checklistName}" has been created successfully.`);
    };

    useEffect(() => {
        getValidatorSetupList(setValidatorSetupList, dispatch);
    }, []);

    return (
        <div className="min-w-0 w-full">
            <ValidatorBreadcrumb crumbs={[{ label: "ValidatorSetup" }]} />

            <Toast toasts={toasts} onClose={removeToast} />

            {/* FIX 3: pass onSave to panel */}
            <AddPolicyPanel open={panelOpen} onClose={closePanel} onSave={handleSave} />

            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">AI Configuration Checklists</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Select a policy to configure document requirements and validation rules.
                    </p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-3 py-1.5 rounded-md transition-all">
                    + New AI Configuration Checklist
                </button>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {cards.map((value, idx) => (
                    <div
                        key={value.id}
                        onMouseEnter={() => setHoveredId(value.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => {
                            dispatch(validatorNavigate("vadlidateInsurance"));
                            dispatch(setInsureTypeIndex(idx)); // store index not UUID
                            dispatch(setSelectedPolicyId(value.id)); // store selected policy ID for details page
                            dispatch(setPolicyExtractedFields([])); // clear previous details to prevent flash of old data
                            getValidatorDocDetails(setValidatorDocDetails, dispatch, value.id); // fetch details for selected checklist
                            getDocumentTypeOptions(setDocumentTypes, dispatch);
                        }}
                        style={{
                            border: hoveredId === value.id ? "1px solid #a5b4fc" : "1px solid #e5e7eb",
                            boxShadow: hoveredId === value.id ? "0 1px 10px rgba(99,102,241,0.15)" : "0 1px 3px rgba(0,0,0,0.06)",
                            transform: hoveredId === value.id ? "scale(1.015)" : "scale(1)",
                            transition: "all 0.25s ease",
                        }}
                        className="flex flex-col bg-white rounded-xl px-5 py-3.5 gap-2 cursor-pointer"
                    >
                        <div className={`${BG_PRESETS[idx % BG_PRESETS.length]} w-fit p-3 rounded-xl shadow-md`}>
                            <Shield size={15} className="text-white" />
                        </div>

                        <div>
                            <h2 className="text-[15px] font-bold text-gray-800 leading-snug">{value.name}</h2>
                            <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{value.description}</p>
                        </div>

                        {(value.provider || value.location) && (
                            <div className="flex flex-wrap gap-2 text-[12px] text-gray-400 mt-0">
                                {value.provider && (
                                    <div className="flex items-start gap-1.5 text-[11px] text-gray-600 font-medium">
                                        <Building2 size={11} className="flex-shrink-0 mt-0.5" />
                                        <span className="break-words break-all min-w-0">{value.provider}</span>
                                    </div>
                                )}
                                {value.location && (
                                    <div className="flex items-start gap-1 text-[11px] text-gray-500 font-medium">
                                        <MapPin size={11} className="flex-shrink-0 mt-0.5" />
                                        <span className="break-words min-w-0">
                                            {value.location}{value.state ? `, ${value.state}` : ""}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <hr className="border-gray-100" />

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${value.is_active
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-gray-100 text-gray-500 border-gray-200"
                                }`}>
                                {value.is_active ? "Active" : "Inactive"}
                            </span>
                            <div className="flex-1" />
                            <span className="text-[12px] text-gray-400 font-medium">{value.documents_count} docs</span>
                            <span className="text-[12px] text-gray-400 font-medium">{value.rules_count} rules</span>
                            <ArrowRight size={15} className="text-gray-400" />
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slideIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
            `}</style>
        </div>
    );
};

export default ValidatorSetup;