import React from "react";
import { Users, CheckCircle, AlertTriangle, Activity } from "lucide-react";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const STATS = [
    { label: "TOTAL USERS", value: 8, sub: "across all offices", icon: Users, iconBg: "#ede9fe", iconColor: "#7c3aed" },
    { label: "ACTIVE", value: 5, sub: "signed in recently", icon: CheckCircle, iconBg: "#d1fae5", iconColor: "#059669" },
    { label: "PENDING", value: 2, sub: "invite not accepted", icon: AlertTriangle, iconBg: "#fef9c3", iconColor: "#d97706" },
    { label: "API CALLS", value: 806, sub: "last 30 days", icon: Activity, iconBg: "#dbeafe", iconColor: "#2563eb" },
];

const RECENT_USERS = [
    {
        initials: "PR", name: "Prathap R", date: "2025-08-01",
        office: "PacCore",
        location: "Sydney", locColor: "#f59e0b", locBg: "#fef3c7",
        email: "prathap.r@paccore.com",
        role: "Admin", roleColor: "#6366f1", roleBg: "#ede9fe",
        validation: "in_review",
        lastLogin: "2026-03-20",
    },
    {
        initials: "DA", name: "Daisy Avila", date: "2025-09-15",
        office: "La Familia",
        location: "New York", locColor: "#3b82f6", locBg: "#dbeafe",
        email: "daisy.avila@lafamilia.com",
        role: "CSR", roleColor: "#059669", roleBg: "#d1fae5",
        validation: "in_review",
        lastLogin: "2026-03-19",
    },
    {
        initials: "RS", name: "Rick Shirey", date: "2025-10-02",
        office: "La Familia",
        location: "London", locColor: "#22c55e", locBg: "#dcfce7",
        email: "rick.shirey@lafamilia.com",
        role: "Underwriter", roleColor: "#6366f1", roleBg: "#ede9fe",
        validation: "in_review",
        lastLogin: "2026-03-18",
    },
    {
        initials: "NM", name: "Nicol M.", date: "2025-11-20",
        office: "La Familia",
        location: "London", locColor: "#22c55e", locBg: "#dcfce7",
        email: "nicol.m@lafamilia.com",
        role: "Viewer", roleColor: "#6b7280", roleBg: "#f3f4f6",
        validation: "in_review",
        lastLogin: "2026-02-10",
    },
    {
        initials: "BO", name: "Ben Ortiz", date: "2025-12-01",
        office: "PacCore",
        location: "Sydney", locColor: "#f59e0b", locBg: "#fef3c7",
        email: "ben.ortiz@paccore.com",
        role: "Admin", roleColor: "#6366f1", roleBg: "#ede9fe",
        validation: "completed",
        lastLogin: "2026-03-15",
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
    "Customer / User", "Office Name", "Location",
    "Email", "Role", "Validation", "Last Login",
];

// ─── Sub Components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, iconBg, iconColor }) => {
    const Icon = icon;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 flex items-center gap-3 flex-1 min-w-0">
            <div className="rounded-xl p-2.5 flex-shrink-0" style={{ backgroundColor: iconBg }}>
                <Icon size={16} style={{ color: iconColor }} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase truncate">{label}</p>
                <p className="text-xl font-bold text-indigo-600 leading-tight">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>
            </div>
        </div>
    );
};

// ─── Mobile User Card ─────────────────────────────────────────────────────────
const UserCard = ({ u, i }) => {
    const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
            {/* Top row */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                        style={{ backgroundColor: av.bg, color: av.text }}
                    >
                        {u.initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.date}</p>
                    </div>
                </div>
                <span
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: u.roleBg, color: u.roleColor }}
                >
                    {u.role}
                </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <div>
                    <span className="text-gray-400">Office </span>
                    <span className="font-medium text-gray-700">{u.office}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-gray-400">Location </span>
                    <span
                        className="font-medium px-1.5 py-0.5 rounded-full text-[10px]"
                        style={{ backgroundColor: u.locBg, color: u.locColor }}
                    >
                        {u.location}
                    </span>
                </div>
                <div className="col-span-2 truncate">
                    <span className="text-gray-400">Email </span>
                    <span className="font-medium text-gray-700">{u.email}</span>
                </div>
                <div>
                    <span className="text-gray-400">Validation </span>
                    <span className="font-medium text-gray-700">{u.validation}</span>
                </div>
                <div>
                    <span className="text-gray-400">Login </span>
                    <span className="font-medium text-gray-700">{u.lastLogin}</span>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    return (
        <div className="bg-white p-3 sm:p-4 flex flex-col gap-4">

            {/* ── Stat Cards — 2 cols on mobile, 4 on desktop ── */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {STATS.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* ── Recently Added ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md">
                <h3 className="text-[14px] font-bold text-gray-800 px-3 pt-3 pb-2">Recently added</h3>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full" style={{ tableLayout: "fixed", minWidth: 900 }}>
                        <colgroup>
                            <col style={{ width: 170 }} />
                            <col style={{ width: 120 }} />
                            <col style={{ width: 110 }} />
                            <col style={{ width: 190 }} />
                            <col style={{ width: 100 }} />
                            <col style={{ width: 100 }} />
                            <col style={{ width: 100 }} />
                        </colgroup>
                        <thead>
                            <tr className="border-b border-gray-100">
                                {HEADERS.map((h) => (
                                    <th key={h}
                                        className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 tracking-widest uppercase bg-gray-50 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {RECENT_USERS.map((u, i) => {
                                const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                return (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-2 py-2.5">
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
                                        <td className="px-2 text-[12px] text-gray-800">{u.office}</td>
                                        <td className="px-2">
                                            <span
                                                className="text-[10px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1"
                                                style={{ backgroundColor: u.locBg, color: u.locColor }}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: u.locColor }} />
                                                {u.location}
                                            </span>
                                        </td>
                                        <td className="px-2 text-[12px] text-gray-800 truncate">{u.email}</td>
                                        <td className="px-2">
                                            <span
                                                className="text-[10px] font-medium px-3 py-1 rounded-full"
                                                style={{ backgroundColor: u.roleBg, color: u.roleColor }}
                                            >
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 text-[12px] text-gray-800">{u.validation}</td>
                                        <td className="px-2 py-2.5 text-[12px] text-gray-800">{u.lastLogin}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden flex flex-col gap-2 px-3 pb-3">
                    {RECENT_USERS.map((u, i) => <UserCard key={i} u={u} i={i} />)}
                </div>
            </div>

            {/* ── Footer Bar ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Left */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={15} className="text-emerald-500" />
                    </div>
                    <span className="text-[13px] font-bold text-emerald-600">Graph API Connected</span>
                    <span className="text-[11px] text-gray-400">Last sync: 2026-03-20 14:32 UTC</span>
                </div>

                {/* Right */}
                <div className="flex items-center gap-5 flex-wrap">
                    {[
                        { label: "Tenant",  value: "YourCompany"    },
                        { label: "Region",  value: "Australia East" },
                        { label: "Version", value: "v1.0"           },
                    ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                            <p className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">{label}</p>
                            <p className="text-[13px] font-bold text-gray-800">{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;