import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/projects", projectRoutes)


app.use(errorHandler);


export default app;
