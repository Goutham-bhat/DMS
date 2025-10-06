// api.js
import axios from "axios";
import { store } from "./redux/store";
import { logout } from "./redux/authslice";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Attach token on every request
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response, // just return response if ok
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("[API] Token expired or invalid. Logging out...");
      store.dispatch(logout()); // clear auth state
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
