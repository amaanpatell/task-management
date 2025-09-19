import { Router } from "express";
import {
  checkAuth,
  validateProjectPermission,
} from "../middlewares/auth.middlewares.js";
import {
  createNote,
  deleteNote,
  getNoteById,
  updateNote,
} from "../controllers/note.controllers.js";
import { AvailableUserRoles } from "../utils/constants.js";

const noteRoutes = Router();

noteRoutes.get("/:projectId", checkAuth, getNotes);

noteRoutes.post("/:projectId", checkAuth, createNote);

noteRoutes.get(
  "/:projectId/n/noteId",
  checkAuth,
  validateProjectPermission(AvailableUserRoles),
  getNoteById
);

noteRoutes.put(
  "/:projectId/n/noteId",
  checkAuth,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  updateNote
);

noteRoutes.delete(
  "/:projectId/n/noteId",
  checkAuth,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  deleteNote
);

export default noteRoutes;
