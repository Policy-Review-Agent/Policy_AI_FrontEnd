import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    validatorlist: [],
    validatorcrate: [],
    validatorDocDetails: null, // ✅ null so loading=true until data arrives
    selectedPolicyId: null,
    documentTypes: [],
    policyExtractedFields: []
};

const validatorSetupSlice = createSlice({
    name: "validatorSetup",
    initialState: initialState,
    reducers: {
        setValidatorSetupList: (state, action) => {
            state.validatorlist = action.payload;
        },
        setValidatorCreate: (state, action) => {
            state.validatorcrate = action.payload;
        },
        setValidatorDocDetails: (state, action) => {
            state.validatorDocDetails = action.payload;
        },
        setSelectedPolicyId: (state, action) => {
            state.selectedPolicyId = action.payload;
        },
        setDocumentTypes: (state, action) => {
            state.documentTypes = action.payload;
        },
        setPolicyExtractedFields: (state, action) => {
            state.policyExtractedFields = action.payload;
        }
    }
});

export const { setValidatorSetupList, setValidatorCreate, setValidatorDocDetails, setSelectedPolicyId, setDocumentTypes, setPolicyExtractedFields } = validatorSetupSlice.actions;
export default validatorSetupSlice.reducer;