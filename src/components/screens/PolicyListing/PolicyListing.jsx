import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectPolicy } from "../../../store/slices/batchSlice";
import { navigate } from "../../../store/slices/navigationSlice";
import { ArrowRight, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";
import { setPolicyCheckList, setpolicyAIStatus, setpolicyValidation, setPolicyRowPerPage, setPolicyValidated } from "../../../store/slices/batchSlice";
import { getPolicyCheckList } from "../../api/apisCall";
import Pagination from "../Pagination/Pagination";

const AI_MAP = { completed: "bg-green-50 text-green-600", running: "bg-amber-50 text-amber-600", failed: "bg-red-50 text-red-600" };
const CK_MAP = { "All Present": "bg-green-50 text-green-600", Pending: "bg-amber-50 text-amber-600", Missing: "bg-red-50 text-red-600" };
const VAL_MAP = { Pass: "bg-green-50 text-green-600", "Failed": "bg-amber-50 text-amber-600", pending: "bg-amber-50 text-amber-600" };
const TYPE_MAP = { Auto: "bg-blue-50 text-blue-600", Home: "bg-green-50 text-green-600", Commercial: "bg-purple-50 text-purple-600" };
const ST_MAP = { completed: "bg-green-50 text-green-600", "in progress": "bg-blue-50 text-blue-600", "needs attention": "bg-red-50 text-red-600", processing: "bg-blue-50 text-blue-600" };

const TABLE_HEADS = ["Policy #", "Customer", "Office Name", "Customer CSR", "Type", "Sold Date", "Docs", "AI Status", "Validation", "Action"];

const SORT_KEYS = {
    "Policy #": "policy_number",
    "Customer": "customer_name",
    "Customer CSR": "customer_csr",
};

const Badge = ({ label, map }) => (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[label] || "bg-gray-100 text-gray-500"}`}>
        {label}
    </span>
);

const SortIcon = ({ field, sortField, sortDir }) => {
    if (sortField !== field) return <ArrowUpDown size={11} className="text-gray-500 ms-1 inline" />;
    return sortDir === "asc"
        ? <ArrowUp size={11} className="text-indigo-500 ms-1 inline" />
        : <ArrowDown size={11} className="text-indigo-500 ms-1 inline" />;
};

const SkeletonRows = ({ rows = 5, cols = 7 }) => (
    <React.Fragment>
        {Array.from({ length: rows }).map((_, i) => (
            <tr key={`skel-row-${i}`} className="border-b border-gray-100">
                {Array.from({ length: cols }).map((_, j) => (
                    <td key={`skel-col-${j}`} className="px-4 py-3">
                        <div className="h-3 bg-gray-100 rounded-full animate-pulse"
                            style={{ width: `${50 + (j * 13) % 40}%` }} />
                    </td>
                ))}
            </tr>
        ))}
    </React.Fragment>
);

const SkeletonMobileCards = ({ count = 4 }) => (
    <React.Fragment>
        {Array.from({ length: count }).map((_, i) => (
            <div key={`skel-card-${i}`} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-gray-100">
                    <div className="h-3 w-32 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-3 w-10 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="px-4 pt-2.5 pb-3 flex flex-col gap-2">
                    <div className="h-3 w-40 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse mb-2" />
                    <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex gap-2 mt-1">
                        <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                        <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        ))}
    </React.Fragment>
);

const PolicyListing = () => {
    const dispatch = useDispatch();
    const { policySummary, policyList, policyRowPerPage } = useSelector((state) => state.batch);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState("asc");

    // ✅ Derived — no effect needed
    // const loading = !policyList;
    const loading = policyList === null || policyList === undefined;

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        setCurrentPage(1);
    };

    const filteredData = (policyList || []).filter((item) =>
        String(item.policy_number).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortField) return 0;
        const key = SORT_KEYS[sortField];
        if (!key) return 0;
        const aVal = a[key] ?? "";
        const bVal = b[key] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
    });

    const startIndex = (currentPage - 1) * policyRowPerPage;
    const paginatedList = sortedData.slice(startIndex, startIndex + policyRowPerPage);

    const handleRowsPerPageChange = (newRows) => {
        dispatch(setPolicyRowPerPage(newRows));
        setCurrentPage(1);
    };

    const handleOpenPolicy = (idx, aistatus, validation) => {
        dispatch(selectPolicy(idx));
        getPolicyCheckList(setPolicyCheckList, policyList[idx].policy_id, dispatch);
        dispatch(setpolicyAIStatus(aistatus))
        dispatch(setpolicyValidation(validation))
        dispatch(navigate("checklist"));
    };

    const Tooltip = ({ label, children }) => (
        <span className="relative group inline-flex items-center">
            {children}
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 whitespace-nowrap">
                <span className="bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded-md shadow-md">
                    {label}
                </span>
            </span>
        </span>
    );
    useEffect(() => {
        dispatch(setPolicyValidated(""))
    }, [])
    return (
        <div className="min-w-0 w-full">
            <Breadcrumb crumbs={[{ label: "Dashboard", screen: "dashboard" }, { label: "Policy List" }]} />

            {/* Page Header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                        Policies – <Tooltip label="Batch ID">{policySummary?.batch_id}</Tooltip>
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        <Tooltip label="Batch Date">Batch Date: {policySummary?.batch_date}</Tooltip>
                    </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ST_MAP[policySummary?.status] || "bg-gray-100 text-gray-500"}`}>
                        {policySummary?.status}
                    </span>
                    <div className="text-sm text-gray-500 flex gap-3">
                        <span>Total: <strong className="text-gray-800">{policySummary?.total_policies}</strong></span>
                        <span>Ready For Review: <strong className="text-green-600">{policySummary?.processed}</strong></span>
                        <span>Reviewed: <strong className="text-amber-500">{policySummary?.reviewed}</strong></span>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm">

                {/* Title + Search */}
                <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100">
                    <p className="text-[15px] font-semibold text-gray-800">Policies</p>
                    <input
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search"
                        className="w-[20%] border border-gray-200 rounded-lg px-3 py-0.5 text-[13px] font-mono text-gray-700 bg-gray-50 outline-none focus:border-[#6B55E8] focus:ring-1 focus:ring-[#6B55E8]/20 transition-all placeholder-gray-500"
                    />
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                {TABLE_HEADS.map((h) => {
                                    const isSortable = !!SORT_KEYS[h];
                                    return (
                                        <th
                                            key={h}
                                            onClick={() => isSortable && handleSort(h)}
                                            className={`text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 whitespace-nowrap select-none transition-colors ${isSortable
                                                ? "cursor-pointer hover:bg-gray-100 hover:text-gray-600"
                                                : "cursor-default"
                                                } ${sortField === h ? "text-indigo-500" : "text-gray-400"}`}
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
                        <tbody>
                            {loading ? (
                                <SkeletonRows rows={5} cols={TABLE_HEADS.length} />
                            ) : paginatedList.length > 0 ? (
                                paginatedList.map((p, i) => (
                                    <tr
                                        key={p.policy_id || p.id || i}
                                        onClick={() => handleOpenPolicy(startIndex + i, p.ai_status, p.validation_status)}
                                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
                                    >
                                        <td className="px-4 py-1.5 max-w-[140px]">
                                            <div className="relative group w-full">
                                                <p className="text-[13px] font-semibold text-gray-800 truncate">{p.policy_number}</p>
                                                <div className="absolute left-0 -top-8 mt-1.5 z-50 hidden group-hover:block">
                                                    <div className="bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">{p.policy_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 max-w-[140px]">
                                            <div className="relative group w-full">
                                                <p className="text-[13px] font-semibold text-gray-800 truncate">{p.customer_name || "-"}</p>
                                                <div className="absolute left-0 -top-8 mt-1.5 z-50 hidden group-hover:block">
                                                    <div className="bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">{p.customer_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 text-[13px] font-semibold text-gray-800">{p.customer_office_name || "-"}</td>
                                        <td className="px-4 py-1.5 text-[13px] font-semibold text-gray-800 truncate">{p.customer_csr || "-"}</td>
                                        <td className="px-4 py-1.5 text-[13px] text-gray-500 truncate">{p.policy_type || "-"}</td>
                                        <td className="px-4 py-1.5 max-w-[140px]">
                                            <div className="relative group w-full">
                                                <p className="text-[13px] text-gray-500 truncate">{p.sold_date || "-"}</p>
                                                <div className="absolute left-0 -top-8 mt-1.5 z-50 hidden group-hover:block">
                                                    <div className="bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">{p.sold_date || "null"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 text-[13px] font-bold text-gray-800">{p.documents_count || "0"}</td>
                                        <td className="px-4 py-1.5">
                                            <Badge label={p.ai_status === "complete" ? "completed" : p.ai_status} map={AI_MAP} />
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <Badge label={p.validation_status.replace("_", " ")} map={VAL_MAP} />
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenPolicy(startIndex + i, p.ai_status, p.validation_status); }}
                                                className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 border border-gray-200 bg-white hover:border-gray-300 hover:text-gray-700 px-2.5 py-1 rounded-md transition"
                                            >
                                                View <ArrowRight size={11} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={TABLE_HEADS.length} className="text-center py-8 text-sm text-gray-400">
                                        No policies found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col gap-3 p-3">
                    {loading ? (
                        <SkeletonMobileCards count={4} />
                    ) : paginatedList.length > 0 ? (
                        paginatedList.map((p, i) => {
                            const typeCls = TYPE_MAP[p.type] || "bg-gray-100 text-gray-500";
                            return (
                                <div
                                    key={p.policy_id || p.id || i}
                                    onClick={() => handleOpenPolicy(startIndex + i, p.ai_status, p.validation_status)}
                                    className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer active:bg-gray-50 transition-colors overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-gray-100">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[12px] font-bold text-primary font-mono">{p.policy_number}</span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeCls}`}>{p.policy_type}</span>
                                        </div>
                                        <ChevronRight size={15} className="text-gray-500 flex-shrink-0" />
                                    </div>
                                    <div className="px-4 pt-2.5 pb-3">
                                        <p className="text-[13px] font-bold text-gray-800 truncate mb-0.5">{p.customer_name}</p>
                                        <p className="text-[11px] text-gray-400 truncate mb-3">{p.customer_office_name} · {p.customer_csr}</p>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                                <p className="text-[10px] text-gray-400 font-medium mb-0.5">Sold Date</p>
                                                <p className="text-[12px] font-semibold text-gray-700">{p.sold_date}</p>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                                <p className="text-[10px] text-gray-400 font-medium mb-0.5">Documents</p>
                                                <p className="text-[12px] font-bold text-gray-700">{p.documents_count}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] text-gray-400">AI</span>
                                            <Badge label={p.ai_status} map={AI_MAP} />
                                            <span className="text-[10px] text-gray-400 ml-1">VAL</span>
                                            <Badge label={p.validation_status} map={VAL_MAP} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center py-8 text-sm text-gray-400">No policies found.</p>
                    )}
                </div>

                {/* Pagination */}
                <div className="border-t border-gray-100 px-4 py-2 flex justify-start relative">
                    <Pagination
                        records={sortedData.length}
                        rowsPerPage={policyRowPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default PolicyListing;