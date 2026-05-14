import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: { visible: false, title: "", msg: "", ok: true },
  reducers: {
    showToast: (state, action) => ({
      ...state,
      ...action.payload,
      visible: true,
    }),
    hideToast: (state) => {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;