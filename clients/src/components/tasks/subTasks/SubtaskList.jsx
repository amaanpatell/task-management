import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Edit, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTaskStore } from "../../../store";
import { TaskStatusEnum } from "../../../utils/constants";
import { getStatusColor } from "../../../utils/taskStatusUtils";

/**
 * Subtask list component for displaying and managing subtasks
 * @param {Object} props - Component props
 * @param {Object} props.task - Parent task object
 * @param {Array} props.subtasks - Array of subtasks to display
 */
export default function SubtaskList({ task, subtasks = [] }) {
  const { projectId } = useParams();
  const {
    toggleSubtaskCompletion,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    isLoading,
  } = useTaskStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [opened, setOpened] = useState(true);

  const [addTitle, setAddTitle] = useState("");
  const [addError, setAddError] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editError, setEditError] = useState("");

  const handleToggleCompletion = async (subtaskId, isCompleted) => {
    try {
      await toggleSubtaskCompletion(projectId, subtaskId, isCompleted);
    } catch (error) {
      console.error("Failed to toggle subtask completion:", error);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();

    if (addTitle.trim().length < 1) {
      setAddError("Title is required");
      return;
    }

    try {
      await createSubtask(projectId, task._id, { title: addTitle });
      setAddTitle("");
      setAddError("");
      setAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add subtask:", error);
    }
  };

  const openEditModal = (subtask) => {
    setSelectedSubtask(subtask);
    setEditTitle(subtask.title);
    setEditError("");
    setEditModalOpen(true);
  };

  const openDeleteModal = (subtask) => {
    setSelectedSubtask(subtask);
    setDeleteModalOpen(true);
  };

  const handleEditSubtask = async (e) => {
    e.preventDefault();

    if (editTitle.trim().length < 1) {
      setEditError("Title is required");
      return;
    }

    if (!selectedSubtask) return;

    try {
      await updateSubtask(projectId, selectedSubtask._id, {
        title: editTitle,
        isCompleted: selectedSubtask.isCompleted,
      });
      setEditModalOpen(false);
      setSelectedSubtask(null);
      setEditTitle("");
      setEditError("");
    } catch (error) {
      console.error("Failed to update subtask:", error);
    }
  };

  const handleDeleteSubtask = async () => {
    if (!selectedSubtask) return;

    try {
      await deleteSubtask(projectId, selectedSubtask._id);
      setDeleteModalOpen(false);
      setSelectedSubtask(null);
    } catch (error) {
      console.error("Failed to delete subtask:", error);
    }
  };

  const completedCount = subtasks.filter((st) => st.isCompleted).length;
  const progress =
    subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  const getStatusColorClass = (status) => {
    const colors = {
      [TaskStatusEnum.TODO]: "bg-blue-500",
      [TaskStatusEnum.IN_PROGRESS]: "bg-yellow-500",
      [TaskStatusEnum.DONE]: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
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
    <TooltipProvider>
      <Card className="mb-4 shadow-sm">
        <CardContent className="p-4">
          <Collapsible open={opened} onOpenChange={setOpened}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h5 className="text-lg font-semibold">Subtasks</h5>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {opened ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {completedCount}/{subtasks.length} completed
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddModalOpen(true)}
                  className="h-7"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {subtasks.length > 0 && (
              <div className="mb-4">
                <Progress
                  value={progress}
                  className={`h-2 ${
                    task.status === TaskStatusEnum.IN_PROGRESS
                      ? "animate-pulse"
                      : ""
                  }`}
                />
              </div>
            )}

            <CollapsibleContent>
              {subtasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subtasks yet
                </p>
              ) : (
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask._id}
                      className={`p-2 rounded-md transition-colors ${
                        subtask.isCompleted ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={subtask.isCompleted}
                            onCheckedChange={() =>
                              handleToggleCompletion(
                                subtask._id,
                                subtask.isCompleted
                              )
                            }
                          />
                          <span
                            className={`text-sm ${
                              subtask.isCompleted
                                ? "line-through opacity-70"
                                : ""
                            }`}
                          >
                            {subtask.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => openEditModal(subtask)}
                              >
                                <Edit className="h-3.5 w-3.5 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Subtask</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => openDeleteModal(subtask)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Subtask</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Add Subtask Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubtask}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-title">
                  Subtask Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-title"
                  placeholder="Enter subtask title"
                  value={addTitle}
                  onChange={(e) => {
                    setAddTitle(e.target.value);
                    if (addError) setAddError("");
                  }}
                  className={addError ? "border-red-500" : ""}
                  autoFocus
                />
                {addError && <p className="text-sm text-red-500">{addError}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Subtask"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subtask Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subtask</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubtask}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">
                  Subtask Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-title"
                  placeholder="Enter subtask title"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    if (editError) setEditError("");
                  }}
                  className={editError ? "border-red-500" : ""}
                  autoFocus
                />
                {editError && (
                  <p className="text-sm text-red-500">{editError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Subtask"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Subtask Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Subtask</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              Are you sure you want to delete this subtask? This action cannot
              be undone.
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
              onClick={handleDeleteSubtask}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
