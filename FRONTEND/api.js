// api.js
import axios from "axios";
import { store } from "./redux/store";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Add a request interceptor to attach the token automatically
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

export default api;
