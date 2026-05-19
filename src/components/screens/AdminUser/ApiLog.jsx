import React, { useState } from "react";
import Pagination from "../Pagination/Pagination";
import { Search, CheckCircle2, XCircle, Clock } from "lucide-react";

const INITIAL_USERS = [
    { id: "L001", name: "Prathap R", endpoint: "POST /v1/messages", status: "200", latency: "312ms", time: "2026-03-20 14:32" },
    { id: "L002", name: "Daisy Avila", endpoint: "GET /v1/users", status: "200", latency: "198ms", time: "2026-03-20 13:10" },
    { id: "L003", name: "Ben Ortiz", endpoint: "POST /v1/messages", status: "500", latency: "840ms", time: "2026-03-20 12:55" },
    { id: "L004", name: "Rick Shirey", endpoint: "DELETE /v1/batch", status: "404", latency: "120ms", time: "2026-03-20 11:44" },
    { id: "L005", name: "Nicol M.", endpoint: "POST /v1/messages", status: "200", latency: "275ms", time: "2026-03-20 10:30" },
];

const HEADERS = ["ID", "User", "Endpoint", "Status", "Latency", "Time"];

const AVATAR_COLORS = [
    { bg: "#ede9fe", text: "#5b21b6" },
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#d1fae5", text: "#065f46" },
    { bg: "#fef9c3", text: "#92400e" },
    { bg: "#fce7f3", text: "#be185d" },
];

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ code }) => {
    const is2xx = code?.startsWith("2");
    const is5xx = code?.startsWith("5");

    const styles = is2xx
        ? { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle2 size={11} className="text-green-500" /> }
        : is5xx
            ? { bg: "bg-red-50 border-red-200", text: "text-red-600", icon: <XCircle size={11} className="text-red-500" /> }
            : { bg: "bg-amber-50 border-amber-200", text: "text-amber-600", icon: <Clock size={11} className="text-amber-500" /> };

    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${styles.bg} ${styles.text}`}>
            {code}
        </span>
    );
};

// ─── Mobile log card ──────────────────────────────────────────────────────────
const LogCard = ({ u, i }) => {
    const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
            {/* Top row: ID + status */}
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-gray-400">{u.id}</span>
                <StatusBadge code={u.status} />
            </div>

            {/* User */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-gray-800">{u.name}</span>
                </div>

                {/* Endpoint */}
                <div >
                    <span className="text-[11px] font-mono text-gray-600 break-all">{u.endpoint}</span>
                </div>
            </div>

            {/* Latency + Time */}
            <div className="flex items-center justify-between pt-0.5 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400">Latency</span>
                    <span className="text-[11px] font-mono font-semibold text-gray-700">{u.latency}</span>
                </div>
                <span className="text-[10px] text-gray-400">{u.time}</span>
            </div>
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const ApiLog = () => {
    const [users] = useState(INITIAL_USERS);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = users.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedList = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleRowsPerPageChange = (newRows) => { setRowsPerPage(newRows); setCurrentPage(1); };

    return (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">

            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3 flex-wrap">
                <div>
                    <h3 className="text-[15px] font-bold text-gray-800">API Logs</h3>
                </div>
                <div className="flex justify-center items-center gap-3">
                    <p className="text-[12px] text-gray-500 font-medium hidden sm:block">
                        Last 7 days · {filteredData.length} entries
                    </p>
                    <div className="relative w-44 sm:w-52">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full h-7 pl-7 pr-3 text-[11px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition"
                        />
                    </div>
                </div>
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                <table className="w-full" style={{ tableLayout: "fixed", minWidth: 750 }}>
                    <colgroup>
                        <col style={{ width: 90 }} />
                        <col style={{ width: 160 }} />
                        <col style={{ width: 230 }} />
                        <col style={{ width: 110 }} />
                        <col style={{ width: 100 }} />
                        <col style={{ width: 160 }} />
                    </colgroup>
                    <thead>
                        <tr className="border-b border-gray-100">
                            {HEADERS.map((h) => (
                                <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-gray-400 tracking-widest uppercase bg-gray-100 whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedList.length > 0 ? paginatedList.map((u, i) => {
                            const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                            return (
                                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                                    <td className="px-3 py-2.5">
                                        <span className="text-[11px] font-mono font-semibold text-gray-500">{u.id}</span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className="text-[12px] font-medium text-gray-800 truncate">{u.name}</span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className="text-[10px] text-gray-600 font-medium">{u.endpoint}</span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <StatusBadge code={u.status} />
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className="text-[12px] font-mono text-gray-700">{u.latency}</span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className="text-[11px] text-gray-500">{u.time}</span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={HEADERS.length} className="text-center py-8 text-[13px] text-gray-400">No logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="md:hidden flex flex-col gap-2 px-3 py-3">
                {paginatedList.length > 0 ? paginatedList.map((u, i) => (
                    <LogCard key={u.id} u={u} i={i} />
                )) : (
                    <p className="text-center py-8 text-[13px] text-gray-400">No logs found.</p>
                )}
            </div>

            {/* ── Pagination ── */}
            <div className="border-t border-gray-100 px-4 py-2">
                <Pagination
                    records={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            </div>
        </div>
    );
};

export default ApiLog;