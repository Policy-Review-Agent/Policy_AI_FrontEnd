import React, { useState, useEffect, useRef } from "react";
import { Search, Eye, Trash2, ArrowRight, X, CheckCircle2, Clock, UserPlus, MapPin, Check } from "lucide-react";
import CustomSelect from "./CustomSelect";
import Pagination from "../Pagination/Pagination";

// ─── Data ─────────────────────────────────────────────────────────────────────
const Offices = [
    { value: "all offices", label: "All Offices" },
    { value: "la familia", label: "La Familia" },
    { value: "paccore", label: "Paccore" },
    { value: "zywave auto", label: "Zywave Auto" },
];
const Location = [
    { value: "all locations", label: "All Locations" },
    { value: "new york", label: "New York" },
    { value: "london", label: "London" },
    { value: "singapore", label: "Singapore" },
    { value: "dubai", label: "Dubai" },
];
const Status = [
    { value: "all statuses", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "inactive", label: "InActive" },
];

const ROLE_OPTIONS = [
    { value: "admin", label: "Admin" },
    { value: "csr", label: "CSR" },
    { value: "underwriter", label: "Underwriter" },
    { value: "viewer", label: "Viewer" },
];

const OFFICE_OPTIONS = [
    { value: "la familia", label: "La Familia" },
    { value: "paccore", label: "PacCore" },
    { value: "zywave auto", label: "Zywave Auto" },
];

const LOCATION_OPTIONS = [
    { value: "new york", label: "New York", color: "#3b82f6", bg: "#dbeafe" },
    { value: "london", label: "London", color: "#22c55e", bg: "#dcfce7" },
    { value: "singapore", label: "Singapore", color: "#f59e0b", bg: "#fef3c7" },
    { value: "dubai", label: "Dubai", color: "#6366f1", bg: "#ede9fe" },
    { value: "sydney", label: "Sydney", color: "#f59e0b", bg: "#fef3c7" },
];

const ROLE_COLORS = {
    admin:       { roleColor: "#6366f1", roleBg: "#ede9fe" },
    csr:         { roleColor: "#059669", roleBg: "#d1fae5" },
    underwriter: { roleColor: "#6366f1", roleBg: "#ede9fe" },
    viewer:      { roleColor: "#6b7280", roleBg: "#f3f4f6" },
};

