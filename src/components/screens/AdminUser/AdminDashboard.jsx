import React from "react";
import { Users, CheckCircle, AlertTriangle, Activity, MapPin, Eye, Trash2 } from "lucide-react";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const STATS = [
    { label: "TOTAL USERS", value: 8, sub: "across all offices", icon: Users, iconBg: "#ede9fe", iconColor: "#7c3aed" },
    { label: "ACTIVE", value: 5, sub: "signed in recently", icon: CheckCircle, iconBg: "#d1fae5", iconColor: "#059669" },
    { label: "PENDING", value: 2, sub: "invite not accepted", icon: AlertTriangle, iconBg: "#fef9c3", iconColor: "#d97706" },
    { label: "API CALLS", value: 806, sub: "last 30 days", icon: Activity, iconBg: "#dbeafe", iconColor: "#2563eb" },
];

const OFFICES = [
    { name: "La Familia", count: 3, color: "#6366f1", pct: 75 },
    { name: "Zywave Auto", count: 1, color: "#22c55e", pct: 25 },
    { name: "PacCore", count: 2, color: "#3b82f6", pct: 50 },
    { name: "Sunrise Ins", count: 2, color: "#f59e0b", pct: 50 },
];

const LOCATIONS = [
    { city: "New York", count: 2, color: "#6366f1", pct: 66 },
    { city: "London", count: 2, color: "#22c55e", pct: 66 },
    { city: "Sydney", count: 2, color: "#f59e0b", pct: 66 },
    { city: "Singapore", count: 1, color: "#ec4899", pct: 33 },
    { city: "Dubai", count: 1, color: "#3b82f6", pct: 33 },
];

const RECENT_USERS = [
    {
        initials: "PR", name: "Prathap R", date: "2025-08-01",
        office: "PacCore",
        location: "Sydney", locColor: "#f59e0b", locBg: "#fef3c7",
        email: "prathap.r@paccore.com",
        role: "Admin", roleColor: "#6366f1", roleBg: "#ede9fe",
        aiStatus: "completed", aiColor: "#059669", aiBg: "#d1fae5",
        validation: "in_review",
        lastLogin: "2026-03-20",
        docs: 142,
    },
    {
        initials: "DA", name: "Daisy Avila", date: "2025-09-15",
        office: "La Familia",
        location: "New York", locColor: "#3b82f6", locBg: "#dbeafe",
        email: "daisy.avila@lafamilia.com",
        role: "CSR", roleColor: "#059669", roleBg: "#d1fae5",
        aiStatus: "completed", aiColor: "#059669", aiBg: "#d1fae5",
        validation: "in_review",
        lastLogin: "2026-03-19",
        docs: 87,
    },
    {
        initials: "RS", name: "Rick Shirey", date: "2025-10-02",
        office: "La Familia",
        location: "London", locColor: "#22c55e", locBg: "#dcfce7",
        email: "rick.shirey@lafamilia.com",
        role: "Underwriter", roleColor: "#6366f1", roleBg: "#ede9fe",
        aiStatus: "completed", aiColor: "#059669", aiBg: "#d1fae5",
        validation: "in_review",
        lastLogin: "2026-03-18",
        docs: 54,
    },
    {
        initials: "NM", name: "Nicol M.", date: "2025-11-20",
        office: "La Familia",
        location: "London", locColor: "#22c55e", locBg: "#dcfce7",
        email: "nicol.m@lafamilia.com",
        role: "Viewer", roleColor: "#6b7280", roleBg: "#f3f4f6",
        aiStatus: "inactive", aiColor: "#6b7280", aiBg: "#f3f4f6",
        validation: "in_review",
        lastLogin: "2026-02-10",
        docs: 12,
    },
    {
        initials: "BO", name: "Ben Ortiz", date: "2025-12-01",
        office: "PacCore",
        location: "Sydney", locColor: "#f59e0b", locBg: "#fef3c7",
        email: "ben.ortiz@paccore.com",
        role: "Admin", roleColor: "#6366f1", roleBg: "#ede9fe",
        aiStatus: "in_review", aiColor: "#d97706", aiBg: "#fef9c3",
        validation: "completed",
        lastLogin: "2026-03-15",
        docs: 98,
    },
];

const AVATAR_COLORS = [
    { bg: "#ede9fe", text: "#5b21b6" },
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#d1fae5", text: "#065f46" },
    { bg: "#fef9c3", text: "#92400e" },
    { bg: "#fce7f3", text: "#be185d" },
];

const HEADERS = [
    "Customer / User", "Customer Office Name", "Location",
    "Customer CSR", "Role",
    "Validation", "Last Login", ,
];

