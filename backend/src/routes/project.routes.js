import { Router } from "express";
import { addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controllers.js";
import { checkAuth } from "../middlewares/auth.middlewares.js";

const projectRoutes = Router()

projectRoutes.get("/", checkAuth, getProjects)

projectRoutes.post("/", checkAuth, createProject)

projectRoutes.get("/:projectId", checkAuth, getProjectById)

projectRoutes.put("/:projectId", checkAuth, updateProject)

projectRoutes.delete(":projectId", checkAuth, deleteProject)

// Members
projectRoutes.get("/:projectId/members", checkAuth, getProjectMembers)

projectRoutes.post("/:projectId/members", checkAuth, addMemberToProject)

projectRoutes.put("/:projectId/members/:userId", updateMemberRole)

projectRoutes.delete("/:projectId/members/:userId", deleteMember)


export default projectRoutes