import projectService from "@/api/projectService";
import { create } from "zustand";

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  projectMembers: [],
  isLoading: false,
  error: null,
  initialized: false, // Track if we've initialized the projects
  fetchedMemberProjects: {}, // Track which projects' members we've already fetched

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.getProjects();
      set({
        projects: response.data,
        initialized: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response.data?.message });
      throw error;
    }
  },
  // Get project by ID
  fetchProjectById: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.getProjectById(projectId);
      set({
        currentProject: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch project",
      });
      throw error;
    }
  },
}));

export default useProjectStore
