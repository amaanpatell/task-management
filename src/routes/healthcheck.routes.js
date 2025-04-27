import { Router } from "express";
import healthcheck from "../controllers/healthcheck.controllers.js"

const healthRoutes = Router()

healthRoutes.get("/", healthcheck)