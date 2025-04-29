import Router from "express";
import { validate } from "../middlewares/validator.middlewares.js";
import { userRegistrationValidator } from "../validators/index.js";

const authRoutes = Router();

authRoutes.post("/register", userRegistrationValidator(), validate, );

export default authRoutes;
