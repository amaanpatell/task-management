// boilderplate code

import mongoose from "mongoose";
import { ProjectNote } from "../models/note.models";
import { Project } from "../models/project.models";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";

const getNotes = async (req, res) => {
  // get all notes
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(400, "Project not found");
  }

  const notes = await ProjectNote.find({
    project: projectId,
  }).populate("createdBy, username email fullname avatar");

  if (!notes) {
    throw new ApiError(400, "Notes not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes Fetched sucessfully"));
};

const getNoteById = async (req, res) => {
  // get note by id
  const { noteId } = req.params;

  const note = await ProjectNote.findById(noteId).populate(
    "createdBy, username email fullname avatar"
  );

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note Fetched sucessfully"));
};

const createNote = async (req, res) => {
  // create note
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
    "createdBy, username email fullname avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, populatedNote, "Note created sucessfully"));
};

const updateNote = async (req, res) => {
  // update note
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
  ).populate("createdBy, username email fullname avatar");

  if (!note) {
    throw new ApiError(400, "Failed to update note");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note Update sucessfully"));
};

const deleteNote = async (req, res) => {
  // delete note
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
};

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
