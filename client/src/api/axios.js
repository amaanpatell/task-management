import { toast } from "sonner";
import axios from "axios";
import { StorageKeys } from "../utils/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRITICAL: Allows cookies to be sent
  timeout: 10000,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedRequestsQueue = [];

// Process all queued requests after token refresh
const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// REQUEST INTERCEPTOR - Adds access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(StorageKeys.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR - Handles token refresh automatically
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // FIXED: No refresh token in body - it's in httpOnly cookie!
        // Backend reads it from cookies automatically
        const response = await axiosInstance.post('/auth/refresh-token');

        if (response.data?.data?.accessToken) {
          const newAccessToken = response.data.data.accessToken;
          
          // Store new access token
          localStorage.setItem(StorageKeys.ACCESS_TOKEN, newAccessToken);
          
          // Update headers
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect
        processQueue(refreshError, null);
        localStorage.removeItem(StorageKeys.ACCESS_TOKEN);

        toast.error("Session expired. Please log in again.");

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle Network Errors
    if (error.message === "Network Error") {
      console.error(
        "Network Error: This might be a CORS issue. Check that the backend server is running and CORS is properly configured."
      );
      toast.error("Unable to connect to server. Please check your connection.");
    }
    // Handle other errors (but not 401 that was already handled)
    else if (error.response && error.response.status !== 401) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      toast.error(errorMessage);
    }
    // Handle timeout errors
    else if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;