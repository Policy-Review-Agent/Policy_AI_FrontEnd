import { configureStore } from "@reduxjs/toolkit";
import navigationReducer from "./slices/navigationSlice";
import batchReducer from "./slices/batchSlice";
import validationReducer from "./slices/validationSlice";
import toastReducer from "./slices/toastSlice";

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    batch:      batchReducer,
    validation: validationReducer,
    toast:      toastReducer,
  },
});