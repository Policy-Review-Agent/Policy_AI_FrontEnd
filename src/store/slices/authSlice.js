import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  error: null,
};

// Hardcoded credentials as requested by the user
const VALID_CREDENTIALS = {
  "prathap.r@paccore.com":"Paccore@01",
  "sarah.r@paccore.com":"Paccore@01",
  "shushrita.m@infoswift.com":"Paccore@01",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, password } = action.payload;
      
      if (VALID_CREDENTIALS[email] && VALID_CREDENTIALS[email] === password) {
        state.isAuthenticated = true;
        state.user = { 
          email: email, 
          // Extract a display name from the email (e.g. karthik.d -> Karthik D)
          name: email.split("@")[0].split(".").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
        };
        state.error = null;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.error = "Invalid email or password";
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { login, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
