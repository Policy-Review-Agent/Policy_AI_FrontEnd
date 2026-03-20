import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navigate } from "../../../store/slices/navigationSlice";
import { selectCurrentPolicy, selectCurrentBatch, setChecklistSummary, setPolicyList, setPolicyCheckList, setDocumentData } from "../../../store/slices/batchSlice";
import { setSelectedDocViewerIdx } from "../../../store/slices/validationSlice";
import { getChecklistSummary, getPolicyList, getPolicyCheckList, getDocumentData } from "../../api/apisCall";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";
import ChecklistRow from "./ChecklistRow";

const TABLE_HEADS = ["#", "Document Name", "Detected", "Confidence", "Validation Rules", "Document"];

const PolicyChecklist = () => {
  const dispatch = useDispatch();
  const policy = useSelector(selectCurrentPolicy);
  const batch = useSelector(selectCurrentBatch);
  const { checklistSummary, policyCheckList, documentData } = useSelector((state) => state.batch);

  const present = (policyCheckList || []).filter((d) => (d.detected_status === "found" || d.st === "YES")).length;
  const missing = (policyCheckList || []).filter((d) => (d.detected_status === "missing" || d.st === "NO")).length;
  const partial = (policyCheckList || []).filter((d) => (d.detected_status === "partial" || d.st === "PARTIAL")).length;
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (batch?.batch_id && !policy) {
          await getPolicyList(setPolicyList, batch.batch_id, dispatch);
        }
        if (policy) {
          const idStr = policy.policy_id;
          await getChecklistSummary(setChecklistSummary, idStr, dispatch);
          await getPolicyCheckList(setPolicyCheckList, idStr, dispatch);
        }
      } catch (error) {
        console.error("Error in API calls:", error);
      }
    };

    fetchData();
  }, [batch?.batch_id, policy, dispatch]);
  const dashaboardCard = [
    {
      discription: 'Detected',
      count: present
    },
    {
      discription: 'Missing',
      count: missing
    },
    {
      discription: 'Partial',
      count: partial
    }
  ]

  const handleViewDoc = (idx) => {
    const idStr = policy.policy_id;
    getDocumentData(setDocumentData, idStr, dispatch);
    dispatch(setSelectedDocViewerIdx(idx));
    dispatch(navigate("documents"));
  };

  // if (!policy) return <p className="text-sm text-gray-400">No policy selected.</p>;
  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", screen: "dashboard" },
          { label: "Policy List", screen: "policyList" },
          { label: `${policy?.policy_number} – ${policy?.customer_name}` },
        ]}
      />

      {/* Page header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            {checklistSummary?.customer_name}-{checklistSummary?.policy_type} Insurance
          </h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {checklistSummary?.policy_number} . Sold {checklistSummary?.sold_date}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(navigate("policyList"))}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition"
          >
            <ArrowLeft size={12} /> Back
          </button>
          {/* <button
            onClick={() => dispatch(navigate("validation"))}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-primary hover:bg-primary-dark px-3 py-2 rounded-md transition"
          >
            Proceed to Validation <ArrowRight size={12} />
          </button> */}
        </div>
      </div>

      {/* Warning banner */}
      {/* {missing > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <strong>{missing} document{missing !== 1 ? "s" : ""} missing.</strong>{" "}
            Review before proceeding to validation.
          </p>
        </div>
      )} */}

      {/* Table card */}

      <div className="text-gray-800 flex justify-between items-center gap-3 mb-2 md:hidden">
        {dashaboardCard.map((item, index) => (
          <div className={`card px-2 py-2 rounded border w-full ${item.discription === "Detected" ? "bg-[#F0FDF4] border-[#BBF7D0]" : item.discription === "Missing" ? "bg-[#FEF2F2] border-[#FECACA]" : item.discription === "Partial" ? "bg-[#FFFBEB] border-[#FDE68A]" : "bg-white"
            }`} key={index}>
            <div className="card-body flex flex-col justify-center items-center">
              <p className={`text-[20px] font-bold ${item.discription === "Detected" ? "text-[#16A34A] " : item.discription === "Missing" ? "text-[#DC2626]" : item.discription === "Partial" ? "text-[#D97706]" : "text-gray-500"}`}>
                {item.count}
              </p>
              <span className={`${item.discription === "Detected" ? "text-[#16A34A] " : item.discription === "Missing" ? "text-[#DC2626]" : item.discription === "Partial" ? "text-[#D97706]" : "text-gray-500"}`}>
                {item.discription}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        {/* Title row */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100">
          <p className="text-[15px] font-semibold text-gray-800">Required Documents</p>
          <div className="flex gap-2">
            <span className="text-[11px] font-semibold bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
              ✓ Pass
            </span>
            <span className="text-[11px] font-semibold bg-red-50 text-red-500 px-2.5 py-1 rounded-full">
              ✗ Fail
            </span>
          </div>
        </div>

        {/* Desktop: show thead; Mobile: hide it (cards are self-labelled) */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="hidden md:table-header-group">
              <tr className="bg-gray-50 text-left">
                {TABLE_HEADS.map((h) => (
                  <th
                    key={h}
                    className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* On mobile tbody has p-3 gap so cards breathe inside the outer card */}
            <tbody className="md:table-row-group p-1 md:p-0 space-y-2 md:space-y-0">
              {policyCheckList?.map((doc, index) => (
                <ChecklistRow
                  key={doc.id}
                  doc={doc}
                  index={index}
                  onViewDoc={() => handleViewDoc(index)}
                />
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default PolicyChecklist;