import { StorageKeys } from "../utils/constants";
import axiosInstance from "./axios";

const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);

    if (response.data?.data?.accessToken) {
      localStorage.setItem(
        StorageKeys.ACCESS_TOKEN,
        response.data.data.accessToken
      );
    }

    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);

    // FIXED: Only store access token (refresh token is in httpOnly cookie)
    if (response.data?.data?.accessToken) {
      localStorage.setItem(
        StorageKeys.ACCESS_TOKEN,
        response.data.data.accessToken
      );
    }

    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      const response = await axiosInstance.post("/auth/logout");
      return response.data;
    } finally {
      // Always clear local storage, even if API fails
      localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
      // No need to remove refresh token - it's httpOnly cookie cleared by backend
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/current-user");
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await axiosInstance.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post(
      `/users/reset-password/${token}`,
      { newPassword }
    );
    return response.data;
  },

  // Change password (authenticated)
  changePassword: async (oldPassword, newPassword) => {
    const response = await axiosInstance.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Resend email verification
  resendEmailVerification: async () => {
    const response = await axiosInstance.post(
      "/users/resend-email-verification"
    );
    return response.data;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem(StorageKeys.ACCESS_TOKEN);
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem(StorageKeys.ACCESS_TOKEN);
  },
};

export default authService;
