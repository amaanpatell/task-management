import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckSquare,
  Calendar,
  FileText,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { EmptyState, ErrorAlert, PageHeader } from "../components/common";
import {
  AddMemberModal,
  ConfirmDeleteModal,
  MemberRoleModal,
  NoteFormModal,
  TaskFormModal,
} from "../components/modals";
import { ProjectMembersTable } from "../components/projects";
import { KanbanBoard, TaskDetail, TaskTable } from "../components/tasks";
import {
  useAuthStore,
  useNoteStore,
  useProjectStore,
  useTaskStore,
} from "../store";
import { TaskStatusEnum } from "../utils/constants";
import { formatDate } from "../utils/dateUtils";
import {
  canCreateNote,
  canCreateTask,
  canDeleteNote,
  canEditNote,
  canManageMembers,
  canRemoveMember,
} from "../utils/permissions";
import { Toaster } from "@/components/ui/sonner";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = Toaster();

  const {
    currentProject,
    projectMembers,
    isLoading: projectLoading,
    error: projectError,
    clearError: clearProjectError,
    fetchProjectById,
    fetchProjectMembers,
    addProjectMember,
    removeProjectMember,
    updateMemberRole,
    projects,
  } = useProjectStore();

  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    clearError: clearTasksError,
    fetchTasks,
    createTask,
    changeTaskStatus,
  } = useTaskStore();

  const {
    notes,
    isLoading: notesLoading,
    error: notesError,
    clearError: clearNotesError,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNoteStore();

  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState("kanban");
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const [editNoteModalOpen, setEditNoteModalOpen] = useState(false);
  const [deleteNoteModalOpen, setDeleteNoteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteMemberModalOpen, setDeleteMemberModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Form states
  const [roleForm, setRoleForm] = useState({ role: "" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: TaskStatusEnum.TODO,
  });
  const [noteForm, setNoteForm] = useState({ content: "" });

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId).catch(console.error);
      fetchProjectMembers(projectId).catch(console.error);
    } else {
      navigate("/projects");
    }
  }, [projectId, fetchProjectById, fetchProjectMembers, navigate]);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId).catch(console.error);
      fetchNotes(projectId).catch(console.error);
    }
  }, [projectId, fetchTasks, fetchNotes]);

  useEffect(() => {
    if (activeTab !== "kanban" && activeTab !== "list") {
      setSelectedTaskId(null);
      setTaskDetailModalOpen(false);
    }
  }, [activeTab]);

  const handleAddMembers = async (values) => {
    try {
      await addProjectMember(projectId, values);
      await fetchProjectMembers(projectId);
      setAddMemberModalOpen(false);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleOpenDeleteMemberModal = (member) => {
    const { allowed, message } = canRemoveMember(
      user,
      member.user,
      projectMembers
    );
    if (!allowed) {
      toast({
        title: "Cannot Remove Member",
        description: message,
        variant: "destructive",
      });
      return;
    }
    setMemberToDelete(member);
    setDeleteMemberModalOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;

    try {
      await removeProjectMember(projectId, memberToDelete.user._id);
      await fetchProjectMembers(projectId);
      setDeleteMemberModalOpen(false);
      setMemberToDelete(null);
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditRoleModal = (member) => {
    setSelectedMember(member);
    setRoleForm({ role: member.role });
    setEditRoleModalOpen(true);
  };

  const handleUpdateRole = async (values) => {
    if (!selectedMember) return;

    try {
      await updateMemberRole(projectId, selectedMember.user._id, values.role);
      await fetchProjectMembers(projectId);
      setEditRoleModalOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleCreateTask = async (values) => {
    try {
      await createTask(projectId, values);
      setCreateTaskModalOpen(false);
      setTaskForm({
        title: "",
        description: "",
        assignedTo: "",
        status: TaskStatusEnum.TODO,
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleCreateNote = async (values) => {
    try {
      await createNote(projectId, values);
      setCreateNoteModalOpen(false);
      setNoteForm({ content: "" });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    } catch (error) {
      console.error("Failed to create note:", error);
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = async (values) => {
    if (!selectedNote) return;

    try {
      if (!canEditNote(user, projectMembers)) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to edit this note.",
          variant: "destructive",
        });
        return;
      }

      await updateNote(projectId, selectedNote._id, values);
      setEditNoteModalOpen(false);
      setSelectedNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      fetchNotes(projectId).catch(console.error);
    } catch (error) {
      console.error("Failed to update note:", error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    try {
      if (!canDeleteNote(user, projectMembers)) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to delete this note.",
          variant: "destructive",
        });
        return;
      }

      await deleteNote(projectId, selectedNote._id);
      setDeleteNoteModalOpen(false);
      setSelectedNote(null);
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      fetchNotes(projectId).catch(console.error);
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenTaskDetail = (taskId) => {
    setSelectedTaskId(taskId);
    setTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setTaskDetailModalOpen(false);
    setSelectedTaskId(null);
    fetchTasks(projectId).catch(console.error);
  };

  const handleOpenEditNoteModal = (note) => {
    if (!canEditNote(user, projectMembers)) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this note.",
        variant: "destructive",
      });
      return;
    }
    setSelectedNote(note);
    setEditNoteModalOpen(true);
  };

  const handleOpenDeleteNoteModal = (note) => {
    if (!canDeleteNote(user, projectMembers)) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete this note.",
        variant: "destructive",
      });
      return;
    }
    setSelectedNote(note);
    setDeleteNoteModalOpen(true);
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const taskId = draggableId.split("-")[1];

    changeTaskStatus(projectId, taskId, destination.droppableId)
      .then(() => {
        toast({
          title: "Task Updated",
          description: "Task status changed successfully",
        });
      })
      .catch((error) => {
        console.error("Failed to change task status:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            "Failed to update task status. Please try again.",
          variant: "destructive",
        });
        fetchTasks(projectId).catch(console.error);
      });
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAdjacentProjects = () => {
    if (!projects || projects.length <= 1) return { next: null, prev: null };

    const projectsList = projects.map((p) => p.project);
    const currentIndex = projectsList.findIndex((p) => p._id === projectId);

    if (currentIndex === -1) return { next: null, prev: null };

    const nextIndex = (currentIndex + 1) % projectsList.length;
    const prevIndex =
      (currentIndex - 1 + projectsList.length) % projectsList.length;

    return {
      next: projectsList[nextIndex] || null,
      prev: projectsList[prevIndex] || null,
    };
  };

  const { next, prev } = getAdjacentProjects();

  if (!currentProject && !projectLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <ErrorAlert
          title="Error"
          message="Project not found or you don't have access to it."
          onClose={() => navigate("/projects")}
        />
      </div>
    );
  }

  const isLoading = projectLoading || tasksLoading || notesLoading;
  const error = projectError || tasksError || notesError;
  const clearError = () => {
    clearProjectError();
    clearTasksError();
    clearNotesError();
  };

  const shouldShowTaskDetails =
    (activeTab === "kanban" || activeTab === "list") &&
    selectedTaskId &&
    taskDetailModalOpen;

  const userCanCreateNotes = canCreateNote(user, projectMembers);

  return (
    <div className="container max-w-5xl py-8">
      {error && (
        <ErrorAlert title="Error" message={error} onClose={clearError} />
      )}

      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/projects">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {currentProject?.name || "Project Details"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={currentProject?.name || "Project"}
        description={currentProject?.description}
        actions={
          <div className="flex items-center gap-2">
            {prev && (
              <Button
                variant="ghost"
                onClick={() => navigate(`/projects/${prev._id}`)}
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {prev.name}
              </Button>
            )}
            <Button variant="outline" onClick={() => setMembersModalOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Members ({projectMembers?.length || 0})
            </Button>
            {next && (
              <Button
                variant="ghost"
                onClick={() => navigate(`/projects/${next._id}`)}
                size="sm"
              >
                {next.name}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        }
      />

      <div className="h-4" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="kanban">
            <CheckSquare className="h-4 w-4 mr-2" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="list">
            <CheckSquare className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
        </TabsList>

        {(activeTab === "kanban" ||
          activeTab === "list" ||
          activeTab === "notes") && (
          <div className="flex items-center justify-between mt-6 mb-4">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {(activeTab === "kanban" || activeTab === "list") &&
            canCreateTask(user, projectMembers) ? (
              <Button onClick={() => setCreateTaskModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            ) : activeTab === "notes" && userCanCreateNotes ? (
              <Button onClick={() => setCreateNoteModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            ) : activeTab === "notes" && !userCanCreateNotes ? (
              <Badge variant="secondary" className="text-base px-4 py-1">
                View Only
              </Badge>
            ) : null}
          </div>
        )}

        <TabsContent value="kanban" className="mt-0">
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={handleOpenTaskDetail}
            onDragEnd={handleDragEnd}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <TaskTable tasks={filteredTasks} onTaskClick={handleOpenTaskDetail} />
        </TabsContent>

        <TabsContent value="members" className="mt-0">
          <div className="space-y-4">
            {canManageMembers(user, projectMembers) && (
              <div className="flex justify-end">
                <Button onClick={() => setAddMemberModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Members
                </Button>
              </div>
            )}

            {!projectMembers || projectMembers.length === 0 ? (
              <EmptyState
                title="No members yet"
                description="Add members to collaborate on this project"
                buttonText={
                  canManageMembers(user, projectMembers)
                    ? "Add Your First Member"
                    : ""
                }
                onButtonClick={
                  canManageMembers(user, projectMembers)
                    ? () => setAddMemberModalOpen(true)
                    : undefined
                }
              />
            ) : (
              <ProjectMembersTable
                members={projectMembers}
                canManage={canManageMembers(user, projectMembers)}
                onEdit={handleOpenEditRoleModal}
                onRemove={handleOpenDeleteMemberModal}
                currentUser={user}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <Card key={note._id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(note.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {canEditNote(user, projectMembers) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditNoteModal(note)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3.5 w-3.5 text-blue-600" />
                            </Button>
                          )}
                          {canDeleteNote(user, projectMembers) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeleteNoteModal(note)}
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="line-clamp-4 text-sm">{note.content}</p>

                      {note.createdBy && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={note.createdBy.avatar?.url} />
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {note.createdBy.fullName?.charAt(0) ||
                                note.createdBy.username?.charAt(0) ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {note.createdBy.fullName || note.createdBy.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2">
                <Card className="shadow-sm">
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center space-y-4 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <h3 className="text-2xl font-semibold">No Notes Yet</h3>
                      <p className="text-lg text-muted-foreground max-w-md">
                        {userCanCreateNotes
                          ? "Create your first note to get started."
                          : "There are no notes in this project yet. You don't have permission to create notes."}
                      </p>
                      {userCanCreateNotes ? (
                        <Button
                          onClick={() => setCreateNoteModalOpen(true)}
                          className="mt-4"
                        >
                          Create Your First Note
                        </Button>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-base px-4 py-1 mt-4"
                        >
                          View Only Access
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Detail Drawer */}
      {(activeTab === "kanban" || activeTab === "list") && (
        <TaskDetail
          taskId={selectedTaskId}
          projectId={projectId}
          onClose={handleCloseTaskDetail}
          opened={shouldShowTaskDetails}
        />
      )}

      {/* Modals */}
      <AddMemberModal
        opened={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        onSubmit={handleAddMembers}
        isLoading={isLoading}
      />

      <MemberRoleModal
        opened={editRoleModalOpen}
        onClose={() => setEditRoleModalOpen(false)}
        onSubmit={handleUpdateRole}
        isLoading={isLoading}
        initialValues={
          selectedMember ? { role: selectedMember.role } : { role: "" }
        }
      />

      <TaskFormModal
        opened={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        title="Create New Task"
        projectId={projectId}
        members={projectMembers}
        onSubmit={handleCreateTask}
        initialValues={taskForm}
      />

      <NoteFormModal
        opened={createNoteModalOpen}
        onClose={() => setCreateNoteModalOpen(false)}
        title="Create New Note"
        onSubmit={handleCreateNote}
        initialValues={noteForm}
        isLoading={notesLoading}
      />

      {selectedNote && (
        <NoteFormModal
          opened={editNoteModalOpen}
          onClose={() => {
            setEditNoteModalOpen(false);
            setSelectedNote(null);
          }}
          title="Edit Note"
          onSubmit={handleEditNote}
          initialValues={{ content: selectedNote.content }}
          isLoading={notesLoading}
        />
      )}

      {selectedNote && (
        <ConfirmDeleteModal
          opened={deleteNoteModalOpen}
          onClose={() => {
            setDeleteNoteModalOpen(false);
            setSelectedNote(null);
          }}
          title="Delete Note"
          message="Are you sure you want to delete this note? This action cannot be undone."
          onConfirm={handleDeleteNote}
          isLoading={notesLoading}
        />
      )}

      {memberToDelete && (
        <ConfirmDeleteModal
          opened={deleteMemberModalOpen}
          onClose={() => {
            setDeleteMemberModalOpen(false);
            setMemberToDelete(null);
          }}
          title="Remove Member"
          message={`Are you sure you want to remove ${
            memberToDelete.user.fullName || memberToDelete.user.username
          } from this project? This action cannot be undone.`}
          onConfirm={handleRemoveMember}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