const INITIAL_USERS = [
    {
        initials: "PR", name: "Prathap R", date: "2025-08-01",
        office: "PacCore", location: "Sydney", locColor: "#f59e0b", locBg: "#fef3c7",
        email: "prathap.r@paccore.com", role: "Admin", roleColor: "#6366f1", roleBg: "#ede9fe",
        validation: "completed", lastLogin: "2026-03-20", docs: 6, apiCalls: "142 calls",
        activity: [
            { dot: "#22c55e", label: "Last sign-in recorded", date: "2026-03-20" },
            { dot: "#f59e0b", label: "Location set to Sydney", bold: "Sydney", date: "2025-08-01" },
            { dot: "#3b82f6", label: "Assigned to PacCore office", bold: "PacCore", date: "2025-08-01" },
            { dot: "#22c55e", label: "Role set to Admin", bold: "Admin", date: "2025-08-01" },
            { dot: "#9ca3af", label: "Account created by admin", date: "2025-08-01" },
        ]
    },
    {
        initials: "DA", name: "Daisy Avila", date: "2025-09-15",
        office: "La Familia", location: "New York", locColor: "#3b82f6", locBg: "#dbeafe",
        email: "daisy.avila@lafamilia.com", role: "CSR", roleColor: "#059669", roleBg: "#d1fae5",
        validation: "in_review", lastLogin: "2026-03-19", docs: 6, apiCalls: "87 calls",
        activity: [
            { dot: "#22c55e", label: "Last sign-in recorded", date: "2026-03-19" },
            { dot: "#3b82f6", label: "Location set to New York", bold: "New York", date: "2025-09-15" },
            { dot: "#3b82f6", label: "Assigned to La Familia office", bold: "La Familia", date: "2025-09-15" },
            { dot: "#22c55e", label: "Role set to CSR", bold: "CSR", date: "2025-09-15" },
            { dot: "#9ca3af", label: "Account created by admin", date: "2025-09-15" },
        ]
    },
    {
        initials: "RS", name: "Rick Shirey", date: "2025-10-02",
        office: "La Familia", location: "London", locColor: "#22c55e", locBg: "#dcfce7",
        email: "rick.shirey@lafamilia.com", role: "Underwriter", roleColor: "#6366f1", roleBg: "#ede9fe",
        validation: "in_review", lastLogin: "2026-03-18", docs: 6, apiCalls: "210 calls",
        activity: [
            { dot: "#22c55e", label: "Last sign-in recorded", date: "2026-03-18" },
            { dot: "#22c55e", label: "Location set to London", bold: "London", date: "2025-10-02" },
            { dot: "#3b82f6", label: "Assigned to La Familia office", bold: "La Familia", date: "2025-10-02" },
            { dot: "#6366f1", label: "Role set to Underwriter", bold: "Underwriter", date: "2025-10-02" },
            { dot: "#9ca3af", label: "Account created by admin", date: "2025-10-02" },
        ]
    },
    {
        initials: "NM", name: "Nicol M.", date: "2025-11-20",
        office: "La Familia", location: "London", locColor: "#22c55e", locBg: "#dcfce7",
        email: "nicol.m@lafamilia.com", role: "Viewer", roleColor: "#6b7280", roleBg: "#f3f4f6",
        validation: "in_review", lastLogin: "2026-02-10", docs: 4, apiCalls: "33 calls",
        activity: [
            { dot: "#22c55e", label: "Last sign-in recorded", date: "2026-02-10" },
            { dot: "#22c55e", label: "Location set to London", bold: "London", date: "2025-11-20" },
            { dot: "#3b82f6", label: "Assigned to La Familia office", bold: "La Familia", date: "2025-11-20" },
            { dot: "#6b7280", label: "Role set to Viewer", bold: "Viewer", date: "2025-11-20" },
            { dot: "#9ca3af", label: "Account created by admin", date: "2025-11-20" },
        ]
    },
    {
        initials: "BO", name: "Ben Ortiz", date: "2025-12-01",
        office: "PacCore", location: "Sydney", locColor: "#f59e0b", locBg: "#fef3c7",
        email: "ben.ortiz@paccore.com", role: "Admin", roleColor: "#6366f1", roleBg: "#ede9fe",
        validation: "completed", lastLogin: "2026-03-15", docs: 5, apiCalls: "178 calls",
        activity: [
            { dot: "#22c55e", label: "Last sign-in recorded", date: "2026-03-15" },
            { dot: "#f59e0b", label: "Location set to Sydney", bold: "Sydney", date: "2025-12-01" },
            { dot: "#3b82f6", label: "Assigned to PacCore office", bold: "PacCore", date: "2025-12-01" },
            { dot: "#6366f1", label: "Role set to Admin", bold: "Admin", date: "2025-12-01" },
            { dot: "#9ca3af", label: "Account created by admin", date: "2025-12-01" },
        ]
    },
];

const HEADERS = ["Customer / User", "Office Name", "Location", "Email", "Role", "Validation", "Last Login", "Docs", "Action"];

const AVATAR_COLORS = [
    { bg: "#ede9fe", text: "#5b21b6" },
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#d1fae5", text: "#065f46" },
    { bg: "#fef9c3", text: "#92400e" },
    { bg: "#fce7f3", text: "#be185d" },
];

const EMPTY_FORM = { fullName: "", email: "", office: "la familia", role: "viewer", location: "new york" };

// ─── Toast ────────────────────────────────────────────────────────────────────
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
            className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl shadow-lg px-4 py-3 min-w-[240px] max-w-[340px] border ${
                isSuccess ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
            style={{ animation: "slideInToast 0.25s ease" }}
        >
            <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${isSuccess ? "bg-green-100" : "bg-red-100"}`}>
                {isSuccess ? <CheckCircle2 size={13} className="text-green-600" /> : <X size={13} className="text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold ${isSuccess ? "text-green-700" : "text-red-700"}`}>{toast.title}</p>
                {toast.subtitle && <p className={`text-[11px] mt-0.5 ${isSuccess ? "text-green-600" : "text-red-500"}`}>{toast.subtitle}</p>}
            </div>
            <button onClick={onClose} className={`flex-shrink-0 transition ${isSuccess ? "text-green-400 hover:text-green-600" : "text-red-300 hover:text-red-500"}`}>
                <X size={13} />
            </button>
            <style>{`@keyframes slideInToast { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }`}</style>
        </div>
    );
};

