import { createSlice } from "@reduxjs/toolkit";
import { valDocs as initialDocs } from "../../data/validation";

const clone = (o) => JSON.parse(JSON.stringify(o));

const validationSlice = createSlice({
    name: "validation",
    initialState: {
        docs: clone(initialDocs),
        curDocIdx: 0,
        selectedDocViewerIdx: 0,
        zoom: 1,
        zoom2: 1,
    },
    reducers: {
        setValDocIdx: (state, a) => { state.curDocIdx = a.payload; state.zoom = 1; },
        setSelectedDocViewerIdx: (state, a) => { state.selectedDocViewerIdx = a.payload; state.zoom2 = 1; },
        approveField: (state, a) => { state.docs[state.curDocIdx].fields[a.payload].st = "approved"; },
        rejectField: (state, a) => { state.docs[state.curDocIdx].fields[a.payload].st = "rejected"; },
        approveAllFields: (state) => { state.docs[state.curDocIdx].fields.forEach((f) => (f.st = "approved")); },
        setZoom: (state, a) => { state.zoom = a.payload; },
        setZoom2: (state, a) => { state.zoom2 = a.payload; },
        resetDocs: (state) => { state.docs = clone(initialDocs); state.curDocIdx = 0; },
    },
});

export const {
    setValDocIdx,
    setSelectedDocViewerIdx,
    approveField,
    rejectField,
    approveAllFields,
    setZoom,
    setZoom2,
    resetDocs,
} = validationSlice.actions;

export default validationSlice.reducer;