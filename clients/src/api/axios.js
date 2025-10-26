import axios from "axios";
import { toast } from "sonner";
import { StorageKeys } from "../utils/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  timeout: 10000,
});

// Request interceptor for adding auth token
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

// Helper function to show error notifications
const showErrorNotification = (error) => {
  // Extract error message from the response
  const errorMessage =
    error.response?.data?.message ||
    error.message ||
    "An unexpected error occurred";

  // Show toast notification
  toast.error("Error", {
    description: errorMessage,
    duration: 5000,
  });
};

// Response interceptor for handling token refresh and errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem(StorageKeys.REFRESH_TOKEN);

        if (!refreshToken) {
          // If no refresh token, clear auth and redirect to login
          localStorage.removeItem(StorageKeys.ACCESS_TOKEN);

          // Show toast for auth error
          toast.error("Authentication Error", {
            description: "Your session has expired. Please log in again.",
            duration: 5000,
          });

          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken },
          {
            withCredentials: true,
          }
        );

        if (response.data?.data?.accessToken) {
          localStorage.setItem(
            StorageKeys.ACCESS_TOKEN,
            response.data.data.accessToken
          );

          // Update refresh token if provided
          if (response.data?.data?.refreshToken) {
            localStorage.setItem(
              StorageKeys.REFRESH_TOKEN,
              response.data.data.refreshToken
            );
          }

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
        localStorage.removeItem(StorageKeys.REFRESH_TOKEN);

        // Show toast for refresh error
        toast.error("Authentication Error", {
          description: "Your session has expired. Please log in again.",
          duration: 5000,
        });

        // Only redirect to login if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle CORS errors more gracefully
    if (error.message === "Network Error") {
      console.error(
        "Network Error: This might be a CORS issue. Check that the backend server is running and CORS is properly configured."
      );

      toast.error("Connection Error", {
        description:
          "Unable to connect to the server. Please check your internet connection.",
        duration: 5000,
      });
    }
    // Handle other API errors
    else if (error.response) {
      // Don't show notification for 401 errors that are handled by token refresh
      if (error.response.status !== 401 || originalRequest?._retry) {
        showErrorNotification(error);
      }
    }
    // Handle request errors (like timeout)
    else if (error.request) {
      toast.error("Request Error", {
        description:
          "The request was made but no response was received. Please try again later.",
        duration: 5000,
      });
    }
    // Handle other errors
    else {
      showErrorNotification(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
