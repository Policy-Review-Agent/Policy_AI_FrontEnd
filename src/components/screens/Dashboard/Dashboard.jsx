import React, { useEffect, useState } from "react";
import { Layers, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";
import BatchCard from "./BatchCard";
import { getDashboardStats, getDashboardList } from "../../api/apisCall";
import { setDashboardStats, setDashboardList } from "../../../store/slices/batchSlice";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../Pagination/Pagination";

const STATS_CONFIG = [
    { key: "total_batches", label: "Total Batches", sub: "All time", Icon: Layers, color: "bg-blue-50 text-blue-600" },
    { key: "in_progress", label: "In Progress", sub: "Being processed", Icon: Clock, color: "bg-amber-50 text-amber-500" },
    { key: "completed", label: "Completed", sub: "All policies done", Icon: CheckCircle, color: "bg-green-50 text-green-500" },
    { key: "needs_attention", label: "Needs Attention", sub: "Issues found", Icon: AlertCircle, color: "bg-red-50 text-red-500" },
];

const TABLE_HEADS = ["Batch ID", "Batch Date", "Total", "Processed", "Pending", "Status", "Action"];

// Skeleton loader rows — matches table columns
const SkeletonRows = ({ rows = 5, cols = 7 }) =>
    Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
            {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                    <div
                        className="h-3 bg-gray-100 rounded-full animate-pulse"
                        style={{ width: `${50 + (j * 13) % 40}%` }}
                    />
                </td>
            ))}
        </tr>
    ));

// Skeleton for stat cards
const SkeletonStatCard = () => (
    <div className="flex justify-start items-center gap-5 bg-white border border-gray-200 rounded-xl ps-5 py-4 shadow-sm pe-0.5">
        <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
        <div className="flex flex-col gap-2 min-w-0">
            <div className="h-2.5 w-20 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-5 w-10 bg-gray-100 rounded-full animate-pulse" />
        </div>
    </div>
);

const Dashboard = () => {
    const dispatch = useDispatch();
    const { dashboardStats, dashboardList } = useSelector((s) => s.batch);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("")
    const stats = {
        total_batches: dashboardStats?.total_batches || 0,
        in_progress: dashboardStats?.in_progress || 0,
        completed: dashboardStats?.completed || 0,
        needs_attention: dashboardStats?.needs_attention || 0,
    };

    const filteredData = dashboardList.filter((item) =>
        item.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batch_date.toLowerCase().includes(searchTerm.toLowerCase())  
    )

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            await Promise.all([
                getDashboardStats(setDashboardStats, dispatch),
                getDashboardList(setDashboardList, dispatch),
            ]);
            setLoading(false);
        };

        fetchDashboardData();

        // Polling — silent refresh, no loader on subsequent calls
        const intervalId = setInterval(() => {
            getDashboardStats(setDashboardStats, dispatch);
            getDashboardList(setDashboardList, dispatch);
        }, 30000);

        return () => clearInterval(intervalId);
    }, [dispatch]);

    // Reset to page 1 if list length changes
    useEffect(() => {
        setCurrentPage(1);
    }, [dashboardList.length]);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedList = dashboardList.slice(startIndex, startIndex + rowsPerPage);

    const handleRowsPerPageChange = (newRows) => {
        setRowsPerPage(newRows);
        setCurrentPage(1);
    };

    return (
        <div>
            <Breadcrumb crumbs={[{ label: "Dashboard" }]} />

            {/* Page header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Batch Overview</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Monitor and manage all policy processing batches
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="overflow-x-auto pb-1 mb-4">
                <div className="grid grid-cols-4 gap-4 sm:min-w-[700px] min-w-[800px]">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
                        : STATS_CONFIG.map(({ key, label, Icon, color }) => (
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
                        ))
                    }
                </div>
            </div>

            {/* Batch table */}
            <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm">

                {/* Header */}
                <div className="flex justify-between itmes-center px-4 py-2.5 border-b border-gray-100">
                    <p className="text-[15px] font-semibold text-gray-800">Batch Queue</p>
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search"
                        className="w-[20%] border border-gray-200 rounded-lg px-3 py-0.5 text-[13px] font-mono text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-500"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto overflow-visible">
                    <table className="w-full">
                        <thead className="hidden md:table-header-group">
                            <tr className="bg-gray-50 text-left">
                                {TABLE_HEADS.map((h) => (
                                    <th key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="md:divide-y md:divide-gray-100">
                            {loading ? (
                                <SkeletonRows rows={rowsPerPage > 5 ? 5 : rowsPerPage} cols={TABLE_HEADS.length} />
                            ) : filteredData.length > 0 ? (
                                paginatedList.map((b) => (
                                    <BatchCard key={b.batch_id} batch={b} />
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
                        records={dashboardList.length}
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