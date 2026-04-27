import React, { useState, useEffect, useRef } from "react";
import { validatorNavigate } from "../../../store/slices/navigationSlice";
import ValidatorBreadcrumb from "./ValidatorBreadcrumb";
import { motion } from "framer-motion";
import DocConfigTable from "./DocConfigTable";
import CrossValidationRuleTable from "./CrossValidationRuleTable";
import { setPolicyExtractedFields } from "../../../store/slices/validatorSetupSlice";
import { Shield, FileText, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const BG_PRESETS = [
    "bg-gradient-to-br from-[#8B7FF5] to-[#6B55E8]",
    "bg-gradient-to-br from-[#5BC8F5] to-[#0DA89B]",
    "bg-gradient-to-br from-[#F97A2A] to-[#E8450A]",
    "bg-gradient-to-br from-[#F472B6] to-[#EC4899]",
    "bg-gradient-to-br from-[#34D399] to-[#059669]",
    "bg-gradient-to-br from-[#60A5FA] to-[#2563EB]",
];

// ── Skeleton: header card ─────────────────────────────────────────────────────
const SkeletonHeaderCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-3">
        <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
                <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                <div className="flex flex-col gap-2">
                    <div className="h-3.5 w-36 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-3 w-48 bg-gray-100 rounded-full animate-pulse" />
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
        </div>
    </div>
);

// ── Skeleton: tab bar ─────────────────────────────────────────────────────────
const SkeletonTabBar = () => (
    <div className="bg-white border border-gray-200 rounded-sm w-full mt-3">
        <div className="flex items-center gap-4 border-b border-gray-200 px-4 py-3">
            <div className="h-3.5 w-40 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3.5 w-36 bg-gray-100 rounded-full animate-pulse" />
        </div>
    </div>
);

// ── Skeleton: table rows ──────────────────────────────────────────────────────
const SkeletonTableRows = ({ rows = 5, cols = 6 }) => (
    <div className="bg-white border border-gray-200 rounded-xl mt-3 overflow-hidden">
        {/* fake thead */}
        <div className="flex gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className="h-2.5 bg-gray-100 rounded-full animate-pulse" style={{ width: `${50 + (j * 11) % 40}px` }} />
            ))}
        </div>
        {/* fake rows */}
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
                {Array.from({ length: cols }).map((_, j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: `${45 + (j * 13) % 45}px` }} />
                ))}
            </div>
        ))}
    </div>
);

const AutoInsurance = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("documents");
    const [loading, setLoading] = useState(true);
    const tabBarRef = useRef(null);
    const activeTabRef = useRef(null);
    const { insureTypeIndex } = useSelector((state) => state.batch);
    const { validatorlist, validatorDocDetails } = useSelector((state) => state.validatorSetup);

    const tabs = [
        { key: "documents", label: "Document Configuration", Icon: FileText },
        { key: "validation", label: "Cross Validation Rules", Icon: ShieldCheck },
    ];

    // Hide loader once validatorDocDetails arrives
    useEffect(() => {
        if (validatorDocDetails && Object.keys(validatorDocDetails).length > 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [validatorDocDetails]);

    useEffect(() => {
        if (activeTabRef.current && tabBarRef.current) {
            activeTabRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [activeTab]);

    const selectedData = validatorlist?.[insureTypeIndex] || validatorlist?.[0];

    if (!selectedData) return null;

    return (
        <div className="min-w-0 w-full">
            <ValidatorBreadcrumb crumbs={[{ label: "ValidatorSetup", screen: "validatorsetup" }, { label: selectedData.name }]} />

            {loading ? (
                <>
                    <SkeletonHeaderCard />
                    <SkeletonTabBar />
                    <SkeletonTableRows rows={6} cols={6} />
                </>
            ) : (
                <>
                    {/* Header card */}
                    <div className="md:grid grid-cols bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-auto p-4 mt-3">
                        <div className="flex flex-wrap gap-2 justify-between items-center">
                            <div className="flex flex-row gap-2 items-center">
                                <div className={`w-fit p-2.5 rounded-xl shadow-sm ${BG_PRESETS[insureTypeIndex % BG_PRESETS.length]}`}>
                                    <Shield size={15} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-[15px] font-bold">{selectedData.name}</h1>
                                    <p className="text-xs text-gray-500 font-medium">{selectedData.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-row justify-center items-center gap-1">
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${selectedData.is_active
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                    {selectedData.is_active ? "Active" : "Inactive"}
                                </span>
                                <span className="bg-gray-100 text-gray-500 border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full border">
                                    {selectedData.provider || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className="bg-white border border-gray-200 rounded-sm w-full mt-3">
                        <div ref={tabBarRef} className="flex items-stretch border-b border-gray-200 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                            {tabs.map((t) => (
                                <button
                                    key={t.key}
                                    ref={activeTab === t.key ? activeTabRef : null}
                                    onClick={() => setActiveTab(t.key)}
                                    className={`relative flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-colors duration-200 ${activeTab === t.key ? "text-[#6B55E8]" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <t.Icon size={13} className="flex-shrink-0" />
                                    {t.label}
                                    {activeTab === t.key && (
                                        <motion.span
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6B55E8] rounded-full"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="mt-3">
                        {activeTab === "documents" && <DocConfigTable />}
                        {activeTab === "validation" && <CrossValidationRuleTable />}
                    </div>
                </>
            )}
        </div>
    );
};

export default AutoInsurance;