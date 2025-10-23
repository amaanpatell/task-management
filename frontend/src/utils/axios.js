import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1"
    : "/api/v1";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Separate client without interceptors to perform the refresh call safely
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Track an in-flight refresh request so concurrent 401s share it
let refreshRequest = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If unauthorized, attempt a single refresh and then retry original request
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshRequest) {
          refreshRequest = refreshClient.post("/auth/refresh-token");
        }
        await refreshRequest;
        refreshRequest = null;
        // Retry the original request after successful refresh
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Ensure future attempts can try refresh again
        refreshRequest = null;
        // Optional polish: redirect to login on refresh failure
        try {
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        } catch (_) {}
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
