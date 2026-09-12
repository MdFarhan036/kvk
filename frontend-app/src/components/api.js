import axios from "axios";

// ============================================
// API BASE URL
// ============================================
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api";

// ============================================
// ASSET BASE URL
// Used for product images, category images,
// brand images, blog images, etc.
// ============================================
export const ASSET_BASE_URL =
  import.meta.env.VITE_ASSET_BASE_URL ||
  "http://localhost:8000";

// ============================================
// WARN IF API URL IS MISSING
// ============================================
if (!import.meta.env.VITE_API_URL) {
  console.warn(
    "⚠️ VITE_API_URL is missing in .env file. Using localhost fallback."
  );
}

// ============================================
// COMMON AXIOS INSTANCE
// ============================================
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// ============================================
// GLOBAL RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loop if already on login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;