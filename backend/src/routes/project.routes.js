import { Router } from "express";
import { createProject, deleteProject, getProjectById, getProjectMembers, getProjects, updateProject } from "../controllers/project.controllers.js";
import { checkAuth } from "../middlewares/auth.middlewares.js";

const projectRoutes = Router()

projectRoutes.get("/", checkAuth, getProjects)

projectRoutes.get("/:id", checkAuth, getProjectById)

projectRoutes.post("/create-project", checkAuth, createProject)

projectRoutes.delete("/delete-project/:id", checkAuth, deleteProject)

projectRoutes.put("/update-project/:id", checkAuth, updateProject)

projectRoutes.get("/members/:id", checkAuth, getProjectMembers)


export default projectRoutes