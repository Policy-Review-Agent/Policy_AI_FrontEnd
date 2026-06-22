import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedDocViewerIdx,
  setZoom2,
} from "../../../store/slices/validationSlice";
import { navigate } from "../../../store/slices/navigationSlice";
import {
  selectCurrentPolicy,
  setDocumentData,
  setPolicyCheckList,
  resetDocumentData,
  setDocumentPageData,
} from "../../../store/slices/batchSlice";
import { getDocumentData, getPolicyCheckList } from "../../api/apisCall";
// ← getDocumentPage removed — no longer needed
import { ArrowLeft } from "lucide-react";
import Breadcrumb   from "../../layout/Breadcrumb";
import DocumentList from "./DocumentList";
import DocumentView from "./DocumentView";

const Documents = () => {
  const dispatch = useDispatch();
  const policy   = useSelector(selectCurrentPolicy);
  const { selectedDocViewerIdx } = useSelector((s) => s.validation);
  const { documentData, policyCheckList, documentPageData } =
    useSelector((s) => s.batch);

  const [mobileDetail, setMobileDetail] = useState(false);
  const lastFetchedRef   = useRef(null);
  const lastPageFetchRef = useRef(null);

  const isApiDataObject = documentData &&
    typeof documentData === "object" &&
    !Array.isArray(documentData) &&
    documentData.documents;

  const activeList = isApiDataObject
    ? documentData.documents
    : (Array.isArray(documentData) && documentData.length > 0
        ? documentData
        : (policyCheckList?.length > 0 ? policyCheckList : []));

  const doc = activeList?.[selectedDocViewerIdx];

  const validFilesLength = activeList.filter((d) => {
    const s = (d.status || d.detected_status || d.st || "").toLowerCase();
    return s !== "no" && s !== "missing";
  }).length;

  // ── Watch documentData → build PDF stream URL when doc_id changes ─────────
  // No fetch needed — PDF.js will call the stream endpoint directly
  useEffect(() => {
    if (!isApiDataObject) return;

    const documentId = documentData?.selected_document?.document_id;
    if (!documentId) return;
    if (lastPageFetchRef.current === String(documentId)) return;

    lastPageFetchRef.current = String(documentId);
    dispatch(setDocumentPageData(null)); // clear stale while new doc loads

    // Build the stream URL — PDF.js fetches this internally with auth cookies
    const pdfUrl = `/api/frontend/documents/${documentId}/stream/?download=true`;
    dispatch(setDocumentPageData({ pdfUrl }));
  }, [documentData, isApiDataObject, dispatch]);

  // ── Select a document from the list ──────────────────────────────────────
  const handleSelectDoc = (idx) => {
    const selectedDoc     = activeList[idx];
    const checklistItemId =
      selectedDoc?.id ||
      selectedDoc?.checklist_item_id ||
      selectedDoc?.checklist_id;

    if (checklistItemId && policy?.policy_id) {
      dispatch(resetDocumentData());
      dispatch(setDocumentPageData(null));
      lastFetchedRef.current   = String(checklistItemId);
      lastPageFetchRef.current = null; // allow re-fetch for new doc_id
      getDocumentData(setDocumentData, policy.policy_id, dispatch, checklistItemId);
    }

    dispatch(setSelectedDocViewerIdx(idx));
    dispatch(setZoom2(1));
    setMobileDetail(true);
  };

  // ── Fetch checklist on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (policy?.policy_id) {
      getPolicyCheckList(setPolicyCheckList, policy.policy_id, dispatch);
    }
  }, [policy?.policy_id, dispatch]);

  // ── Auto-fetch first doc when checklist loads ─────────────────────────────
  useEffect(() => {
    if (!policy?.policy_id || !policyCheckList?.length) return;

    const currentDoc      = policyCheckList[selectedDocViewerIdx];
    const checklistItemId =
      currentDoc?.id ||
      currentDoc?.checklist_item_id ||
      currentDoc?.checklist_id;

    const fetchedId = isApiDataObject
      ? (documentData?.selected_document?.checklist_item_id ||
         documentData?.selected_document?.id)
      : null;

    const fetchedIdStr       = fetchedId       ? String(fetchedId)       : null;
    const checklistItemIdStr = checklistItemId ? String(checklistItemId) : null;
    const isStale      = isApiDataObject && fetchedIdStr !== checklistItemIdStr;
    const hasRequested = lastFetchedRef.current === checklistItemIdStr;

    if ((!isApiDataObject || isStale) && !hasRequested && checklistItemId) {
      dispatch(resetDocumentData());
      dispatch(setDocumentPageData(null));
      lastFetchedRef.current   = checklistItemIdStr;
      lastPageFetchRef.current = null;
      getDocumentData(setDocumentData, policy.policy_id, dispatch, checklistItemId);
    }
  }, [policy?.policy_id, policyCheckList, isApiDataObject,
      documentData, selectedDocViewerIdx, dispatch]);

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

  return (
    <div className="min-w-0 w-full">
      <Breadcrumb crumbs={[
        { label: "Dashboard",        screen: "dashboard" },
        { label: "Policy Checklist", screen: "checklist" },
        { label: "Document" }
      ]} />

      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Document Viewer
          </h1>
          {policy && (
            <p className="text-sm text-gray-400 mt-0.5">
              <Tooltip label="Customer Name">{policy.customer_name}</Tooltip>
              {" · "}
              <Tooltip label="Policy Number">{policy.policy_number}</Tooltip>
            </p>
          )}
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
          documentPageData={documentPageData}
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
            documentPageData={documentPageData}
            setMobileDetail={setMobileDetail}
          />
        )}
      </div>
    </div>
  );
};

export default Documents;