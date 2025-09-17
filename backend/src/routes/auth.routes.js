import Router from "express";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegistrationValidator,
  userResetForgottenPasswordValidator,
} from "../validators/index.js";
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
} from "../controllers/auth.controllers.js";
import { checkAuth } from "../middlewares/auth.middlewares.js";

const authRoutes = Router();

authRoutes.post(
  "/register",
  userRegistrationValidator(),
  validate,
  registerUser
);

authRoutes.post("/login", userLoginValidator(), validate, loginUser);

authRoutes.post("/refresh-token", refreshAccessToken);

authRoutes.get("/verify-email/:verificationToken", verifyEmail);

authRoutes.post(
  "/forgot-password",
  userForgotPasswordValidator(),
  validate,
  forgotPasswordRequest
);

authRoutes.post(
  "/reset-password/:resetToken",
  userResetForgottenPasswordValidator(),
  validate,
  resetForgottenPassword
);

//secured route
authRoutes.get("/current-user", checkAuth, getCurrentUser);

authRoutes.post("/logout", checkAuth, logoutUser);

authRoutes.post(
  "/change-password",
  checkAuth,
  userChangeCurrentPasswordValidator(),
  validate,
  changeCurrentPassword
);

authRoutes.post(
  "/resend-email-verification",
  checkAuth,
  resendEmailVerification
);

export default authRoutes;
