import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorAlert, NoProjectAlert } from "../components/common";
import { ConfirmDeleteModal, NoteFormModal } from "../components/modals";
import { NoteGrid } from "../components/notes";
import { useAuthStore, useNoteStore, useProjectStore } from "../store";
import {
  canCreateNote,
  canDeleteNote,
  canEditNote,
} from "../utils/permissions";
import { Toaster } from "@/components/ui/sonner";

export default function NotesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = Toaster();

  const {
    notes,
    isLoading: notesLoading,
    error,
    clearError,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNoteStore();

  const {
    currentProject,
    fetchProjectWithMembers,
    projects,
    isLoading: projectsLoading,
    projectMembers,
  } = useProjectStore();

  const { user } = useAuthStore();

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Effect to handle project and notes loading
  useEffect(() => {
    // Only fetch if we have a valid projectId
    if (projectId) {
      // This function already has built-in caching to prevent redundant calls
      fetchProjectWithMembers(projectId);
      fetchNotes(projectId);
    }
    // Handle navigation when no project ID is in URL
    else if (projects.length > 0) {
      const firstProjectId = projects[0].project?._id;
      if (firstProjectId) {
        navigate(`/projects/${firstProjectId}/notes`);
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
    fetchNotes,
  ]);

  const handleAddNote = async (values) => {
    if (!projectId) {
      console.error("No valid project selected");
      return;
    }

    try {
      // Check if user has permission to create notes
      if (!canCreateNote(user, projectMembers)) {
        toast({
          title: "Permission Denied",
          description:
            "You don't have permission to create notes in this project.",
          variant: "destructive",
        });
        return;
      }

      await createNote(projectId, values);
      setIsAddingNote(false);
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

  const openEditModal = (note) => {
    // Check if user has permission to edit this note
    if (!canEditNote(user, projectMembers)) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this note.",
        variant: "destructive",
      });
      return;
    }

    setSelectedNote(note);
    setEditModalOpen(true);
  };

  const openDeleteModal = (note) => {
    // Check if user has permission to delete this note
    if (!canDeleteNote(user, projectMembers)) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete this note.",
        variant: "destructive",
      });
      return;
    }

    setSelectedNote(note);
    setConfirmDeleteOpen(true);
  };

  const handleEditNote = async (values) => {
    if (!selectedNote || !projectId) return;

    try {
      // Double-check permission
      if (!canEditNote(user, projectMembers)) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to edit this note.",
          variant: "destructive",
        });
        return;
      }

      await updateNote(projectId, selectedNote._id, values);
      setEditModalOpen(false);
      setSelectedNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
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
    if (!selectedNote || !projectId) return;

    try {
      // Double-check permission
      if (!canDeleteNote(user, projectMembers)) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to delete this note.",
          variant: "destructive",
        });
        return;
      }

      await deleteNote(projectId, selectedNote._id);
      setConfirmDeleteOpen(false);
      setSelectedNote(null);
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = notesLoading || projectsLoading;

  // If no project is available, show a message
  if (!projectId) {
    return (
      <div className="container max-w-5xl py-8">
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

  // Check if user can create notes
  const userCanCreateNotes = canCreateNote(user, projectMembers);

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">{projectName} Notes</h2>
        {userCanCreateNotes ? (
          <Button onClick={() => setIsAddingNote(true)}>Add Note</Button>
        ) : (
          <Badge variant="secondary" className="text-base px-4 py-1">
            View Only
          </Badge>
        )}
      </div>

      {error && (
        <ErrorAlert title="Error" message={error} onClose={clearError} />
      )}

      {notes.length === 0 ? (
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
              {userCanCreateNotes && (
                <Button onClick={() => setIsAddingNote(true)} className="mt-4">
                  Create Your First Note
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <NoteGrid
          notes={notes}
          onEditNote={openEditModal}
          onDeleteNote={openDeleteModal}
        />
      )}

      {/* Add Note Modal */}
      <NoteFormModal
        opened={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        title="Add Note"
        onSubmit={handleAddNote}
        initialValues={{ content: "" }}
        isLoading={notesLoading}
      />

      {/* Edit Note Modal */}
      {selectedNote && (
        <NoteFormModal
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedNote(null);
          }}
          title="Edit Note"
          onSubmit={handleEditNote}
          initialValues={{ content: selectedNote.content }}
          isLoading={notesLoading}
        />
      )}

      {/* Confirm Delete Modal */}
      {selectedNote && (
        <ConfirmDeleteModal
          opened={confirmDeleteOpen}
          onClose={() => {
            setConfirmDeleteOpen(false);
            setSelectedNote(null);
          }}
          title="Delete Note"
          message="Are you sure you want to delete this note? This action cannot be undone."
          onConfirm={handleDeleteNote}
          isLoading={notesLoading}
        />
      )}
    </div>
  );
}
