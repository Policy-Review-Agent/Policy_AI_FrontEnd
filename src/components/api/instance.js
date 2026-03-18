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