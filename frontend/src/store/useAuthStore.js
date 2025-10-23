import { create } from "zustand";
import { axiosInstance } from "../utils/axios";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigninUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,
  isResettingPassword: false,
  _sessionFlagKey: "tm_has_session",

  checkAuth: async () => {
    // Only attempt if we believe a prior session exists to avoid noisy 401s
    const hasSession = localStorage.getItem(useAuthStore.getState()._sessionFlagKey);
    if (!hasSession) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/current-user");
      console.log("✅ checkAuth raw response:", res.data);
      set({ authUser: res.data.data });
    } catch (error) {
      // Fail silently on startup to avoid console noise
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigninUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data.data });
    } catch (error) {
      console.log("❌ Error signing up:", error);
    } finally {
      set({ isSigninUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      // Mark that a session exists so future app loads can check auth
      localStorage.setItem(useAuthStore.getState()._sessionFlagKey, "1");
      set({ authUser: res.data.data });
    } catch (error) {
      console.log("❌ Error logging in:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      // Clear session flag
      localStorage.removeItem(useAuthStore.getState()._sessionFlagKey);
      set({ authUser: null });
    } catch (error) {
      console.log("❌ Error logging out:", error);
    }
  },

  verifyEmail: async (token) => {
    try {
      await axiosInstance.get(`/auth/verify-email/${token}`);
    } catch (error) {
      console.log("❌ Error verifying email:", error);
    }
  },

  forgotPassword: async (email) => {
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
    } catch (error) {
      console.log("❌ Error forgot password:", error);
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
    } catch (error) {
      console.log("❌ Error resetting password:", error);
    }
  },

  changeCurrentPassword: async (oldPassword, newPassword) => {
    try {
      await axiosInstance.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
    } catch (error) {
      console.log("❌ Error changing password:", error);
    }
  },

  resendVerificationEmail: async () => {
    try {
      await axiosInstance.post("/auth/resend-email-verification");
    } catch (error) {
      console.log("❌ Error resending verification email:", error);
    }
  },
}));
