import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    validatorlist: [],
    validatorcrate: [],
    validatorDocDetails: [],
    selectedPolicyId: null, // New state to store selected policy ID
    documentTypes: [], // New state to store document type options
    policyExtractedFields: [] // New state to store extracted fields for the selected policy
};

const validatorSetupSlice = createSlice({
    name: "validatorSetup",
    initialState: initialState,
    reducers: {
        setValidatorSetupList: (state, action) => {
            state.validatorlist = action.payload
        },
        setValidatorCreate: (state, action) => {
            state.validatorcrate = action.payload
        },
        setValidatorDocDetails: (state, action) => {
            state.validatorDocDetails = action.payload
        },
        setSelectedPolicyId: (state, action) => {
            state.selectedPolicyId = action.payload
        },
        setDocumentTypes: (state, action) => {
            state.documentTypes = action.payload
        },
        setPolicyExtractedFields: (state, action) => {
            state.policyExtractedFields = action.payload
        }
    }
});

export const { setValidatorSetupList, setValidatorCreate, setValidatorDocDetails, setSelectedPolicyId, setDocumentTypes, setPolicyExtractedFields } = validatorSetupSlice.actions;
export default validatorSetupSlice.reducer;