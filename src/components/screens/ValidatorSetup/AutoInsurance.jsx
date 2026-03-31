import React, { useState } from "react";
import { validatorNavigate } from "../../../store/slices/navigationSlice";
import ValidatorBreadcrumb from "./ValidatorBreadcrumb";
import FileEidt from "../../../../public/assets/images/FileEdit.png"
import { motion } from "framer-motion";
import DocConfigTable from "./DocConfigTable";
import CrossValidationRuleTable from "./CrossValidationRuleTable"
import { insureType } from "./ValidatorSetup";
import {
    Shield,
    File,
    FileText,
    ArrowRightSquare,
    ArrowRight
} from "lucide-react";
import { useSelector } from "react-redux";
const AutoInsurance = () => {
    const [activeTab, setActiveTab] = useState("documents");
    const {insureTypeIndex} = useSelector((state) => state.batch);
    const tabs = [
        { key: "documents", label: "Document Configuration", Icon: FileText },
        { key: "validation", label: "Cross Validation Rules", Icon: Shield },
    ];
    const selectedData = insureType.find((item) => item.id === insureTypeIndex ) || insureType[0];
    return (
        <>
            <div className="min-w-0 w-full">
                <ValidatorBreadcrumb crumbs={[{ label: "ValidatorSetup", screen: "validatorsetup", }, { label: selectedData.title }]} />
                <div className="md:grid grid-cols bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-auto p-4  mt-3">
                    <div className="flex flex-wrap gap-2 justify-between items-center">

                        <div className="flex flex-row gap-2 items-center">

                            {/* Icon */}
                            <div className={`${selectedData.bg} w-fit p-2.5 rounded-xl shadow-sm`}>
                                <selectedData.icon size={15} />
                            </div>

                            {/* Title + Description */}
                            <div>
                                <h1 className="text-[15px] font-bold">
                                    {selectedData.title}
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">
                                    {selectedData.dis}
                                </p>
                            </div>
                        </div>

                        {/* Right side badges */}
                        <div className="flex flex-row justify-center items-center gap-1">

                            <span className={`${selectedData.statusColor} text-[11px] font-semibold px-3 py-0.5 rounded-full border`}>
                                {selectedData.status}
                            </span>

                            <span className={`${selectedData.typeColor} text-[11px] font-semibold px-3 py-0.5 rounded-full border`}>
                                {selectedData.type}
                            </span>

                            <span className="bg-gray-100 text-gray-500 border-gray-200 text-[11px] font-semibold px-3 py-0.5 rounded-full border">
                                la_familia_azle
                            </span>

                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-sm w-full mt-3">
                    {/* Tab bar */}
                    <div className="flex items-stretch border-b border-gray-200 overflow-x-auto"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`relative flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-colors duration-200 ${activeTab === t.key
                                    ? "text-[#6B55E8]"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <t.Icon size={13} className="flex-shrink-0" />
                                {t.label}
                                {/* Animated underline slides between tabs */}
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
                    {activeTab === "documents" && (
                        <div>
                            <DocConfigTable />
                        </div>
                    )}
                    {activeTab === "validation" && (
                        <div>
                            <CrossValidationRuleTable />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
export default AutoInsurance;