import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { navigate } from "../../store/slices/navigationSlice";
import {
    selectPolicy,
    selectBatch,
    setPolicySummary,
    setPolicyList,
} from "../../store/slices/batchSlice";
import {
    Shield,
    LayoutGrid,
    FileText,
    CheckCircle,
    Search,
    Folder,
    ArrowLeftSquare,
    LogOut,
} from "lucide-react";
import { getPolicySummary, getPolicyList } from "../api/apisCall";
import { logout } from "../../store/slices/authSlice";

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutGrid },
    { id: "policyList", label: "Policy List", Icon: FileText },
    { id: "checklist", label: "Policy Checklist", Icon: CheckCircle },
    // { id: "validation", label: "Validation",        Icon: Search      },
    { id: "documents", label: "Documents", Icon: Folder },
];

// First batch ID — change this to match your actual first batch in the store
const Sidebar = ({ onClose, onNavigate }) => {
    const dispatch = useDispatch();
    const screen = useSelector((s) => s.navigation.screen);
    const dashboardList = useSelector((s) => s.batch.dashboardList);
    const user = useSelector((s) => s.auth.user);

    const handleNav = (id) => {
        // If we have data, default to the first batch and first policy when navigating from Sidebar
        if (dashboardList && dashboardList.length > 0) {
            const firstBatchId = dashboardList[0].batch_id;
            // Fetch the policy list and summary for the first batch
            getPolicySummary(setPolicySummary, firstBatchId, dispatch);
            getPolicyList(setPolicyList, firstBatchId, dispatch);

            // Set Redux state
            dispatch(selectBatch(firstBatchId));
            dispatch(selectPolicy(0));
        }

        dispatch(navigate(id));
        onNavigate?.();
    };

    return (
        <aside className="w-56 min-h-screen bg-white shadow-md border-r border-gray-200 flex flex-col">

            {/* ── Logo + collapse arrow ── */}
            <div className="flex justify-between items-center gap-2 ps-5 pe-3 py-4 border-b-[1.5px] border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-color rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-md shadow-primary/30 flex-shrink-0">
                        <Shield size={14} className="text-white" />
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="text-[15px] font-bold text-gray-800 pt-1">
                            Agentic<span className="text-primary">Policy</span>
                        </span>
                        <span className="text-[12px] text-gray-800 mt-[-5px] font-bold">Reviewer</span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
                    title="Collapse sidebar"
                >
                    <ArrowLeftSquare size={16} />
                </button>
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 px-3 py-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
                    Main Menu
                </p>
                {NAV_ITEMS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        onClick={() => handleNav(id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium mb-0.5 transition-all ${screen === id
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                    >
                        <Icon
                            size={14}
                            className={screen === id ? "text-primary" : "text-gray-400"}
                        />
                        {label}
                    </button>
                ))}
            </nav>

            {/* ── User chip & Logout ── */}
            <div className="p-3 border-t-[1.5px] border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-gray-50 transition min-w-0 flex-1">
                    <div className="w-7 h-7 bg-color rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                        {user?.name ? user.name.charAt(0) : "SR"}
                    </div>
                    <div className="truncate">
                        <p className="text-[13px] font-semibold text-gray-800 leading-none truncate">{user?.name || "Sarah R."}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{user?.email || "Sr.Underwriter"}</p>
                    </div>
                </div>
                <button
                    onClick={() => dispatch(logout())}
                    title="Logout"
                    className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;