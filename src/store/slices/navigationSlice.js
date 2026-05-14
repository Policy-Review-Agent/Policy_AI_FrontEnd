import { createSlice } from "@reduxjs/toolkit";

const navigationSlice = createSlice({
  name: "navigation",
  initialState: { screen: "dashboard", loginDetails: {} },
  reducers: {
    navigate: (state, action) => {
      state.screen = action.payload;
    },
    validatorNavigate: (state, action) => {
      state.screen = action.payload;
    },
    setLoginDetails: (state, action) => {
      state.loginDetails = action.payload;
    },
  },
});

export const { navigate, validatorNavigate, setLoginDetails } =
  navigationSlice.actions;
export default navigationSlice.reducer;
