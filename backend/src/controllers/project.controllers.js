import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";
import { User } from "../models/user.models.js";

const getProjects = asyncHandler(async (req, res) => {
  // get all projects
  const projects = await Project.find({ createdBy: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects found successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  // get project by id
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
  // create project
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "Name is not defined");
  }

  const projectExists = await Project.findOne({ name });
  if (projectExists) {
    throw new ApiError(400, "Project already exists");
  }

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
  });

  await ProjectMember.create({
    user: req.user._id,
    project: project._id,
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  // update project

  const { projectId } = req.params;
  const { name, description } = req.body;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true }
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  // delete project
  const { projectId } = req.params;
  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project deleted successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  // get project members
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectMembers = await ProjectMember.find({
    project: project._id,
  });

  if (!projectMembers) {
    throw new ApiError(404, "Project members not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, projectMembers, "Project members found successfully")
    );
});

const addMemberToProject = asyncHandler(async (req, res) => {
  // add member to project
  const { email, role } = req.body;
  const { projectId } = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const existingMember = await ProjectMember.findOne({
    user: user._id,
    project: projectId,
  });

  if (existingMember) {
    // Update existing member's role
    existingMember.role = role;
    await existingMember.save();
  } else {
    // Create new member
    await ProjectMember.create({
      user: user._id,
      project: projectId,
      role: role,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member added to project successfully"));
});

const deleteMember = asyncHandler(async (req, res) => {
  // delete member from project
  const { projectId, userId } = req.params;

  if (!projectId && !userId) {
    throw new ApiError(400, "Project Id and User Id are required");
  }

  let projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, projectMember, "Project member deleted successfully")
    );
});

const updateMemberRole = asyncHandler(async (req, res) => {
  // update member role
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRoles.includes(newRole)) {
    throw new ApiError(400, "Invalid Role");
  }

  let projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      role: newRole,
    },
    { new: true }
  );

  if (!projectMember) {
    throw new ApiError(400, "Project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member role updated successfully"
      )
    );
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
