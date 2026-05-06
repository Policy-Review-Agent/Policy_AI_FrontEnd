import React from "react";
import { Search } from "lucide-react";
const UserList = () => {
    return (
        <>
            <div className="p-3">
                <div className="relative w-[22%]">
                    <Search
                        size={14}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="search"
                        placeholder="Search by name or email..."
                        className="border rounded text-[13px] outline-none pl-8 pr-2 py-1 w-full"
                    />
                </div>
                <div className="relative w-[20%]">
                    <Search
                        size={14}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="search"
                        placeholder="Search by name or email..."
                        className="border rounded text-[13px] outline-none pl-8 pr-2 py-1 w-full"
                    />
                </div>
            </div>
        </>
    )
}
export default UserList;