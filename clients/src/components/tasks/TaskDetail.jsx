import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Download,
  Edit,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useAuthStore, useProjectStore, useTaskStore } from "../../store";
import { TaskStatusEnum } from "../../utils/constants";
import { formatDateTime } from "../../utils/dateUtils";
import { canEditTask } from "../../utils/permissions";
import {
  getStatusColor,
  getStatusLabel,
  getStatusOptions,
} from "../../utils/taskStatusUtils";
import SubtaskList from "./subTasks/SubtaskList";
import { Toaster } from "../ui/sonner";

/**
 * Task detail component for displaying and editing a task
 * @param {Object} props - Component props
 * @param {string} props.taskId - ID of the task to display
 * @param {string} props.projectId - ID of the project the task belongs to
 * @param {Function} props.onClose - Function to call when the detail view is closed
 * @param {boolean} props.opened - Whether the drawer is open
 */
export default function TaskDetail({ taskId, projectId, onClose, opened }) {
  const { toast } = Toaster();
  const {
    currentTask,
    subtasks,
    isLoading,
    fetchTaskById,
    updateTask,
    deleteTask,
  } = useTaskStore();
  const { projectMembers, fetchProjectMembers } = useProjectStore();
  const { user } = useAuthStore();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: TaskStatusEnum.TODO,
    assignedTo: "",
  });
  const [editErrors, setEditErrors] = useState({});

  // Fetch task and project members data
  useEffect(() => {
    if (projectId && taskId && opened) {
      fetchTaskById(projectId, taskId).catch(console.error);
      fetchProjectMembers(projectId).catch(console.error);
    }
  }, [projectId, taskId, fetchTaskById, fetchProjectMembers, opened]);

  // Update attachments when currentTask changes
  useEffect(() => {
    if (currentTask?.attachments) {
      setAttachments(currentTask.attachments);
    }
  }, [currentTask]);

  // Check if user can edit this task
  const userCanEditTask = currentTask
    ? canEditTask(user, projectMembers)
    : false;

  // Handle opening the edit modal - set form values from currentTask
  const handleOpenEditModal = () => {
    if (!userCanEditTask) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this task.",
        variant: "destructive",
      });
      return;
    }

    if (currentTask) {
      setEditForm({
        title: currentTask.title || "",
        description: currentTask.description || "",
        status: currentTask.status || TaskStatusEnum.TODO,
        assignedTo: currentTask.assignedTo?._id || "",
      });
    }
    setEditModalOpen(true);
  };

  // Handle closing the edit modal - reset form
  const handleCloseEditModal = () => {
    setEditForm({
      title: "",
      description: "",
      status: TaskStatusEnum.TODO,
      assignedTo: "",
    });
    setEditErrors({});
    setNewAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setEditModalOpen(false);
  };

  // Handle edit task submission
  const handleEditTask = async (e) => {
    e.preventDefault();

    if (!userCanEditTask) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this task.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    const errors = {};
    if (!editForm.title.trim()) {
      errors.title = "Title is required";
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      await updateTask(projectId, taskId, editForm, newAttachments);
      handleCloseEditModal();
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!userCanEditTask) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete this task.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteTask(projectId, taskId);
      setDeleteModalOpen(false);
      onClose();
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewAttachments(files);
  };

  const removeNewAttachment = (indexToRemove) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      [TaskStatusEnum.TODO]: "default",
      [TaskStatusEnum.IN_PROGRESS]: "secondary",
      [TaskStatusEnum.DONE]: "default",
    };
    return variants[status] || "default";
  };

  return (
    <>
      <Sheet open={opened} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>

          {!currentTask ? (
            <p className="text-center text-muted-foreground mt-8">
              Loading task details...
            </p>
          ) : (
            <div className="space-y-6 mt-6">
              {/* Header with title and actions */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-semibold flex-1">
                  {currentTask.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getStatusBadgeVariant(currentTask.status)}>
                    {getStatusLabel(currentTask.status)}
                  </Badge>
                  {userCanEditTask && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenEditModal}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteModalOpen(true)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h5 className="text-sm font-semibold">Description</h5>
                <p className="text-sm">
                  {currentTask.description || "No description provided."}
                </p>
              </div>

              <Separator />

              {/* Assigned To */}
              <div className="space-y-2">
                <h5 className="text-sm font-semibold">Assigned To</h5>
                {currentTask.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={currentTask.assignedTo.avatar?.url}
                        alt={
                          currentTask.assignedTo.fullName ||
                          currentTask.assignedTo.username
                        }
                      />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {(
                          currentTask.assignedTo.fullName ||
                          currentTask.assignedTo.username ||
                          "U"
                        ).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {currentTask.assignedTo.fullName ||
                          currentTask.assignedTo.username}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not assigned</p>
                )}
              </div>

              <Separator />

              {/* Attachments */}
              {attachments.length > 0 && (
                <>
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold">Attachments</h5>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => (
                        <Button key={index} variant="outline" size="sm" asChild>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {attachment.url.split("/").pop()}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Subtasks */}
              <SubtaskList task={currentTask} subtasks={subtasks} />

              {/* Timestamps */}
              <div className="flex justify-between text-xs text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created: {formatDateTime(currentTask.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Updated: {formatDateTime(currentTask.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Task Modal */}
      <Dialog open={editModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTask}>
            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-title"
                  placeholder="Task title"
                  value={editForm.title}
                  onChange={(e) => {
                    setEditForm({ ...editForm, title: e.target.value });
                    if (editErrors.title)
                      setEditErrors({ ...editErrors, title: "" });
                  }}
                  className={editErrors.title ? "border-red-500" : ""}
                  autoFocus
                />
                {editErrors.title && (
                  <p className="text-sm text-red-500">{editErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Task description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStatusOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label htmlFor="edit-assignedTo">Assigned To</Label>
                <Select
                  value={editForm.assignedTo}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, assignedTo: value })
                  }
                >
                  <SelectTrigger id="edit-assignedTo">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(projectMembers) &&
                      projectMembers.map((member) => (
                        <SelectItem
                          key={member.user._id}
                          value={member.user._id}
                        >
                          {member.user.fullName || member.user.username}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="edit-attachments">Add Attachments</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Display new attachments */}
                  {newAttachments.length > 0 && (
                    <div className="space-y-2 rounded-md border p-3">
                      {newAttachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 rounded bg-secondary/50 px-2 py-1"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Upload className="h-4 w-4 shrink-0" />
                            <span className="text-sm truncate">
                              {file.name}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNewAttachment(index)}
                            className="h-6 w-6 p-0 shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Attachments */}
              {attachments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Current Attachments</Label>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => (
                        <Button key={index} variant="outline" size="sm" asChild>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {attachment.url.split("/").pop()}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Task Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Are you sure you want to delete this task?</p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
