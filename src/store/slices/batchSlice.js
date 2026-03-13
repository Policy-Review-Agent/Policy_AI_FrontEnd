import { createSlice } from "@reduxjs/toolkit";
import { batches, batchPolicies } from "../../data/batches";

const batchSlice = createSlice({
  name: "batch",
  initialState: {
    batches,
    selectedBatchId:   batches[0].id,
    selectedPolicyIdx: 0,
  },
  reducers: {
    selectBatch: (state, action) => {
      state.selectedBatchId   = action.payload;
      state.selectedPolicyIdx = 0;
    },
    selectPolicy: (state, action) => {
      state.selectedPolicyIdx = action.payload;
    },
  },
});

export const { selectBatch, selectPolicy } = batchSlice.actions;

export const selectCurrentBatch = (s) =>
  s.batch.batches.find((b) => b.id === s.batch.selectedBatchId);

export const selectCurrentPolicies = (s) =>
  batchPolicies[s.batch.selectedBatchId] || [];

export const selectCurrentPolicy = (s) => {
  const policies = batchPolicies[s.batch.selectedBatchId] || [];
  return policies[s.batch.selectedPolicyIdx];
};

export default batchSlice.reducer;