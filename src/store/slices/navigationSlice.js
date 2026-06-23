import { createSlice } from "@reduxjs/toolkit";

const navigationSlice = createSlice({
  name: "navigation",
  initialState: {
    screen: sessionStorage.getItem("current_screen") || "dashboard",
    loginDetails: JSON.parse(sessionStorage.getItem("login_details") || "{}") // ✅ rehydrate on refresh
  },
  reducers: {
    navigate: (state, action) => {
      state.screen = action.payload;
      sessionStorage.setItem("current_screen", action.payload);
    },
    validatorNavigate: (state, action) => {
      state.screen = action.payload;
    },
    setLoginDetails: (state, action) => {
      state.loginDetails = action.payload;
      sessionStorage.setItem("login_details", JSON.stringify(action.payload)); // ✅ persist on set
    },
  },
});

export const { navigate, validatorNavigate, setLoginDetails } =
  navigationSlice.actions;
export default navigationSlice.reducer;