import React, { useState } from "react";
import { Search, } from "lucide-react";
import CustomSelect from "./CustomSelect";
const Offices = [
    { value: "all offices", label: "All Offices", },
    { value: "la familia", label: "La Familia", },
    { value: "paccore", label: "Paccore", },
    { value: "zywave auto", label: "Zywave Auto", },
];
const Location = [
    { value: "all locations", label: "All Locations", },
    { value: "New York", label: "London", },
    { value: "singapore", label: "Singapore", },
    { value: "dubai", label: "Dubai", },
]
const Status = [
    { value: "all statutes ", label: "All Statuses", },
    { value: "active", label: "Active", },
    { value: "pending", label: "Pending", },
    { value: "inactive", label: "InActive", },
]
const UserList = () => {
    const [office, setOffice] = useState(null);
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState(null);
    return (
        <>
            <div className="px-3 py-2 flex gap-2 justify-between items-center">
                {/* Left — search + filters */}
                <div className="flex gap-2 items-center flex-1 min-w-0">
                    {/* Search */}
                    <div className="relative w-56 flex-shrink-0">
                        <Search
                            size={14}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="search"
                            placeholder="Search by name or email..."
                            className="w-full h-8 pl-7 pr-2 text-[13px] bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20"
                        />
                    </div>

                    {/* Filters */}
                    <div className="w-40 flex-shrink-0">
                        <CustomSelect value={office} onChange={setOffice} placeholder="Office" options={Offices} />
                    </div>
                    <div className="w-40 flex-shrink-0">
                        <CustomSelect value={location} onChange={setLocation} placeholder="Location" options={Location} />
                    </div>
                    <div className="w-40 flex-shrink-0">
                        <CustomSelect value={status} onChange={setStatus} placeholder="Status" options={Status} />
                    </div>
                </div>

                {/* Right — action */}
                <button className="flex-shrink-0 flex items-center gap-1 h-8 px-3 text-[13px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] rounded-md transition-all whitespace-nowrap">
                    + Invite User
                </button>
            </div>
        </>
    )
}
export default UserList;