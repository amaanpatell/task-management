import { ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(400, "Project not found");
  }

  const notes = await ProjectNote.find({
    project: projectId,
  }).populate("createdBy", "username email fullname avatar");

  if (!notes) {
    throw new ApiError(400, "Notes not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes Fetched sucessfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await ProjectNote.findById(noteId).populate(
    "createdBy", "username email fullname avatar"
  );

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note Fetched sucessfully"));
});

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(400, "Project not found");
  }

  const note = await ProjectNote.create({
    project: projectId,
    createdBy: req.user._id,
    content,
  });

  if (!note) {
    throw new ApiError(400, "Failed to create a new note");
  }

  const populatedNote = await ProjectNote.findById(note._id).populate(
    "createdBy", "username email fullname avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, populatedNote, "Note created sucessfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;

  const existingNote = await ProjectNote.findById(noteId);

  if (!existingNote) {
    throw new ApiError(400, "Note not found");
  }

  const note = await ProjectNote.findByIdAndUpdate(
    noteId,
    { content },
    { new: true }
  ).populate("createdBy", "username email fullname avatar");

  if (!note) {
    throw new ApiError(400, "Failed to update note");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note Update sucessfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const existingNote = await ProjectNote.findById(noteId);

  if (!existingNote) {
    throw new ApiError(400, "Note not found");
  }

  const note = await ProjectNote.findByIdAndDelete(noteId);

  if (!note) {
    throw new ApiError(400, "Failed to delete note");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note delete sucessfully"));
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
