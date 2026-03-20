import { configureStore } from "@reduxjs/toolkit";
import navigationReducer from "./slices/navigationSlice";
import batchReducer from "./slices/batchSlice";
import validationReducer from "./slices/validationSlice";
import toastReducer from "./slices/toastSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    batch:      batchReducer,
    validation: validationReducer,
    toast:      toastReducer,
    auth:       authReducer,
  },
});