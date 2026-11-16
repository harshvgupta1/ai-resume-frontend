import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (e.g. for injecting Auth Bearer token in the future)
api.interceptors.request.use(
  (config) => {
    // If you store an auth token in localStorage/cookies, attach it here
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error handling and 24-hour session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem("token"));
      if (hadToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("login_time");

        // Dispatch custom event for reactive UI update across components
        window.dispatchEvent(new CustomEvent("session-expired"));

        const currentPath = window.location.pathname;
        if (!currentPath.includes("/login") && !currentPath.includes("/signup")) {
          window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    const message = error.response?.data?.message || error.response?.data?.error || error.message || "An unexpected error occurred";
    console.error("[API Error]:", message);
    return Promise.reject(error);
  }
);
