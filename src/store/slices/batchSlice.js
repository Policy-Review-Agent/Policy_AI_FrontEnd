import { createSlice } from "@reduxjs/toolkit";

const batchSlice = createSlice({
  name: "batch",
  initialState: {
    batches: [],
    selectedBatchId: null,
    selectedPolicyIdx: 0,
    dashboardStats: null,
    dashboardList: [],
    policySummary: null,
    policyList: [],
    checklistSummary: null,
    policyCheckList: [],
    documentData: [],
    insureTypeIndex: 0,
  },
  reducers: {
    selectBatch: (state, action) => {
      state.selectedBatchId = action.payload;
      state.selectedPolicyIdx = 0;
    },
    selectPolicy: (state, action) => {
      state.selectedPolicyIdx = action.payload;
    },
    setDashboardStats: (state, action) => {
      state.dashboardStats = action.payload
    },
    setDashboardList: (state, action) => {
      state.dashboardList = action.payload
    },
    setPolicySummary: (state, action) => {
      state.policySummary = action.payload
    },
    setPolicyList: (state, action) => {
      state.policyList = action.payload
    },
    setChecklistSummary: (state, action) => {
      state.checklistSummary = action.payload
    },
    setPolicyCheckList: (state, action) => {
      state.policyCheckList = action.payload
    },
    setDocumentData: (state, action) => {
      state.documentData = action.payload
    },
    setInsureTypeIndex: (state, action) => {
      state.insureTypeIndex = action.payload
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