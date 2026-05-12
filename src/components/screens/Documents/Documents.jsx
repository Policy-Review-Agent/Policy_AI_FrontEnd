import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setSelectedDocViewerIdx,
    setZoom2,
} from "../../../store/slices/validationSlice";
import { navigate } from "../../../store/slices/navigationSlice";
import { selectCurrentPolicy, setDocumentData, setPolicyCheckList } from "../../../store/slices/batchSlice";
import { getDocumentData, getPolicyCheckList } from "../../api/apisCall";
// import { docChecklist } from "../../../data/checklist";
import { ArrowLeft } from "lucide-react";
import Breadcrumb from "../../layout/Breadcrumb";
import DocumentList from "./DocumentList";
import DocumentView from "./DocumentView";

const FALLBACK_PDF_URL = "/doc/Policy_ChuckShirey.pdf";

const Documents = () => {
    const dispatch = useDispatch();
    const policy = useSelector(selectCurrentPolicy);
    const { selectedDocViewerIdx } = useSelector((s) => s.validation);
    const { documentData, policyCheckList } = useSelector((state) => state.batch);

    const [mobileDetail, setMobileDetail] = useState(false);
    const lastFetchedRef = useRef(null);

    const isApiDataObject = documentData && typeof documentData === 'object' && !Array.isArray(documentData) && documentData.documents;

    const activeList = isApiDataObject
        ? documentData.documents
        : (Array.isArray(documentData) && documentData.length > 0
            ? documentData
            : (policyCheckList && policyCheckList.length > 0 ? policyCheckList : []));

    const doc = activeList[selectedDocViewerIdx];
    const pdfUrl = (isApiDataObject && documentData.selected_document?.blob_url)
        ? documentData.selected_document.blob_url
        : (doc?.pdf_url || doc?.pdfUrl || FALLBACK_PDF_URL);

    const validFilesLength = activeList.filter((d) => {
        const s = (d.status || d.detected_status || d.st || "").toLowerCase();
        return s !== "no" && s !== "missing";
    }).length;

    const handleSelectDoc = (idx) => {
        const selectedDoc = activeList[idx];
        const checklistItemId = selectedDoc?.id || selectedDoc?.checklist_item_id || selectedDoc?.checklist_id;
        if (checklistItemId && policy?.policy_id) {
            lastFetchedRef.current = String(checklistItemId);
            getDocumentData(setDocumentData, policy.policy_id, dispatch, checklistItemId);
        }
        dispatch(setSelectedDocViewerIdx(idx));
        dispatch(setZoom2(1));
        setMobileDetail(true);
    };

    // Fetch policy checklist if navigating directly
    useEffect(() => {
        if (policy?.policy_id) {
            getPolicyCheckList(setPolicyCheckList, policy.policy_id, dispatch);
        }
    }, [policy?.policy_id, dispatch]);

    // Auto-fetch first document data on mount or when policy/list becomes available
    useEffect(() => {
        // ONLY trigger if we have a real checklist from the API (not the static docChecklist)
        if (policy?.policy_id && policyCheckList.length > 0) {
            const currentDoc = policyCheckList[selectedDocViewerIdx];
            const checklistItemId = currentDoc?.id || currentDoc?.checklist_item_id || currentDoc?.checklist_id;

            const fetchedId = isApiDataObject ? (documentData?.selected_document?.checklist_item_id || documentData?.selected_document?.id) : null;

            const fetchedIdStr = fetchedId ? String(fetchedId) : null;
            const checklistItemIdStr = checklistItemId ? String(checklistItemId) : null;
            const isStale = isApiDataObject && fetchedIdStr !== checklistItemIdStr;
            const hasRequested = lastFetchedRef.current === checklistItemIdStr;

            // If documentData is NOT yet an API object with details, or it's stale, fetch it just once
            if ((!isApiDataObject || isStale) && !hasRequested) {
                if (checklistItemId) {
                    lastFetchedRef.current = checklistItemIdStr;
                    getDocumentData(setDocumentData, policy.policy_id, dispatch, checklistItemId);
                }
            }
        }
    }, [policy?.policy_id, policyCheckList, isApiDataObject, documentData, selectedDocViewerIdx, dispatch]);

    return (
        <div className="min-w-0 w-full">
            <Breadcrumb crumbs={[{ label: "Dashboard", screen: "dashboard" }, { label: "Policy Checklist", screen: "checklist" }, { label: "Document" }]} />

            <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Document Viewer</h1>
                    {policy && <p className="text-sm text-gray-400 mt-0.5">{policy.customer_name} · {policy.policy_number}</p>}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => dispatch(navigate("checklist"))}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition"
                    >
                        <ArrowLeft size={11} /> Checklist
                    </button>
                </div>
            </div>

            {/* DESKTOP */}
            {/* <div className="hidden md:grid grid-cols-[320px,1fr] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[620px]"> */}
            <div className="hidden md:grid grid-cols-[320px,1fr] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[620px] max-h-[620px]">
                <DocumentList
                    activeList={activeList}
                    selectedDocViewerIdx={selectedDocViewerIdx}
                    handleSelectDoc={handleSelectDoc}
                    validFilesLength={validFilesLength}
                />
                <DocumentView
                    doc={doc}
                    documentData={documentData}
                    isApiDataObject={isApiDataObject}
                    pdfUrl={pdfUrl}
                    setMobileDetail={setMobileDetail}
                />
            </div>

            {/* MOBILE */}
            <div className="md:hidden bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {!mobileDetail && (
                    <DocumentList
                        activeList={activeList}
                        selectedDocViewerIdx={selectedDocViewerIdx}
                        handleSelectDoc={handleSelectDoc}
                        validFilesLength={validFilesLength}
                    />
                )}
                {mobileDetail && (
                    <DocumentView
                        doc={doc}
                        documentData={documentData}
                        isApiDataObject={isApiDataObject}
                        pdfUrl={pdfUrl}
                        setMobileDetail={setMobileDetail}
                    />
                )}
            </div>
        </div>
    );
};

export default Documents;