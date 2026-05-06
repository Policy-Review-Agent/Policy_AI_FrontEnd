// import axios from "axios";

// export const baseInstance = axios.create({
//   baseURL: import.meta.env.VITE_BASEURL,
//   headers: {
//     "x-api-key": import.meta.env.VITE_X_API_KEY,

//   },
// });

import axios from "axios";

export const baseInstance = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
});

baseInstance.interceptors.request.use((config) => {
  config.headers["X-Frontend-Token"] = import.meta.env.VITE_X_API_KEY;
  return config;
});

baseInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

baseInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const serverError =
      error?.response?.data?.error || error?.response?.data?.detail || "";

    if (status === 403 && serverError.includes("USER_NOT_APPROVED")) {
      sessionStorage.clear(); // remove saved data for non-approved users
      toast.error("User Not Approved, Please Contact Your Admin For Access", {
        id: "user-not-approved",
        className: "my-toast",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else if (status === 401 || status === 403) {
      sessionStorage.clear(); // remove all saved data
      window.location.href = "/"; // redirect to login page
    }
    return Promise.reject(error);
  },
);
