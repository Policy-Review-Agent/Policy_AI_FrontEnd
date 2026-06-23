import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, Check, ArrowLeft, ArrowRight } from "lucide-react";

const Pagination = ({ records, rowsPerPage, currentPage, onPageChange, onRowsPerPageChange }) => {
    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const ref = useRef(null);
    const options = [1, 10, 25, 50, 100];
    const totalPages = Math.max(1, Math.ceil(records / rowsPerPage));

    const normalised = options.map((o) => ({
        label: o,
        value: o
    }));

    const selectedLabel =
        normalised.find((o) => o.value === rowsPerPage)?.label ?? "Select";

    // Build page numbers with ellipsis
    const getPageNumbers = () => {
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pageSet = new Set([1, totalPages, currentPage]);
        if (currentPage > 1) pageSet.add(currentPage - 1);
        if (currentPage < totalPages) pageSet.add(currentPage + 1);
        const sorted = Array.from(pageSet).sort((a, b) => a - b);
        const result = [];
        for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
            result.push(sorted[i]);
        }
        return result;
    };

    const pageNumbers = getPageNumbers();

    // ✅ Handle dropdown position based on screen
    const handleToggle = () => {
        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;

        // if less space below → open upward
        setOpenUpward(spaceBelow < 150);

        setOpen(!open);
    };

    const handleChange = (val) => {
        onRowsPerPageChange(val);
        onPageChange(1);
        setOpen(false);
    };

    // ✅ Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div className="flex flex-wrap justify-between items-center w-full gap-2">
                <div ref={ref} className="relative inline-block">
                    <div className="flex justify-start items-center gap-2">
                        <span className="hidden md:inline text-xs font-bold text-gray-500">
                            Number Of Rows
                        </span>

                        {/* Button */}
                        <div
                            onClick={handleToggle}
                            className="flex items-center justify-between gap-1 border border-gray-200 rounded-lg px-2 py-1 text-[12px] bg-gray-50 cursor-pointer hover:border-[#6B55E8]"
                        >
                            <span>{selectedLabel}</span>

                            <ChevronDown
                                size={14}
                                className={`ml-0 transition-transform text-gray-500 ${open ? "rotate-180" : ""}`}
                            />
                        </div>
                    </div>

                    {/* ✅ Dropdown OUTSIDE button */}
                    {open && (
                        <div
                            className={`absolute left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto
                    ${openUpward ? "bottom-full mb-1" : "top-full mt-1"}`}
                        >
                            {normalised.map((item) => (
                                <div
                                    key={item.value}
                                    onClick={() => handleChange(item.value)}
                                    className={`px-3 py-2 text-[12px] cursor-pointer flex justify-between
                            ${rowsPerPage === item.value
                                            ? "bg-indigo-50 text-indigo-600 font-semibold"
                                            : "text-gray-700 hover:bg-gray-100 hover:font-semibold"
                                        }`}
                                >
                                    <span>{item.label}</span>
                                    {rowsPerPage === item.value && <Check size={12} />}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
                <div className="flex items-center gap-1">
                    {/* Prev */}
                    <span
                        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        className={`flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg shadow-xs w-fit px-2 py-1 text-[12px] hover:bg-indigo-100
                            ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <ArrowLeft size={12} />Prev
                    </span>

                    {/* Dynamic page numbers */}
                    {pageNumbers.map((item, idx) =>
                        item === "..." ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="flex justify-center items-center bg-gray-50 border border-gray-200 rounded-lg shadow-xs w-fit px-2.5 py-1 text-[12px] hover:bg-indigo-100"
                            >
                                ...
                            </span>
                        ) : (
                            <span
                                key={item}
                                onClick={() => onPageChange(item)}
                                className={`bg-gray-50 border border-gray-200 rounded-lg shadow-xs w-fit px-2.5 py-1 text-[12px] cursor-pointer
                                    ${currentPage === item
                                        ? "bg-indigo-500 border-indigo-50 text-white font-semibold"
                                        : "hover:bg-indigo-100"
                                    }`}
                            >
                                {item}
                            </span>
                        )
                    )}

                    {/* Next */}
                    <span
                        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                        className={`flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg shadow-xs w-fit px-2 py-1 text-[12px] hover:bg-indigo-100
                            ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        Next<ArrowRight size={12} />
                    </span>
                </div>
            </div>
        </>
    );
};

export default Pagination;