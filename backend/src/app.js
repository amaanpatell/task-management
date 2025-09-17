import express from "express";
//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

app.use("/api/v1/healthcheck", healthCheckRouter)

app.use(errorHandler);


export default app;
