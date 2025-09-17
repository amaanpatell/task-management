import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";

const getProjects = asyncHandler(async (req, res) => {
  // get all projects
  const allProjects = await Project.find({ createdBy: req.user?._id });
  return res
    .status(200)
    .json(new ApiResponse(200, allProjects, "All projects"));
});

const getProjectById = asyncHandler(async (req, res) => {
  // get project by id
  const { id } = req.params;
  const project = await Project.findById(id);
  return res.status(200).json(new ApiResponse(200, project, "Project found"));
});

const createProject = asyncHandler(async (req, res) => {
  // create project
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "Name is not defined");
  }

  const user = req.user._id;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  // update project
  
  const { id } = req.params;
  const { name, description } = req.body;

  const project = await Project.findById(id);

  project.name = name;
  project.description = description;

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  // delete project
  const { id } = req.params;
  const project = await Project.findById(id);

  await project.deleteOne(project);

  return res.status(200).json(new ApiResponse(200, {}, "Delete sucessfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  // get project members
});

const addMemberToProject = asyncHandler(async (req, res) => {
  // add member to project
});

const deleteMember = asyncHandler(async (req, res) => {
  // delete member from project
});

const updateMemberRole = asyncHandler(async (req, res) => {
  // update member role
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
