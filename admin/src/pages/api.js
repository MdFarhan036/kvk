import axios from "axios";

// ==========================================
// COMMON API CONFIGURATION
// ==========================================

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";

export const ASSET_BASE_URL =
  import.meta.env.VITE_ASSET_BASE_URL ||
  "http://localhost:8000";

// ==========================================
// AXIOS INSTANCE
// ==========================================

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;