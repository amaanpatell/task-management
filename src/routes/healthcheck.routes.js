import { Router } from "express";
import {healthCheck} from "../controllers/healthcheck.controllers.js"

const healthRoutes = Router()

healthRoutes.get("/", healthCheck)

export default healthRoutes