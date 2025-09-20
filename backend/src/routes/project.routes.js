import { Router } from "express";
import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers.js";
import {
  checkAuth,
  validateProjectPermission,
} from "../middlewares/auth.middlewares.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const projectRoutes = Router();

projectRoutes.get("/", checkAuth, getProjects);

projectRoutes.post("/", checkAuth, createProject);

projectRoutes.get(
  "/:projectId",
  checkAuth,
  validateProjectPermission(AvailableUserRoles),
  getProjectById
);

projectRoutes.put(
  "/:projectId",
  checkAuth,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  updateProject
);

projectRoutes.delete(
  "/:projectId",
  checkAuth,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  deleteProject
);

// Members
projectRoutes.get("/:projectId/members", checkAuth, getProjectMembers);

projectRoutes.post(
  "/:projectId/members",
  checkAuth,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  addMemberToProject
);

projectRoutes.put(
  "/:projectId/members/:userId",
  checkAuth,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  updateMemberRole
);

projectRoutes.delete(
  "/:projectId/members/:userId",
  checkAuth,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  deleteMember
);

export default projectRoutes;