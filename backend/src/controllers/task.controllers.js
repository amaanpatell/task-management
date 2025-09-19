import { Project } from "../models/project.models.js";
import { SubTask } from "../models/subtask.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const task = await Task.find({
    project: projectId,
  }).populate("assignedTo", "avatar username fullName");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return (
    res.status(200),
    json(new ApiResponse(200, task, "Task fetched suceessfully "))
  );
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId).populate(
    "assignedTo, assignedBy username email fullname avatar"
  );

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }

  return (
    res.status(200),
    json(new ApiResponse(200, task, "Task fetched suceessfully "))
  );
});

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(400, "Project not found");
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo: assignedTo ? assignedTo : undefined,
    assignedBy: req.user._id,
    status,
    attachments,
  });

  if (!task) {
    throw new ApiError(400, "Failed to create a new Task");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, status, attachments } = req.body;

  const existingTask = await Task.findById(projectId);

  if (!existingTask) {
    throw new ApiError(400, "Task not found");
  }

  const task = await Task.findByIdAndUpdate(
    projectId,
    {
      title,
      description,
      assignedTo: assignedTo ? assignedTo : undefined,
      assignedBy: req.user._id,
      status,
      attachments,
    },
    { new: true }
  ).populate("assignedTo, assignedBy username email fullname avatar");

  if (!task) {
    throw new ApiError(400, "Failed to update Task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const existingTask = await Task.findById(taskId);

  if (!existingTask) {
    throw new ApiError(400, "Task not found");
  }

  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    throw new ApiError(400, "Failed to delete Task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task deleted sucessfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, isCompleted } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(400, "Task not found");
  }

  const subtask = await SubTask.create({
    title,
    isCompleted,
    createdBy: req.user._id,
  });

  if (!subtask) {
    throw new ApiError(400, "Failed to create subtask");
  }

  const populatedSubtask = await SubTask.findById(subtask._id).populate(
    "createdBy username email fullname avatar"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedSubtask, "Subtask created successfully")
    );
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const { title, isCompleted } = req.body;

  const existingSubTask = await SubTask.findById(subTaskId);

  if (!existingSubTask) {
    throw new ApiError(400, "Sub Task not found");
  }

  const subtask = await SubTask.findByIdAndUpdate(
    subTaskId,
    {
      title,
      isCompleted,
    },
    { new: true }
  ).populate("createdBy, username email fullname avatar");

  if (!subtask) {
    throw new ApiError(400, "Failed to update Sub Task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Sub task Updated sucessfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  const existingSubTask = await SubTask.findById(subTaskId);

  if (!existingSubTask) {
    throw new ApiError(400, "Sub Task not found");
  }

  const task = await SubTask.findByIdAndDelete(subTaskId);

  if (!task) {
    throw new ApiError(400, "Failed to delete Sub Task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Sub task deleted sucessfully"));
});

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
