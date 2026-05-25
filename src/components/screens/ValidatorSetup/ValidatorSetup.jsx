import React, { useEffect, useState, useMemo, useRef } from "react";
import ValidatorBreadcrumb from "./ValidatorBreadcrumb";
import { validatorNavigate } from "../../../store/slices/navigationSlice";
import { setInsureTypeIndex } from "../../../store/slices/batchSlice";
import { setValidatorSetupList, setValidatorCreate, setValidatorDocDetails, setSelectedPolicyId, setDocumentTypes, setPolicyExtractedFields, setProviders, setStates, setLocations } from "../../../store/slices/validatorSetupSlice";
import { Shield, ArrowRight, X, Check, ChevronDown, MapPin, Building2, Rocket, CheckCircle, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getValidatorSetupList, createValidatorPolicy, getValidatorDocDetails, getDocumentTypeOptions, depolyValidatorRule, getProviders, getStates, getLocations } from "../../api/validatorApiCall";

const BG_PRESETS = [
    "bg-gradient-to-br from-[#8B7FF5] to-[#6B55E8]",
    "bg-gradient-to-br from-[#5BC8F5] to-[#0DA89B]",
    "bg-gradient-to-br from-[#F97A2A] to-[#E8450A]",
    "bg-gradient-to-br from-[#F472B6] to-[#EC4899]",
    "bg-gradient-to-br from-[#34D399] to-[#059669]",
    "bg-gradient-to-br from-[#60A5FA] to-[#2563EB]",
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="flex flex-col bg-white rounded-xl px-5 py-3.5 gap-3 border border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
        <div className="flex flex-col gap-2">
            <div className="h-3.5 w-36 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-3/4 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="flex gap-3">
            <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <hr className="border-gray-100" />
        <div className="flex items-center gap-2">
            <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex-1" />
            <div className="h-3 w-10 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-10 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-4 bg-gray-100 rounded-full animate-pulse" />
        </div>
    </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast, onClose]);

    if (!toast) return null;

    const isSuccess = toast.type === "success";

    return (
        <div
            className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl shadow-lg px-4 py-3 min-w-[240px] max-w-[340px] border ${isSuccess
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
                }`}
            style={{ animation: "slideInToast 0.25s ease" }}
        >
            <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${isSuccess ? "bg-green-100" : "bg-red-100"
                }`}>
                {isSuccess
                    ? <CheckCircle2 size={14} className="text-green-600" />
                    : <XCircle size={14} className="text-red-500" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold ${isSuccess ? "text-green-700" : "text-red-700"}`}>
                    {toast.title}
                </p>
                {toast.subtitle && (
                    <p className={`text-[11px] mt-0.5 ${isSuccess ? "text-green-600" : "text-red-500"}`}>
                        {toast.subtitle}
                    </p>
                )}
            </div>
            <button
                onClick={onClose}
                className={`flex-shrink-0 transition ${isSuccess ? "text-green-400 hover:text-green-600" : "text-red-300 hover:text-red-500"}`}
            >
                <XCircle size={14} />
            </button>
            <style>{`
                @keyframes slideInToast {
                    from { opacity: 0; transform: translateX(40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
    <button onClick={onChange}
        className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-[#6B55E8]" : "bg-gray-300"}`}>
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
);

const Field = ({ label, required, children }) => (
    <div>
        <label className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);


const SearchableSelect = ({ value, onChange, options, placeholder, dropRef }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [dropUp, setDropUp] = useState(false);
    const buttonRef = useRef(null);

    // ✅ Safe normalise — handles strings, {label,value}, {provider_name,id}, {code,id}
    const normalised = options.map((o) => {
        if (typeof o === "string") return { label: o, value: o };
        return {
            label: o.label ?? o.provider_name ?? o.code ?? "",
            value: o.value ?? o.id ?? "",
        };
    });

    // Label shown in the trigger button for the selected value
    const selectedLabel = normalised.find((o) => o.value === value)?.label ?? "";

    useEffect(() => {
        const handler = (e) => {
            if (dropRef?.current && !dropRef.current.contains(e.target)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [dropRef]);

    const handleToggle = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropUp(window.innerHeight - rect.bottom < 230);
        }
        setOpen((o) => !o);
        if (open) setSearch("");
    };

    // ✅ Safe filter — o.label?.toLowerCase() guards against undefined
    const filtered = normalised.filter((o) =>
        o.label?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={dropRef}>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-gray-50 hover:border-[#6B55E8] transition-colors"
            >
                <span className={selectedLabel ? "text-gray-700" : "text-gray-300"}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className={`absolute z-[999] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ${dropUp ? "bottom-full mb-1" : "top-full mt-1"
                    }`}>
                    <div className="p-2 border-b border-gray-100">
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${placeholder.toLowerCase()}...`}
                            className="w-full text-[12px] border border-gray-200 rounded-md px-2.5 py-1.5 outline-none focus:border-[#6B55E8] text-gray-600 placeholder-gray-300"
                        />
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                        {filtered.map((o) => (
                            <button
                                key={o.value}
                                onMouseDown={() => { onChange(o.value); setOpen(false); setSearch(""); }}
                                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between
                                    ${value === o.value ? "text-indigo-600 font-semibold bg-indigo-50" : "text-gray-700"}`}
                            >
                                <span>{o.label}</span>
                                {value === o.value && <Check size={12} className="text-indigo-500" />}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="px-3 py-3 text-[12px] text-gray-400 text-center">
                                No results for "{search}"
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Add Policy Panel ──────────────────────────────────────────────────────────
const EMPTY_FORM = { checklistName: "", provider: "", state: "", location: "", description: "", active: true };

const AddPolicyPanel = ({ open, onClose, onSave }) => {
    const dispatch = useDispatch();
    const [form, setForm] = useState(EMPTY_FORM);
    const providerRef = useRef(null);
    const stateRef = useRef(null);
    const locationRef = useRef(null);

    const { providers, states, locations } = useSelector((state) => state.validatorSetup);

    const PROVIDERS = providers.map((item) => ({
        value: item.id,
        label: item.provider_name,
    }));

    const US_STATES = states.map((item) => ({
        value: item.id,
        label: item.code,
    }));

    const LOCATIONS = locations.map((item) => ({
        value: item.id,
        label: item.location_code,
    }));

    const handleClose = () => {
        setForm(EMPTY_FORM);
        onClose();
    };

    const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

    // ✅ Fix: set("state") returns a function — call it with value
    const handleState = (value) => {
        set("state")(value);
        console.log("state",value)
        getLocations(value, dispatch, setLocations);
    };

    // const canSave = form.checklistName.trim() && form.provider && form.state && form.location;
    const canSave = form.checklistName.trim();

    const handleSave = () => {
        if (!canSave) return;
        const payload = {
            name: form.checklistName,
            provider: form.provider,
            state: form.state,
            location: form.location,
            description: form.description,
            is_active: form.active,
        };
        dispatch(setValidatorCreate(payload));
        createValidatorPolicy(payload);
        getValidatorSetupList(setValidatorSetupList, dispatch);
        onSave({ checklistName: form.checklistName });
        handleClose();
    };

    return (
        <>
            {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose} />}
            <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-800">New AI Configuration Checklist</h2>
                        <p className="text-[12px] text-gray-400 mt-0.5">Define a new AI checklist for document validation.</p>
                    </div>
                    <button onClick={handleClose} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">

                    <Field label="Checklist Name" required>
                        <input
                            value={form.checklistName}
                            onChange={(e) => set("checklistName")(e.target.value)}
                            placeholder="e.g. Auto Insurance New Policy Checklist"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300"
                        />
                    </Field>

                    <Field label="Provider" >
                        <SearchableSelect
                            value={form.provider}
                            onChange={set("provider")}
                            options={PROVIDERS}
                            placeholder="Select Provider..."
                            dropRef={providerRef}
                        />
                    </Field>

                    {/* ✅ Fix: removed duplicate nested <Field label="State"> */}
                    <Field label="State" >
                        <SearchableSelect
                            value={form.state}
                            onChange={handleState}
                            options={US_STATES}
                            placeholder="Select State..."
                            dropRef={stateRef}
                        />
                    </Field>

                    <Field label="Location" >
                        <SearchableSelect
                            value={form.location}
                            onChange={set("location")}
                            options={LOCATIONS}
                            placeholder="Select Location..."
                            dropRef={locationRef}
                        />
                    </Field>

                    <Field label="Description">
                        <textarea
                            value={form.description}
                            onChange={(e) => set("description")(e.target.value)}
                            rows={4}
                            placeholder="Describe the purpose of this AI configuration checklist..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 resize-none outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-300"
                        />
                    </Field>

                    <Field label="Status" required>
                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                            <div>
                                <p className="text-[13px] font-semibold text-gray-700">Active</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Checklist will be immediately visible and selectable.</p>
                            </div>
                            <Toggle checked={form.active} onChange={() => set("active")(!form.active)} />
                        </div>
                    </Field>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                    <button onClick={handleClose}
                        className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={!canSave}
                        className={`flex items-center gap-2 text-[13px] font-semibold px-5 py-2 rounded-lg transition-all
                            ${canSave
                                ? "text-white bg-[#6B55E8] hover:bg-[#5a45d4]"
                                : "text-white bg-gray-300 cursor-not-allowed opacity-60"}`}>
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
    const { validatorlist } = useSelector((state) => state.validatorSetup);

    // ✅ Memoized so the reference is stable across renders
    const cards = useMemo(() => validatorlist || [], [validatorlist]);
    const [loading, setLoading] = useState(true);
    const [panelOpen, setPanelOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [deployingId, setDeployingId] = useState(null);
    const [deployedId, setDeployedId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await getValidatorSetupList(setValidatorSetupList, dispatch);
            setLoading(false);
        };
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (cards.length > 0) setLoading(false);
    }, [cards]);

    const addToast = (type, title, subtitle) => {
        const id = Date.now();
        setToasts((p) => [...p, { id, type, title, subtitle }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };
    const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4500);
    };

    const handleSave = ({ checklistName }) => {
        getValidatorSetupList(setValidatorSetupList, dispatch);
        addToast("success", "Checklist Created", `"${checklistName}" has been created successfully.`);
    };

    const handleDeploy = async (e, id) => {
        e.stopPropagation();
        setDeployingId(id);
        setDeployedId(null);
        try {
            const response = await depolyValidatorRule(id);
            if (response?.data?.status === true || response?.data?.status === "success") {
                setDeployedId(id);
                showToast("success", response?.data?.message || "Deployed successfully.");
                setTimeout(() => setDeployedId(null), 3000);
            } else {
                showToast("error", response?.data?.message || "Deploy failed. Please try again.");
            }
        } catch (err) {
            showToast("error", "Something went wrong. Please try again.", err);
        } finally {
            setDeployingId(null);
        }
    };

    return (
        <div className="min-w-0 w-full">
            <ValidatorBreadcrumb crumbs={[{ label: "ValidatorSetup" }]} />
            <Toast toasts={toasts} onClose={removeToast} />
            <AddPolicyPanel open={panelOpen} onClose={() => setPanelOpen(false)} onSave={handleSave} />

            {/* Deploy toast */}
            {toast && (
                <div className={`fixed bottom-5 right-5 z-[110] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-[13px] font-medium
                    ${toast.type === "success"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"}`}
                >
                    {toast.type === "success"
                        ? <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                        : <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                    }
                    {toast.msg}
                    <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
                        <X size={13} />
                    </button>
                </div>
            )}

            {/* Page header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">AI Configuration Checklists</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Select a policy to configure document requirements and validation rules.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setPanelOpen(true)
                        getProviders(dispatch, setProviders)
                        getStates(dispatch, setStates)
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-3 py-1.5 rounded-md transition-all"
                >
                    + New AI Configuration Checklist
                </button>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)
                    : cards.map((value, idx) => (
                        <div
                            key={value.id}
                            onMouseEnter={() => setHoveredId(value.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => {
                                dispatch(validatorNavigate("vadlidateInsurance"));
                                dispatch(setInsureTypeIndex(idx));
                                dispatch(setSelectedPolicyId(value.id));
                                dispatch(setPolicyExtractedFields([]));
                                getValidatorDocDetails(setValidatorDocDetails, dispatch, value.id);
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
                            {/* Top row */}
                            <div className="flex justify-between items-center">
                                <div className={`${BG_PRESETS[idx % BG_PRESETS.length]} w-fit p-3 rounded-xl shadow-md`}>
                                    <Shield size={15} className="text-white" />
                                </div>
                                {/* <button
                                    onClick={(e) => handleDeploy(e, value.id)}
                                    disabled={deployingId === value.id}
                                    className={`flex items-center gap-1 text-[12px] font-semibold text-white px-2 py-1 rounded-md transition-all
                                        ${deployedId === value.id
                                            ? "bg-green-500 hover:bg-green-600"
                                            : deployingId === value.id
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-[#6B55E8] hover:bg-[#5a45d4]"}`}
                                >
                                    {deployingId === value.id ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                            Deploying...
                                        </>
                                    ) : deployedId === value.id ? (
                                        <><CheckCircle size={13} /> Deployed</>
                                    ) : (
                                        <><Rocket size={13} /> Deploy</>
                                    )}
                                </button> */}
                            </div>

                            {/* Name + description */}
                            <div>
                                <h2 className="text-[15px] font-bold text-gray-800 leading-snug">{value.name}</h2>
                                <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{value.description}</p>
                            </div>

                            {/* Provider + location */}
                            {(value.provider?.provider_name || value.location?.location_code) && (
                                <div className="flex flex-wrap gap-2">
                                    {value.provider?.provider_name && (
                                        <div className="flex items-start gap-1.5 text-[11px] text-gray-600 font-medium">
                                            <Building2 size={11} className="flex-shrink-0 mt-0.5" />
                                            <span className="break-words break-all min-w-0">{value.provider?.provider_name}</span>
                                        </div>
                                    )}
                                    {value.location?.location_code && (
                                        <div className="flex items-start gap-1 text-[11px] text-gray-500 font-medium">
                                            <MapPin size={11} className="flex-shrink-0 mt-0.5" />
                                            <span className="break-words min-w-0">
                                                {value.location?.location_code}{value.state?.code ? `, ${value.state?.code}` : ""}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <hr className="border-gray-100" />

                            {/* Footer */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border
                                    ${value.is_active
                                        ? "bg-green-50 text-green-600 border-green-200"
                                        : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                    {value.is_active ? "Active" : "Inactive"}
                                </span>
                                <div className="flex-1" />
                                <span className="text-[12px] text-gray-400 font-medium">{value.documents_count} docs</span>
                                <span className="text-[12px] text-gray-400 font-medium">{value.rules_count} rules</span>
                                <ArrowRight size={15} className="text-gray-400" />
                            </div>
                        </div>
                    ))
                }
            </div>

            <style>{`
                @keyframes slideIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
            `}</style>
        </div>
    );
};

export default ValidatorSetup;