import React, { useState } from "react";
import Breadcrumb from "../../layout/Breadcrumb";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import UserList from "./UserList";

const AdminUserMain = () => {
    const [active, setActive] = useState("dashboard");

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "users", label: "User List", icon: Users },
        { id: "api", label: "API Log", icon: FileText },
        { id: "setup", label: "Setup Guide", icon: Settings },
    ];

    return (
        <>
            <div>
                <Breadcrumb crumbs={[{ label: "Admin User" }]} />

                {/* Page header */}
                <div className="flex items-center justify-between mb-0 w-full">
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                        Admin Users — InfoSwift
                    </h1>
                    <div className="flex justify-center items-center gap-2 me-1">
                        <p className="text-[10px] bg-[#D1FAE5] text-gray-500 font-bold rounded-full px-2 py-1">
                            Complete
                        </p>
                        <p className="text-[13px] text-gray-700 font-bold">
                            Total : <span>8</span>
                        </p>
                        <p className="text-[13px] text-gray-700 font-bold">
                            Active : <span>5</span>
                        </p>
                        <p className="text-[13px] text-gray-700 font-bold">
                            Pending: <span>2</span>
                        </p>
                    </div>
                </div>

                <p className="text-[11px] text-gray-500 mb-2">
                    Batch ID : <span>2025-05-04</span>
                </p>

                {/* Tab Bar — matches screenshot */}
                <div className="bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center border-b">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = active === tab.id;

                            return (
                                <div
                                    key={tab.id}
                                    onClick={() => setActive(tab.id)}
                                    className="relative cursor-pointer px-4 py-3"
                                >
                                    {/* Icon + Label */}
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            size={15}
                                            className={isActive ? "text-indigo-600" : "text-gray-400"}
                                        />
                                        <span
                                            className={`text-[13px] font-medium ${isActive ? "text-indigo-600" : "text-gray-500"
                                                }`}
                                        >
                                            {tab.label}
                                        </span>
                                    </div>

                                    {/* Active underline — sits on bottom border */}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Tab Content */}
                    {active === "dashboard" && <div><AdminDashboard/></div>}
                    {active === "users" && <div><UserList/></div>}
                    {active === "api" && <div>API Log Content</div>}
                    {active === "setup" && <div>Setup Guide Content</div>}
                </div>
            </div>
        </>
    );
};

export default AdminUserMain;