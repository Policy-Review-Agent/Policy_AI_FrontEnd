import React, { useEffect, useState } from "react";
import { Layers, Clock, CheckCircle, AlertCircle, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";
import BatchCard from "./BatchCard";
import { getDashboardStats, getDashboardList } from "../../api/apisCall";
import { setDashboardStats, setDashboardList,setRowsPerPage } from "../../../store/slices/batchSlice";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../Pagination/Pagination";
import CustomDatePicker from "./CustomDatePicker";

// ─── Config ───────────────────────────────────────────────────────────────────
const STATS_CONFIG = [
    { key: "total_batches",   label: "Total Batches",    sub: "All time",          icon: Layers,      color: "bg-blue-50 text-blue-600"   },
    { key: "in_progress",     label: "In Progress",      sub: "Being processed",   icon: Clock,       color: "bg-amber-50 text-amber-500"  },
    { key: "completed",       label: "Completed",        sub: "All policies done", icon: CheckCircle, color: "bg-green-50 text-green-500"  },
    { key: "needs_attention", label: "Needs Attention",  sub: "Issues found",      icon: AlertCircle, color: "bg-red-50 text-red-500"      },
];

const TABLE_HEADS = ["Batch ID", "Batch Date", "Total", "Ready For Review", "Reviewed", "Status", "Action"];

const SORT_KEYS = {
    "Batch Date": "batch_date",
    "Total":      "total_policies",
};

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────
const SkeletonRows = ({ rows = 5, cols = 7 }) =>
    Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
            {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse"
                        style={{ width: `${50 + (j * 13) % 40}%` }} />
                </td>
            ))}
        </tr>
    ));

const SkeletonStatCard = () => (
    <div className="flex justify-start items-center gap-5 bg-white border border-gray-200 rounded-xl ps-5 py-4 shadow-sm pe-0.5">
        <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
        <div className="flex flex-col gap-2 min-w-0">
            <div className="h-2.5 w-20 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-5 w-10 bg-gray-100 rounded-full animate-pulse" />
        </div>
    </div>
);