// ─── Validation badge ─────────────────────────────────────────────────────────
const ValidationBadge = ({ value }) => {
    const isCompleted = value === "completed";
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${isCompleted ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {isCompleted ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            {value === "in_review" ? "In Review" : "Completed"}
        </span>
    );
};

// ─── FormSelect ───────────────────────────────────────────────────────────────
const FormSelect = ({ value, onChange, options, placeholder }) => {
    const [open, setOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const buttonRef = useRef(null);
    const selected = options.find(o => o.value === value);

    const handleOpen = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropUp(window.innerHeight - rect.bottom < options.length * 42);
        }
        setOpen(v => !v);
    };

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (buttonRef.current && !buttonRef.current.closest("[data-formselect]")?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative" data-formselect="true">
            <button ref={buttonRef} type="button" onClick={handleOpen}
                className="w-full h-9 px-3 text-left text-[13px] bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between hover:border-[#6B55E8] focus:outline-none focus:border-[#6B55E8] focus:ring-2 focus:ring-[#6B55E8]/10 transition">
                <span className={selected ? "text-gray-800" : "text-gray-400"}>{selected ? selected.label : placeholder}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className={`absolute z-[999] w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}>
                    {options.map(o => (
                        <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 text-[13px] hover:bg-gray-50 transition ${value === o.value ? "text-[#6B55E8] font-semibold bg-[#6B55E8]/5" : "text-gray-700"}`}>
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Invite User Panel ────────────────────────────────────────────────────────
const InviteUserPanel = ({ open, onClose, onInvite }) => {
    const [mounted, setMounted] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        setForm(EMPTY_FORM);
        setErrors({});
        const t = setTimeout(() => setMounted(true), 10);
        return () => { clearTimeout(t); setMounted(false); };
    }, [open]);

    const handleClose = () => { setMounted(false); setTimeout(onClose, 300); };

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
        if (!form.office) e.office = "Select an office";
        if (!form.location) e.location = "Select a location";
        return e;
    };

    const handleSend = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }

        const loc = LOCATION_OPTIONS.find(l => l.value === form.location);
        const roleColors = ROLE_COLORS[form.role] || ROLE_COLORS.viewer;
        const officeLabel = OFFICE_OPTIONS.find(o => o.value === form.office)?.label || form.office;
        const roleLabel = ROLE_OPTIONS.find(r => r.value === form.role)?.label || form.role;
        const today = new Date().toISOString().split("T")[0];

        const parts = form.fullName.trim().split(" ").filter(Boolean);
        const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : form.fullName.slice(0, 2).toUpperCase();

        onInvite({
            initials,
            name: form.fullName.trim(),
            date: today,
            office: officeLabel,
            location: loc?.label || form.location,
            locColor: loc?.color || "#6b7280",
            locBg: loc?.bg || "#f3f4f6",
            email: form.email.trim(),
            role: roleLabel,
            roleColor: roleColors.roleColor,
            roleBg: roleColors.roleBg,
            validation: "in_review",
            lastLogin: "—",
            docs: 0,
            apiCalls: "0 calls",
            activity: [
                { dot: "#9ca3af", label: "Account created by admin", date: today },
                { dot: roleColors.roleColor, label: `Role set to ${roleLabel}`, bold: roleLabel, date: today },
                { dot: loc?.color || "#6b7280", label: `Location set to ${loc?.label}`, bold: loc?.label, date: today },
                { dot: "#3b82f6", label: `Assigned to ${officeLabel} office`, bold: officeLabel, date: today },
            ],
        });
        handleClose();
    };

    const selectedLoc = LOCATION_OPTIONS.find(l => l.value === form.location);
    if (!open && !mounted) return null;

    return (
        <>
            <div onClick={handleClose} className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300" style={{ opacity: mounted ? 1 : 0 }} />
            <div className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col"
                style={{ width: "clamp(340px, 40vw, 500px)", transform: mounted ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#ede9fe] flex items-center justify-center">
                            <UserPlus size={14} className="text-[#6B55E8]" />
                        </div>
                        <span className="text-[15px] font-bold text-gray-800">Invite Admin User</span>
                    </div>
                    <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 transition">
                        <X size={14} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700">Full name</label>
                        <input type="text" placeholder="e.g. John Doe" value={form.fullName}
                            onChange={e => { setForm(f => ({ ...f, fullName: e.target.value })); setErrors(er => ({ ...er, fullName: "" })); }}
                            className={`h-9 px-3 text-[13px] bg-gray-50 border rounded-xl focus:outline-none focus:border-[#6B55E8] focus:ring-2 focus:ring-[#6B55E8]/10 transition placeholder:text-gray-300 ${errors.fullName ? "border-red-400" : "border-gray-200"}`}
                        />
                        {errors.fullName && <p className="text-[11px] text-red-500">{errors.fullName}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700">Email address</label>
                        <input type="email" placeholder="user@company.com" value={form.email}
                            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: "" })); }}
                            className={`h-9 px-3 text-[13px] bg-gray-50 border rounded-xl focus:outline-none focus:border-[#6B55E8] focus:ring-2 focus:ring-[#6B55E8]/10 transition placeholder:text-gray-300 ${errors.email ? "border-red-400" : "border-gray-200"}`}
                        />
                        {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-gray-700">Office</label>
                            <FormSelect value={form.office} onChange={v => { setForm(f => ({ ...f, office: v })); setErrors(er => ({ ...er, office: "" })); }} options={OFFICE_OPTIONS} placeholder="Select office" />
                            {errors.office && <p className="text-[11px] text-red-500">{errors.office}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-gray-700">Role</label>
                            <FormSelect value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} options={ROLE_OPTIONS} placeholder="Select role" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1.5">
                            <MapPin size={13} className="text-gray-400" /> Office / Branch Location
                        </label>
                        <FormSelect value={form.location} onChange={v => { setForm(f => ({ ...f, location: v })); setErrors(er => ({ ...er, location: "" })); }} options={LOCATION_OPTIONS} placeholder="Select location" />
                        {errors.location && <p className="text-[11px] text-red-500">{errors.location}</p>}
                        {selectedLoc && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[11px] text-gray-400">Preview:</span>
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: selectedLoc.bg, color: selectedLoc.color }}>
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedLoc.color }} />{selectedLoc.label}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 bg-white">
                    <button onClick={handleClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={handleSend} className="px-6 py-2.5 rounded-xl bg-[#6B55E8] hover:bg-[#5a45d4] text-white text-[13px] font-semibold transition shadow-sm flex items-center gap-1.5">
                        <Check size={13} /> Send invite
                    </button>
                </div>
            </div>
        </>
    );
};

