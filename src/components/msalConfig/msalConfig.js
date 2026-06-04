import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY_URL,
    redirectUri: window.location.origin + "/redirect",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
export const msalInitPromise = msalInstance.initialize(); // ✅ init once, export the promise

export const loginRequest = {
  scopes: [import.meta.env.VITE_LOGIN_SCOPE],
  prompt: "login",
};