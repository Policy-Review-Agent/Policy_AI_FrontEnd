import React, { useEffect } from "react";
import { Layers, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";
import BatchCard from "./BatchCard";
import { getDashboardStats, getDashboardList } from "../../api/apisCall";
import { setDashboardStats, setDashboardList } from "../../../store/slices/batchSlice"
import { useSelector, useDispatch } from "react-redux";

const STATS_CONFIG = [
    { key: "total_batches", label: "Total Batches", sub: "All time", Icon: Layers, color: "bg-blue-50 text-blue-600" },
    { key: "in_progress", label: "In Progress", sub: "Being processed", Icon: Clock, color: "bg-amber-50 text-amber-500" },
    { key: "completed", label: "Completed", sub: "All policies done", Icon: CheckCircle, color: "bg-green-50 text-green-500" },
    { key: "needs_attention", label: "Needs Attention", sub: "Issues found", Icon: AlertCircle, color: "bg-red-50 text-red-500" },
];

const TABLE_HEADS = ["Batch ID", "Batch Date", "Total", "Processed", "Pending", "Status", "Action"];

const Dashboard = () => {
    const dispatch = useDispatch();
    const { dashboardStats, batches, dashboardList } = useSelector((s) => s.batch)
    // const batches = useSelector((s) => s.batch.batches);

    const stats = {
        total_batches: dashboardStats?.total_batches || 0,
        in_progress: dashboardStats?.in_progress || 0,
        completed: dashboardStats?.completed || 0,
        needs_attention: dashboardStats?.needs_attention || 0,
    };

    useEffect(() => {
        const fetchDashboardData = () => {
            getDashboardStats(setDashboardStats, dispatch);
            getDashboardList(setDashboardList, dispatch);
        };

        // Initial fetch
        fetchDashboardData();

        // Polling every 5 seconds for real-time updates
        const intervalId = setInterval(fetchDashboardData, 30000);

        return () => clearInterval(intervalId);
    }, [dispatch]);
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
            <div className="overflow-x-auto pb-1 mb-7">
                {/* Always 4 columns in one row, each card has a fixed min-width so they never squish */}
                <div className="grid grid-cols-4 gap-4 sm:min-w-[700px] min-w-[800px] ">
                    {STATS_CONFIG.map(({ key, label, sub, Icon, color }) => (
                        <div
                            key={key}
                            className="flex justify-start items-center gap-5 bg-white border border-gray-200 rounded-xl ps-5 py-4 shadow-sm hover:shadow-lg transition-shadow cursor-pointer pe-0.5"
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center  flex-shrink-0 ${color}`}>
                                <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
                                <p className="text-[22px] font-bold text-gray-800 leading-none mt-1">{stats[key]}</p>
                                {/* <p className="text-[11px] text-gray-500 mt-1.5 truncate">{sub}</p> */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Batch table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-2.5 border-b border-gray-100">
                    <p className="text-[15px] font-semibold text-gray-800">Batch Queue</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">

                        {/* Hide header on mobile – cards are self-labelled */}
                        <thead className="hidden md:table-header-group">
                            <tr className="bg-gray-50 text-left">
                                {TABLE_HEADS.map((h) => (
                                    <th
                                        key={h}
                                        className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* On mobile BatchCard renders a full-width card inside a <td colSpan={7}> */}
                        {/* On desktop BatchCard renders a normal <tr> */}
                        <tbody className="md:divide-y md:divide-gray-100">
                            {dashboardList.map((b) => (
                                <BatchCard key={b.batch_id} batch={b} />
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