// ─── Sort Icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ field, sortField, sortDir }) => {
    if (sortField !== field) return <ArrowUpDown size={11} className="text-gray-500 ms-1 inline" />;
    return sortDir === "asc"
        ? <ArrowUp   size={11} className="text-indigo-500 ms-1 inline" />
        : <ArrowDown size={11} className="text-indigo-500 ms-1 inline" />;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const dispatch = useDispatch();
    const { dashboardStats, dashboardList,rowsPerPage  } = useSelector((s) => s.batch);

    const [loading, setLoading]         = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm]   = useState("");
    const [sortField, setSortField]     = useState(null);
    const [sortDir, setSortDir]         = useState("asc");

    // Date range filter state
    const [dateStart, setDateStart] = useState(null); // Date | null
    const [dateEnd, setDateEnd]     = useState(null); // Date | null

    const stats = {
        total_batches:   dashboardStats?.total_batches   || 0,
        in_progress:     dashboardStats?.in_progress     || 0,
        completed:       dashboardStats?.completed       || 0,
        needs_attention: dashboardStats?.needs_attention || 0,
    };

    // ── Fetch + Poll ──
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            await Promise.all([
                getDashboardStats(setDashboardStats, dispatch),
                getDashboardList(setDashboardList, dispatch),
            ]);
            setLoading(false);
            setCurrentPage(1);
        };
        fetchDashboardData();

        const intervalId = setInterval(() => {
            getDashboardStats(setDashboardStats, dispatch);
            getDashboardList(setDashboardList, dispatch);
        }, 30000);

        return () => clearInterval(intervalId);
    }, [dispatch]);

    // ── Sort handler ──
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    // ── Date picker callbacks ──
    const handleDateApply = (start, end) => {
        setDateStart(start);
        setDateEnd(end);
        setCurrentPage(1);
    };

    const handleDateClear = () => {
        setDateStart(null);
        setDateEnd(null);
        setCurrentPage(1);
    };

    // ── Filter ──
    const filteredData = dashboardList.filter((item) => {
        // Text search
        const matchesSearch =
            item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batch_date?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // Date range filter — batch_date is an ISO string e.g. "2026-05-18T09:48:05.357000"
        if (dateStart || dateEnd) {
            const batchDate = item.batch_date ? new Date(item.batch_date) : null;
            if (!batchDate) return false;

            // Normalise to start-of-day for comparison
            const batchDay = new Date(batchDate.getFullYear(), batchDate.getMonth(), batchDate.getDate());

            if (dateStart) {
                const startDay = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate());
                if (batchDay < startDay) return false;
            }
            if (dateEnd) {
                const endDay = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate());
                if (batchDay > endDay) return false;
            }
        }

        return true;
    });

    // ── Sort ──
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortField) return 0;
        const key = SORT_KEYS[sortField];
        if (!key) return 0;
        const aVal = a[key] ?? "";
        const bVal = b[key] ?? "";
        const cmp  = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
    });

    // ── Paginate ──
    const paginatedList = sortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleRowsPerPageChange = (newRows) => {
        dispatch(setRowsPerPage(newRows));
        setCurrentPage(1);
    };

    // ── Compute per-date serial numbers ──
    const paginatedListWithSerial = paginatedList.map((batch) => {
        const batchDateOnly = batch.batch_date?.slice(0, 10);
        const sameDate      = sortedData.filter((b) => b.batch_date?.slice(0, 10) === batchDateOnly);
        const serial        = sameDate.findIndex((b) => b.batch_id === batch.batch_id) + 1;
        return { ...batch, serial };
    });

    return (
        <div>
            <Breadcrumb crumbs={[{ label: "Dashboard" }]} />

            {/* Page Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Batch Overview</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Monitor and manage all policy processing batches
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="overflow-x-auto pb-1 mb-4">
                <div className="grid grid-cols-4 gap-4 sm:min-w-[700px] min-w-[800px]">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
                        : STATS_CONFIG.map(({ key, label, icon, color }) => {
                            const Icon = icon;
                            return (
                                <div
                                    key={key}
                                    className="flex justify-start items-center gap-5 bg-white border border-gray-200 rounded-xl ps-5 py-4 shadow-sm hover:shadow-lg transition-shadow cursor-pointer pe-0.5"
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
                                        <p className="text-[22px] font-bold text-gray-800 leading-none mt-1">{stats[key]}</p>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            {/* Batch Table */}
            <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm">

                {/* Table Header */}
                <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100">
                    <p className="text-[15px] font-semibold text-gray-800">Batch Queue</p>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Date range picker — passes callbacks into component */}
                        <CustomDatePicker
                            onApply={handleDateApply}
                            onClear={handleDateClear}
                        />

                        {/* Search */}
                        <input
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            placeholder="Search"
                            className="w-[200px] border border-gray-200 rounded-lg px-3 py-[5px] text-[12px] font-mono text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Active filter badge */}
                {(dateStart || dateEnd) && (
                    <div className="px-4 py-1.5 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                        <span className="text-[11px] text-indigo-400 font-medium">Filtering by date:</span>
                        <span className="text-[11px] text-indigo-600 font-semibold font-mono">
                            {dateStart?.toLocaleDateString()} {dateEnd && dateEnd !== dateStart ? `→ ${dateEnd.toLocaleDateString()}` : ""}
                        </span>
                        <span className="text-[11px] text-indigo-400">
                            ({sortedData.length} result{sortedData.length !== 1 ? "s" : ""})
                        </span>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto overflow-visible">
                    <table className="w-full">
                        <thead className="hidden md:table-header-group">
                            <tr className="bg-gray-50 text-left">
                                {TABLE_HEADS.map((h) => {
                                    const isSortable = !!SORT_KEYS[h];
                                    return (
                                        <th
                                            key={h}
                                            onClick={() => isSortable && handleSort(h)}
                                            className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-2.5 border-b border-gray-100 whitespace-nowrap select-none transition-colors ${
                                                isSortable
                                                    ? "cursor-pointer hover:bg-gray-100 hover:text-gray-600"
                                                    : "cursor-default"
                                            } ${sortField === h ? "text-indigo-500" : "text-gray-800"}`}
                                        >
                                            {h}
                                            {isSortable && (
                                                <SortIcon field={h} sortField={sortField} sortDir={sortDir} />
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody className="md:divide-y md:divide-gray-100">
                            {loading ? (
                                <SkeletonRows rows={rowsPerPage > 5 ? 5 : rowsPerPage} cols={TABLE_HEADS.length} />
                            ) : sortedData.length > 0 ? (
                                paginatedListWithSerial.map((b, index) => (
                                    <BatchCard key={b.batch_id} batch={b} index={index} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={TABLE_HEADS.length} className="text-center py-8 text-sm text-gray-400">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-gray-100 px-4 py-2 flex justify-start relative">
                    <Pagination
                        records={sortedData.length}
                        rowsPerPage={rowsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;