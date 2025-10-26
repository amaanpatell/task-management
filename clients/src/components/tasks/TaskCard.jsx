import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Calendar, ListChecks } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuthStore, useProjectStore, useTaskStore } from "../../store";
import { TaskStatusEnum } from "../../utils/constants";
import { formatRelativeTime } from "../../utils/dateUtils";
import { canEditTask } from "../../utils/permissions";
import { getStatusColor, getStatusLabel } from "../../utils/taskStatusUtils";
import { Toaster } from "../ui/sonner";

const MAX_VISIBLE_SUBTASKS = 3;

/**
 * Task card component for displaying a task in the kanban board or list
 * @param {Object} props - Component props
 * @param {Object} props.task - Task object to display
 * @param {string} props.projectId - ID of the project the task belongs to
 * @param {boolean} props.isDragging - Whether the card is being dragged
 * @param {Function} props.onClick - Function to call when the card is clicked
 */
export default function TaskCard({ task, projectId, isDragging, onClick }) {
  const { toast } = Toaster();
  const { toggleSubtaskCompletion } = useTaskStore();
  const { projectMembers, fetchProjectMembers } = useProjectStore();
  const { user } = useAuthStore();
  const [subtasks, setSubtasks] = useState(task.subtasks || []);

  useEffect(() => {
    setSubtasks(task.subtasks || []);
  }, [task.subtasks]);

  useEffect(() => {
    if (projectId) {
      fetchProjectMembers(projectId).catch(console.error);
    }
  }, [projectId, fetchProjectMembers]);

  const userCanEditTask = canEditTask(user, projectMembers);

  const getAssigneeInfo = () => {
    if (!task.assignedTo) {
      return {
        avatar: null,
        name: "Unassigned",
        initial: "?",
        color: "bg-gray-500",
      };
    }

    const assignee = task.assignedTo;
    const name = assignee.fullName || assignee.username || "Unknown";

    return {
      avatar: assignee.avatar?.url,
      name,
      initial: name.charAt(0).toUpperCase(),
      color: "bg-blue-500",
    };
  };

  const getSubtaskProgress = () => {
    const completed = subtasks.filter((subtask) => subtask.isCompleted).length;
    const total = subtasks.length;
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  const handleSubtaskToggle = async (subtaskId, isCompleted) => {
    if (!userCanEditTask) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update subtasks for this task.",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleSubtaskCompletion(projectId, subtaskId, isCompleted);
      setSubtasks(
        subtasks.map((subtask) =>
          subtask._id === subtaskId
            ? { ...subtask, isCompleted: !isCompleted }
            : subtask
        )
      );
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
      toast({
        title: "Error",
        description: "Failed to update subtask. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { completed, total, percentage } = getSubtaskProgress();
  const { avatar, name, initial, color } = getAssigneeInfo();
  const statusColor = getStatusColor(task.status);

  const getStatusBorderColor = (status) => {
    const colors = {
      [TaskStatusEnum.TODO]: "border-l-blue-600",
      [TaskStatusEnum.IN_PROGRESS]: "border-l-yellow-600",
      [TaskStatusEnum.DONE]: "border-l-green-600",
    };
    return colors[status] || "border-l-gray-600";
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
    <Card
      className={`
        mb-4 cursor-pointer border-l-4 
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
        ${getStatusBorderColor(task.status)}
        ${isDragging ? "opacity-80" : "opacity-100"}
      `}
      onClick={() => onClick?.(task._id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-lg truncate flex-1">
              {task.title}
            </h3>
            <Badge variant={getStatusBadgeVariant(task.status)}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description || "No description provided."}
          </p>

          {/* Assignee */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className={`${color} text-white text-xs`}>
                {initial}
              </AvatarFallback>
            </Avatar>
            <span
              className={`text-sm ${
                name === "Unassigned" ? "text-muted-foreground" : ""
              }`}
            >
              {name}
            </span>
          </div>

          {/* Subtasks Section */}
          {total > 0 && (
            <>
              {/* Progress Bar */}
              <Progress
                value={percentage}
                className={`h-2 ${
                  task.status === TaskStatusEnum.IN_PROGRESS
                    ? "animate-pulse"
                    : ""
                }`}
              />

              {/* Subtask Count */}
              <div className="flex items-center gap-2">
                <ListChecks className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {completed} of {total} subtasks completed
                </span>
              </div>

              {/* Subtask List */}
              <div className="space-y-2 mt-2">
                {subtasks.slice(0, MAX_VISIBLE_SUBTASKS).map((subtask) => (
                  <div key={subtask._id} className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.isCompleted}
                      onCheckedChange={(checked) => {
                        handleSubtaskToggle(subtask._id, subtask.isCompleted);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      disabled={!userCanEditTask}
                      className="h-4 w-4"
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
                ))}
                {total > MAX_VISIBLE_SUBTASKS && (
                  <p className="text-xs text-muted-foreground">
                    +{total - MAX_VISIBLE_SUBTASKS} more subtasks
                  </p>
                )}
              </div>
            </>
          )}

          {/* Created Date */}
          {task.createdAt && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(task.createdAt)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}