// ─── Sub Components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 flex items-center gap-4 flex-1">
        <div className="rounded-xl p-3 flex-shrink-0" style={{ backgroundColor: iconBg }}>
            <Icon size={18} style={{ color: iconColor }} />
        </div>
        <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">{label}</p>
            <p className="text-xl font-bold text-indigo-600 leading-tight">{value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
        </div>
    </div>
);

const BarRow = ({ label, count, color, pct, showIcon = false }) => (
    <div className="flex items-center gap-2 mb-3">
        {showIcon
            ? <MapPin size={14} className="text-gray-400 flex-shrink-0" />
            : <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        }
        <span className="text-[13px] text-gray-600 w-20 flex-shrink-0">{label}</span>
        <div className="flex-1 h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <span className="text-[13px] font-semibold text-gray-700 w-4 text-right">{count}</span>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-white-50 p-4 flex flex-col gap-4">

            {/* Row 1 — Stat Cards */}
            <div className="flex gap-4">
                {STATS.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Row 2 — Users by Office + Users by Location */}
            {/* <div className="flex gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 flex-1">
                    <h3 className="text-[14px] font-bold text-gray-800 mb-3">Users by office</h3>
                    {OFFICES.map((o, i) => (
                        <BarRow key={i} label={o.name} count={o.count} color={o.color} pct={o.pct} />
                    ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 flex-1">
                    <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">Users by location</h3>
                    <p className="text-[11px] text-gray-400 mb-4">Office / branch breakdown</p>
                    {LOCATIONS.map((l, i) => (
                        <BarRow key={i} label={l.city} count={l.count} color={l.color} pct={l.pct} showIcon />
                    ))}
                </div>
            </div> */}

            {/* Row 3 — Recently Added Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md ">
                <h3 className="text-[14px] font-bold text-gray-800 mb-1 px-3 pt-3">Recently added</h3>

                <div className="overflow-x-auto ">
                    <table className="w-full" style={{ tableLayout: "fixed", minWidth: 1100 }}>
                        <colgroup>
                            <col style={{ width: 170 }} />
                            <col style={{ width: 140 }} />
                            <col style={{ width: 110 }} />
                            <col style={{ width: 190 }} />
                            <col style={{ width: 110 }} />
                            <col style={{ width: 100 }} />
                            <col style={{ width: 100 }} />
                        </colgroup>

                        {/* Header */}
                        <thead>
                            <tr className="border-b border-gray-100">
                                {HEADERS.map((h) => (
                                    <th
                                        key={h}
                                        className="text-left py-2 text-[10px] font-semibold text-gray-400 tracking-widest uppercase bg-gray-50 first:pl-2 "
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            {RECENT_USERS.map((u, i) => {
                                const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                return (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors ">

                                        {/* Customer / User */}
                                        <td className="ps-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                                                    style={{ backgroundColor: av.bg, color: av.text }}
                                                >
                                                    {u.initials}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-semibold text-gray-800 leading-tight">{u.name}</p>
                                                    <p className="text-[10px] text-gray-400">{u.date}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Office Name */}
                                        <td className="text-[12px] text-gray-800">{u.office}</td>

                                        {/* Location */}
                                        <td className="">
                                            <span
                                                className="text-[10px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1"
                                                style={{ backgroundColor: u.locBg, color: u.locColor }}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: u.locColor }} />
                                                {u.location}
                                            </span>
                                        </td>

                                        {/* Customer CSR */}
                                        <td className=" text-[12px] text-gray-800 truncate">{u.email}</td>

                                        {/* Role */}
                                        <td className="">
                                            <span
                                                className="text-[10px] font-medium px-3 py-1 rounded-full"
                                                style={{ backgroundColor: u.roleBg, color: u.roleColor }}
                                            >
                                                {u.role}
                                            </span>
                                        </td>

                                        {/* Validation */}
                                        <td className="py-3 text-[12px] text-gray-800">{u.validation}</td>

                                        {/* Last Login */}
                                        <td className="py-3 text-[12px] text-gray-800">{u.lastLogin}</td>



                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle size={16} className="text-emerald-500" />
                    </div>
                    <span className="text-[13px] font-bold text-emerald-600">Graph API Connected</span>
                    <span className="text-[12px] text-gray-400">Last sync: 2026-03-20 14:32 UTC</span>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <p className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Tenant</p>
                        <p className="text-[13px] font-bold text-gray-800">YourCompany</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Region</p>
                        <p className="text-[13px] font-bold text-gray-800">Australia East</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Version</p>
                        <p className="text-[13px] font-bold text-gray-800">v1.0</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;