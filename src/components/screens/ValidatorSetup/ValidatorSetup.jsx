import React from "react";
import ValidatorBreadcrumb from "./ValidatorBreadcrumb";
import { validatorNavigate } from "../../../store/slices/navigationSlice";
import { setInsureTypeIndex } from "../../../store/slices/batchSlice";
import {
    Shield,
    ArrowRightSquare,
    ArrowRight
} from "lucide-react";
import { useDispatch } from "react-redux";
export const insureType = [
    {
        id: 1, icon: Shield, screen: "vadlidateInsurance",
        title: "Auto Insurance — New Policy Packet",
        dis: "Verification checklist for a new auto insurance policy packet.",
        status: "Active", type: "Auto", doc: 14, rules: 6,
        bg: "bg-gradient-to-br from-[#8B7FF5] to-[#6B55E8]",
        statusColor: "bg-green-50 text-green-600 border-green-200",
        typeColor: "bg-blue-50 text-blue-500 border-blue-200",
    },
    {
        id: 2, icon: Shield, screen: "vadlidateInsurance",
        title: "Home Insurance Policy",
        dis: "Checklist and validation rules for residential property insurance applications.",
        status: "Active", type: "Home", doc: 9, rules: 3,
        bg: "bg-gradient-to-br from-[#5BC8F5] to-[#0DA89B]",
        statusColor: "bg-green-50 text-green-600 border-green-200",
        typeColor: "bg-teal-50 text-teal-600 border-teal-200",
    },
    {
        id: 3, icon: Shield, screen: "vadlidateInsurance",
        title: "Commercial Insurance",
        dis: "Document and field validation for commercial liability and property policies.",
        status: "Inactive", type: "Commercial", doc: 14, rules: 6,
        bg: "bg-gradient-to-br from-[#F97A2A] to-[#E8450A]",
        statusColor: "bg-gray-100 text-gray-500 border-gray-200",
        typeColor: "bg-purple-50 text-purple-500 border-purple-200",
    },
];
const ValidatorSetup = () => {
    const dispatch = useDispatch()

    return (
        <>
            <div className="min-w-0 w-full">
                <ValidatorBreadcrumb crumbs={[{ label: "ValidatorSetup" }]} />
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Validator Setup</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Select a policy to configure document requirements and validation rules.</p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex gap-2">
                            <button
                                // onClick={() => dispatch(navigate("policyList"))}
                                className="flex items-center gap-1 text-xs font-semibold text-white border border-gray-200 bg-color hover:bg-gray-50 px-3 py-1.5 rounded-md transition-all hover:shadow-[0_1px_10px_rgba(99,102,241,0.15)] "
                            >
                                + New Policy
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insureType.map((value) => (
                        <div
                            key={value.id}
                            className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm p-5 gap-3 cursor-pointer transition-all duration-300 hover:border-indigo-400 transition-colors hover:shadow-[0_1px_10px_rgba(99,102,241,0.15)] "
                            onClick={() => {
                                dispatch(validatorNavigate(value.screen));
                                dispatch(setInsureTypeIndex(value.id));
                            }}

                        >
                            <div className={`${value.bg} w-fit p-3 rounded-xl shadow-md`}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="text-[16px] font-bold text-gray-800 leading-snug">
                                    {value.title}
                                </h2>
                                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                                    {value.dis}
                                </p>
                            </div>
                            <hr className="border-gray-100" />
                            {/* Footer: badges + stats + arrow */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${value.statusColor}`}>
                                    {value.status}
                                </span>
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${value.typeColor}`}>
                                    {value.type}
                                </span>
                                <div className="flex-1" />
                                <span className="text-[12px] text-gray-400 font-medium">{value.doc} docs</span>
                                <span className="text-[12px] text-gray-400 font-medium">{value.rules} rules</span>
                                <ArrowRight size={15} className="text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </>
    )
}
export default ValidatorSetup;