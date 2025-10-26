import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EmptyState, ErrorAlert } from "../components/common";
import { useAuthStore, useProjectStore } from "../store";
import { canManageMembers } from "../utils/permissions";
import ProjectFormModal from "../components/modals/ProjectFormModal";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import ProjectTable from "../components/projects/ProjectTable";
import { Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    error,
    clearError,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  const { user } = useAuthStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects().catch(console.error);
  }, [fetchProjects]);

  const getProjectData = (item) => {
    if (item && item.project) {
      return { project: item.project, role: item.role };
    }
    return { project: item, role: item.role };
  };

  const handleCreateProject = async (values) => {
    try {
      await createProject(values);
      await fetchProjects();
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const openEditModal = (item) => {
    setSelectedProject(item);
    setEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedProject(item);
    setConfirmDeleteOpen(true);
  };

  const handleEditProject = async (values) => {
    if (!selectedProject) return;

    try {
      const { project } = getProjectData(selectedProject);
      await updateProject(project._id, values);
      await fetchProjects();
      setEditModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      const { project } = getProjectData(selectedProject);
      await deleteProject(project._id);
      setConfirmDeleteOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const canCreateProject = !!user;

  const canManageProject = (item) => {
    if (!user || !item) return false;
    const { role } = getProjectData(item);

    if (!role) {
      const { project } = getProjectData(item);
      if (project && project.createdBy === user._id) {
        return true;
      }
      console.warn("Project role is undefined:", item);
      return false;
    }

    const projectMembers = [
      {
        user: { _id: user._id },
        role: role,
      },
    ];

    return canManageMembers(user, projectMembers);
  };

  const showLoadingOverlay =
    isLoading && !createModalOpen && !editModalOpen && !confirmDeleteOpen;

  return (
    <div className="w-full h-full flex flex-col items-center py-6">
      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          {canCreateProject && (
            <Button onClick={() => setCreateModalOpen(true)}>
              Create New Project
            </Button>
          )}
        </div>

        {error && (
          <ErrorAlert title="Error" message={error} onClose={clearError} />
        )}

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started"
            buttonText={canCreateProject ? "Create Your First Project" : ""}
            onButtonClick={
              canCreateProject ? () => setCreateModalOpen(true) : undefined
            }
          />
        ) : (
          <ProjectTable
            projects={projects}
            canManageProject={canManageProject}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        )}
      </div>

      {/* Create Project Modal */}
      <ProjectFormModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        onSubmit={handleCreateProject}
        initialValues={{
          name: "",
          description: "",
        }}
      />

      {/* Edit Project Modal */}
      {selectedProject &&
        (() => {
          const { project } = getProjectData(selectedProject);
          return (
            <ProjectFormModal
              opened={editModalOpen}
              onClose={() => {
                setEditModalOpen(false);
                setSelectedProject(null);
              }}
              title="Edit Project"
              onSubmit={handleEditProject}
              initialValues={{
                name: project.name,
                description: project.description || "",
              }}
            />
          );
        })()}

      {/* Confirm Delete Modal */}
      {selectedProject &&
        (() => {
          const { project } = getProjectData(selectedProject);
          return (
            <ConfirmDeleteModal
              opened={confirmDeleteOpen}
              onClose={() => {
                setConfirmDeleteOpen(false);
                setSelectedProject(null);
              }}
              title="Delete Project"
              message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
              onConfirm={handleDeleteProject}
            />
          );
        })()}
    </div>
  );
}