// ─── Right-side slide-in User Detail Panel ────────────────────────────────────
const UserDetailPanel = ({ user, onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!user) return;
        const t = setTimeout(() => setMounted(true), 10);
        return () => { clearTimeout(t); setMounted(false); };
    }, [user]);

    const handleClose = () => { setMounted(false); setTimeout(onClose, 300); };
    if (!user) return null;

    const av = AVATAR_COLORS[0];

    return (
        <>
            <div onClick={handleClose} className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300" style={{ opacity: mounted ? 1 : 0 }} />
            <div className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col"
                style={{ width: "clamp(320px, 38vw, 480px)", transform: mounted ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                    <span className="text-[15px] font-bold text-gray-800">User Details</span>
                    <div className="flex items-center gap-2">
                        <ValidationBadge value={user.validation} />
                        <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 transition"><X size={14} /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                    <div className="mx-4 mt-3 mb-3 bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: av.bg, color: av.text }}>{user.initials}</div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-bold text-gray-800 leading-tight mb-0.5">{user.name}</p>
                            <p className="text-[11px] text-gray-400 mb-2 truncate">{user.email}</p>
                            <div className="flex gap-1.5 flex-wrap">
                                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: user.roleBg, color: user.roleColor }}>{user.role}</span>
                                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: user.locBg, color: user.locColor }}>
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: user.locColor }} />{user.location}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mx-4 mb-3 bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between">
                        <span className="text-[13px] text-gray-500">Account status</span>
                        <div className="flex items-center gap-2.5">
                            <span className="text-[13px] font-semibold text-green-600">Active</span>
                            <div className="w-10 h-5 rounded-full bg-[#6B55E8] flex items-center justify-end px-0.5 cursor-pointer"><div className="w-4 h-4 rounded-full bg-white shadow-sm" /></div>
                        </div>
                    </div>
                    <div className="px-4 mb-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Account Information</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Role", value: user.role },
                                { label: "Office", value: user.office },
                                { label: "Location", value: user.location, dot: user.locColor },
                                { label: "Joined", value: user.date },
                                { label: "Last Login", value: user.lastLogin },
                                { label: "API Calls", value: user.apiCalls },
                            ].map(({ label, value, dot }) => (
                                <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                                    <p className="text-[9px] text-gray-800 uppercase font-medium tracking-widest mb-1">{label}</p>
                                    <p className="text-[11px] font-semibold text-gray-800 flex items-center gap-1.5">
                                        {dot && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />}{value}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5 mt-2">
                            <p className="text-[9px] text-gray-800 uppercase font-medium tracking-widest mb-1">Email Address</p>
                            <p className="text-[11px] font-semibold text-gray-800 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="px-4 mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Recent Activity</p>
                        <div className="flex flex-col gap-1.5">
                            {user.activity.map((a, i) => {
                                const parts = a.bold ? a.label.split(a.bold) : [a.label];
                                return (
                                    <div key={i} className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.dot }} />
                                            <span className="text-[12px] text-gray-700 truncate">{a.bold ? <>{parts[0]}<strong>{a.bold}</strong>{parts[1]}</> : a.label}</span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">{a.date}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 grid grid-cols-2 gap-3 bg-white">
                    <button onClick={handleClose} className="py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">Close</button>
                    <button className="py-2.5 rounded-xl border border-red-200 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition">Remove user</button>
                </div>
            </div>
        </>
    );
};

// ─── Mobile user card ─────────────────────────────────────────────────────────
const UserCard = ({ u, i, onView }) => {
    const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: av.bg, color: av.text }}>{u.initials}</div>
                    <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.date}</p>
                    </div>
                </div>
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: u.roleBg, color: u.roleColor }}>{u.role}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <div><span className="text-gray-400">Office </span><span className="font-medium text-gray-700">{u.office}</span></div>
                <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-gray-400">Location </span>
                    <span className="font-medium px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: u.locBg, color: u.locColor }}>{u.location}</span>
                </div>
                <div className="col-span-2 truncate"><span className="text-gray-400">Email </span><span className="font-medium text-gray-700">{u.email}</span></div>
                <div><span className="text-gray-400">Validation </span><ValidationBadge value={u.validation} /></div>
                <div><span className="text-gray-400">Login </span><span className="font-medium text-gray-700">{u.lastLogin}</span></div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-400">Docs </span>
                    <span className="text-[13px] font-bold text-gray-700">{u.docs}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => onView(u)} className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-md hover:border-[#6B55E8] hover:text-[#6B55E8] transition">
                        <Eye size={12} /> View <ArrowRight size={11} />
                    </button>
                    <button className="p-1.5 border border-gray-200 rounded-md text-red-400 hover:bg-red-50 hover:border-red-300 transition">
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const UserList = () => {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [office, setOffice] = useState(null);
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [toast, setToast] = useState(null);

    // ── Add invited user to top of table ──
    const handleInvite = (newUser) => {
        setUsers(prev => [newUser, ...prev]);
        setToast({ type: "success", title: "Invite sent!", subtitle: `${newUser.name} has been added to the user list.` });
    };

    const filteredData = users.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.office?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedList = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleRowsPerPageChange = (newRows) => { setRowsPerPage(newRows); setCurrentPage(1); };

    return (
        <div>
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* ── Toolbar ── */}
            <div className="px-3 py-2 flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                <div className="flex flex-wrap gap-2 items-center flex-1 min-w-0">
                    <div className="relative w-full sm:w-52 flex-shrink-0">
                        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="search" placeholder="Search by name or email..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-8 pl-7 pr-2 text-[13px] bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20"
                        />
                    </div>
                    <div className="w-[calc(33%-4px)] sm:w-36 flex-shrink-0"><CustomSelect value={office} onChange={setOffice} placeholder="Office" options={Offices} /></div>
                    <div className="w-[calc(33%-4px)] sm:w-36 flex-shrink-0"><CustomSelect value={location} onChange={setLocation} placeholder="Location" options={Location} /></div>
                    <div className="w-[calc(33%-4px)] sm:w-36 flex-shrink-0"><CustomSelect value={status} onChange={setStatus} placeholder="Status" options={Status} /></div>
                </div>
                <button className="flex-shrink-0 flex items-center justify-center gap-1 h-8 px-4 text-[13px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] rounded-md transition-all whitespace-nowrap w-full sm:w-auto"
                    onClick={() => setInviteOpen(true)}>
                    + Invite User
                </button>
            </div>

            {/* ── Table card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md mx-3 mb-3">
                <h3 className="text-[14px] font-bold text-gray-800 px-3 pt-3 pb-1">User List</h3>
                <div className="hidden md:block overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    <table className="w-full" style={{ tableLayout: "fixed", minWidth: 900 }}>
                        <colgroup>
                            <col style={{ width: 170 }} /><col style={{ width: 120 }} /><col style={{ width: 110 }} />
                            <col style={{ width: 190 }} /><col style={{ width: 100 }} /><col style={{ width: 110 }} />
                            <col style={{ width: 100 }} /><col style={{ width: 60 }} /><col style={{ width: 130 }} />
                        </colgroup>
                        <thead>
                            <tr className="border-b border-gray-100">
                                {HEADERS.map((h) => (
                                    <th key={h} className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 tracking-widest uppercase bg-gray-50 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedList.map((u, i) => {
                                const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                return (
                                    <tr key={u.email} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                                        <td className="px-2 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: av.bg, color: av.text }}>{u.initials}</div>
                                                <div>
                                                    <p className="text-[12px] font-semibold text-gray-800 leading-tight">{u.name}</p>
                                                    <p className="text-[10px] text-gray-400">{u.date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 text-[12px] text-gray-800">{u.office}</td>
                                        <td className="px-2">
                                            <span className="text-[10px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1" style={{ backgroundColor: u.locBg, color: u.locColor }}>
                                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: u.locColor }} />{u.location}
                                            </span>
                                        </td>
                                        <td className="px-2 text-[12px] text-gray-800 truncate">{u.email}</td>
                                        <td className="px-2"><span className="text-[10px] font-medium px-3 py-1 rounded-full" style={{ backgroundColor: u.roleBg, color: u.roleColor }}>{u.role}</span></td>
                                        <td className="px-2 py-2.5"><ValidationBadge value={u.validation} /></td>
                                        <td className="px-2 py-2.5 text-[12px] text-gray-800">{u.lastLogin}</td>
                                        <td className="px-2 py-2.5 text-[12px] text-gray-800 font-bold">{u.docs}</td>
                                        <td className="px-2 py-2.5">
                                            <div className="flex justify-start items-center gap-1">
                                                <button onClick={() => setSelectedUser(u)} className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-md hover:border-[#6B55E8] hover:text-[#6B55E8] transition">
                                                    <Eye size={13} /> View <ArrowRight size={11} />
                                                </button>
                                                <button onClick={() => setUsers(prev => prev.filter(usr => usr.email !== u.email))}
                                                    className="p-1.5 border border-gray-200 rounded-md text-red-400 hover:bg-red-50 hover:border-red-300 transition">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-gray-100 px-4 py-2 flex justify-start relative">
                    <Pagination records={filteredData.length} rowsPerPage={rowsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} onRowsPerPageChange={handleRowsPerPageChange} />
                </div>
                <div className="md:hidden flex flex-col gap-2 px-3 pb-3">
                    {paginatedList.map((u, i) => <UserCard key={u.email} u={u} i={i} onView={setSelectedUser} />)}
                </div>
            </div>

            <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
            <InviteUserPanel open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
        </div>
    );
};

export default UserList;