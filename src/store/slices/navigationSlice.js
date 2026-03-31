import { createSlice } from "@reduxjs/toolkit";

const navigationSlice = createSlice({
  name: "navigation",
  initialState: { screen: "dashboard" },
  reducers: {
    navigate: (state, action) => {
      state.screen = action.payload;
    },
    validatorNavigate: (state, action) => {
      state.screen = action.payload;
    },
  }
});

export const { navigate,validatorNavigate } = navigationSlice.actions;
export default navigationSlice.reducer;