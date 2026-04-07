import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    validatorlist: [],
};

const validatorSetupSlice = createSlice({
    name: "validatorSetup",
    initialState: initialState,
    reducers: {
        setValidatorSetupList: (state, action) => {
            state.validatorlist = action.payload
        }
    }
});

export const { setValidatorSetupList } = validatorSetupSlice.actions;
export default validatorSetupSlice.reducer;