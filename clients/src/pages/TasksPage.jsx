import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorAlert, NoProjectAlert } from "../components/common";
import { TaskFormModal } from "../components/modals";
import { KanbanBoard, TaskDetail, TaskTable } from "../components/tasks";
import { useProjectStore, useTaskStore } from "../store";
import { TaskStatusEnum } from "../utils/constants";

export default function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("kanban");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);

  const {
    createTask,
    isLoading: tasksLoading,
    error,
    clearError,
    fetchTasks,
    tasks,
    changeTaskStatus,
  } = useTaskStore();

  const {
    currentProject,
    projectMembers,
    fetchProjectWithMembers,
    projects,
    isLoading: projectsLoading,
  } = useProjectStore();

  // Effect to handle project and tasks loading
  useEffect(() => {
    // Only fetch if we have a valid projectId
    if (projectId) {
      // These functions already have built-in caching to prevent redundant calls
      fetchProjectWithMembers(projectId);
      fetchTasks(projectId);
    }
    // Handle navigation when no project ID is in URL
    else if (projects.length > 0) {
      const firstProjectId = projects[0].project?._id;
      if (firstProjectId) {
        navigate(`/projects/${firstProjectId}/tasks`);
      }
    }
    // If no projects exist, redirect to projects page
    else if (!projectsLoading) {
      navigate("/projects");
    }
  }, [
    projectId,
    projects,
    navigate,
    projectsLoading,
    fetchProjectWithMembers,
    fetchTasks,
  ]);

  const handleCreateTask = async (values, files) => {
    if (!projectId) {
      console.error("No valid project selected");
      return;
    }

    try {
      // Pass both values and files to createTask
      await createTask(projectId, values, files || []);
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleOpenTaskDetail = (taskId) => {
    setSelectedTaskId(taskId);
    setTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setTaskDetailModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area or in the same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Extract the task ID from the draggableId (format: "task-{taskId}")
    const taskId = draggableId.replace("task-", "");

    // The destination droppableId is the new status
    const newStatus = destination.droppableId;

    try {
      if (!projectId) {
        console.error("No valid project selected");
        return;
      }

      // Update the task status
      await changeTaskStatus(projectId, taskId, newStatus);

      // Refresh tasks to ensure UI is in sync with backend
      await fetchTasks(projectId);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const isLoading = tasksLoading || projectsLoading;

  // If no project is available, show a message
  if (!projectId) {
    return (
      <div className="container max-w-6xl py-8">
        {!isLoading && (
          <NoProjectAlert
            title="No Project Selected"
            message="Please select a project from the header dropdown or create a new project."
            buttonText="Go to Projects"
            onButtonClick={() => navigate("/projects")}
          />
        )}
      </div>
    );
  }

  const projectName =
    currentProject?.project?.name || currentProject?.name || "Project";

  // Determine if task details should be shown
  const shouldShowTaskDetails = selectedTaskId && taskDetailModalOpen;

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{projectName} Tasks</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setCreateModalOpen(true)}>Add New Task</Button>
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Error" message={error} onClose={clearError} />
      )}

      <div className={shouldShowTaskDetails ? "mb-4" : ""}>
        {viewMode === "kanban" ? (
          <KanbanBoard
            tasks={tasks}
            onTaskClick={handleOpenTaskDetail}
            onDragEnd={handleDragEnd}
          />
        ) : (
          <TaskTable tasks={tasks} onTaskClick={handleOpenTaskDetail} />
        )}
      </div>

      {/* Task Detail Section */}
      <TaskDetail
        taskId={selectedTaskId}
        projectId={projectId}
        onClose={handleCloseTaskDetail}
        opened={shouldShowTaskDetails}
      />

      {/* Create Task Modal */}
      <TaskFormModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Task"
        projectId={projectId}
        members={projectMembers}
        onSubmit={handleCreateTask}
        initialValues={{
          title: "",
          description: "",
          assignedTo: "",
          status: TaskStatusEnum.TODO,
        }}
      />
    </div>
  );
}
