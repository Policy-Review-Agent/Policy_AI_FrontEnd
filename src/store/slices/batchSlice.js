import { createSlice } from "@reduxjs/toolkit";

const batchSlice = createSlice({
  name: "batch",
  initialState: {
    batches: [],
    selectedBatchId: sessionStorage.getItem("selected_batch_id") || null,
    selectedPolicyIdx: JSON.parse(sessionStorage.getItem("selected_policy")) ?? null,
    dashboardStats: null,
    dashboardList: [],
    policySummary: JSON.parse(sessionStorage.getItem("policy_summary")) || null,
    policyList: JSON.parse(sessionStorage.getItem("policy_list")) || null,
    checklistSummary: null,
    policyCheckList: [],
    documentData: [],
    insureTypeIndex: 0,
    policyAIStatus: sessionStorage.getItem("policy_ai_status") || "",
    policyvalidation: sessionStorage.getItem("policy_validation") || "",
    rowsPerPage: 10,
    policyRowPerPage: 10,
    policyValidated: {}
  },
  reducers: {
    selectBatch: (state, action) => {
      state.selectedBatchId = action.payload;
      state.selectedPolicyIdx = 0;
      sessionStorage.setItem("selected_batch_id", action.payload);
    },
    selectPolicy: (state, action) => {
      state.selectedPolicyIdx = action.payload;
      sessionStorage.setItem("selected_policy", JSON.stringify(action.payload));
    },
    setDashboardStats: (state, action) => {
      state.dashboardStats = action.payload;
    },
    setDashboardList: (state, action) => {
      state.dashboardList = action.payload;
    },
    setPolicySummary: (state, action) => {
      state.policySummary = action.payload;
      sessionStorage.setItem("policy_summary", JSON.stringify(action.payload));
    },
    setPolicyList: (state, action) => {
      state.policyList = action.payload;
      sessionStorage.setItem("policy_list", JSON.stringify(action.payload));
    },
    resetPolicyList: (state) => {
      state.policyList = null;
      state.policySummary = null;
      sessionStorage.removeItem("policy_list");
      sessionStorage.removeItem("policy_summary");
    },
    setChecklistSummary: (state, action) => {
      state.checklistSummary = action.payload;
    },
    setPolicyCheckList: (state, action) => {
      state.policyCheckList = action.payload;
    },
    setDocumentData: (state, action) => {
      state.documentData = action.payload;
    },
    setInsureTypeIndex: (state, action) => {
      state.insureTypeIndex = action.payload;
    },
    setpolicyAIStatus: (state, action) => {
      state.policyAIStatus = action.payload;
      sessionStorage.setItem("policy_ai_status", action.payload);
    },
    setpolicyValidation: (state, action) => {
      state.policyvalidation = action.payload;
      sessionStorage.setItem("policy_validation", action.payload);
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
    setPolicyRowPerPage: (state, action) => {
      state.policyRowPerPage = action.payload;
    },
    setPolicyValidated: (state, action) => {
      state.policyValidated = action.payload;
    }
  },
});

export const {
  selectBatch,
  selectPolicy,
  setDashboardStats,
  setDashboardList,
  setPolicySummary,
  setPolicyList,
  setChecklistSummary,
  setPolicyCheckList,
  setDocumentData,
  setInsureTypeIndex,
  setpolicyAIStatus,
  setpolicyValidation,
  resetPolicyList,
  setRowsPerPage,
  setPolicyRowPerPage,
  setPolicyValidated,
} = batchSlice.actions;

export const selectCurrentBatch = (s) =>
  s.batch.dashboardList.find((b) => b.batch_id === s.batch.selectedBatchId);

export const selectCurrentPolicies = (s) =>
  s.batch.policyList || [];

export const selectCurrentPolicy = (s) => {
  const policies = s.batch.policyList || [];
  return policies[s.batch.selectedPolicyIdx];
};

export default batchSlice.reducer;