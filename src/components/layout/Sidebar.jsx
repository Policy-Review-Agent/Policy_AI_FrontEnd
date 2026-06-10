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
    Folder,
    ArrowLeftSquare,
    LogOut,
    Upload,
    Users
} from "lucide-react";
import { getPolicySummary, getPolicyList } from "../api/apisCall";
import { logout } from "../../store/slices/authSlice";

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutGrid, children: [] },
    { id: "policyList", label: "Policy List", Icon: FileText, children: [] },
    { id: "checklist", label: "Policy Checklist", Icon: CheckCircle, children: [] },
    { id: "documents", label: "Documents", Icon: Folder, children: [] },
    {
        id: "validatorsetup", label: "Validator Setup", Icon: Shield,
        children: ["vadlidateInsurance", "homeInsurance", "commercialInsurance"],
    },
    { id: "uploadfile", label: "Upload File", Icon: Upload, children: [] },
    { id: "adminuser", label: "Admin Users", Icon: Users, children: [] },
];

const Sidebar = ({ onClose, onNavigate }) => {
    const dispatch = useDispatch();
    const screen = useSelector((s) => s.navigation.screen);
    const dashboardList = useSelector((s) => s.batch.dashboardList);
    const user = useSelector((s) => s.navigation.loginDetails);
    const selectedBatchId = useSelector((s) => s.batch.selectedBatchId);
    // Active if current screen matches item id OR is one of its children

    const isActive = (item) =>
        screen === item.id || (item.children || []).includes(screen);

    const handleNav = (id) => {
        const isPolicyRelated = ["policyList", "checklist", "documents", "validatorsetup"].includes(id);

        if (isPolicyRelated && dashboardList && dashboardList.length > 0) {
            // ✅ Use already-selected batch, fall back to first only if nothing selected
            const batchId = selectedBatchId ?? dashboardList[0].batch_id;

            getPolicySummary(setPolicySummary, batchId, dispatch);
            getPolicyList(setPolicyList, batchId, dispatch);
            dispatch(selectBatch(batchId));
            dispatch(selectPolicy(0));
        }

        dispatch(navigate(id));
        onNavigate?.();
    };

    return (
        <aside className="w-56 min-h-screen bg-white shadow-md border-r border-gray-200 flex flex-col">

            {/* Logo + collapse */}
            <div className="flex justify-between items-center gap-2 ps-5 pe-3 py-4 border-b-[1.5px] border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-color from-primary to-purple-500 flex items-center justify-center shadow-md shadow-primary/30 flex-shrink-0">
                        {/* <Shield size={14} className="text-white" /> */}
                        <img src="/assets/images/browserlogo.png" alt="logo"
                            style={{ width: 20, height: 14 }}
                        />
                    </div>
                    <div className="flex flex-col justify-start items-start">
                        <span className="text-[15px] font-bold text-gray-800 pt-1">
                            Agentic<span className="text-primary">Policy</span>
                        </span>
                        <span className="text-[12px] text-indigo-600 mt-[-5px] font-bold">Reviewer</span>
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

            {/* Nav */}
            <nav className="flex-1 px-3 py-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
                    Main Menu
                </p>
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item);
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNav(item.id)}
                            style={active ? {
                                backgroundColor: "rgba(107, 85, 232, 0.08)",
                                color: "#6B55E8",
                            } : {}}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium mb-0.5 transition-all ${active
                                ? "font-semibold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                        >
                            <item.Icon
                                size={14}
                                style={{ color: active ? "#6B55E8" : "" }}
                                className={active ? "" : "text-gray-400"}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* User chip & Logout */}
            <div className="p-3 border-t-[1.5px] border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-gray-50 transition min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-full bg-color from-primary to-purple-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                        {user?.data?.display_name ? user?.data?.display_name.charAt(0).toUpperCase() : "SR"}
                    </div>
                    <div className="truncate">
                        <p className="text-[13px] font-semibold text-gray-800 leading-none truncate">{user?.data?.display_name || "Sarah R."}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate">{user?.data?.user_email || "Sr.Underwriter"}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        sessionStorage.clear();
                        window.location.href = "/"
                    }}
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