import axios from "axios";

// Base URL targeting Express backend running on port 28794
const API = axios.create({
  baseURL: "http://localhost:28794/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject JWT token into all outgoing requests
API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to catch 401/403 auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Token is expired or invalid -> clear local storage and redirect to login
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userRole");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;