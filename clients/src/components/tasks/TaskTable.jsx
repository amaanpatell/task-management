import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListChecks, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore, useProjectStore, useTaskStore } from "../../store";
import { TaskStatusEnum } from "../../utils/constants";
import { canEditTask } from "../../utils/permissions";
import {
  getStatusColor,
  getStatusLabel,
  getStatusOptions,
} from "../../utils/taskStatusUtils";
import { Toaster } from "../ui/sonner";

/**
 * Task table component for displaying tasks in a table format
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of tasks to display
 * @param {Function} props.onTaskClick - Function to call when a task is clicked
 */
export default function TaskTable({ tasks = [], onTaskClick }) {
  const { toast } = Toaster();
  const { projectId } = useParams();
  const { isLoading, changeTaskStatus } = useTaskStore();
  const { fetchProjectMembers, projectMembers } = useProjectStore();
  const { user } = useAuthStore();

  const [localTasks, setLocalTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState({});

  useEffect(() => {
    if (projectId) {
      fetchProjectMembers(projectId).catch(console.error);
    }
  }, [projectId, fetchProjectMembers]);

  useEffect(() => {
    setLocalTasks(tasks);
    // Initialize status state for each task
    const initialStatusState = {};
    tasks.forEach((task) => {
      initialStatusState[task._id] = task.status;
    });
    setTaskStatuses(initialStatusState);
  }, [tasks]);

  const userCanEditTask = () => {
    return canEditTask(user, projectMembers);
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    const task = localTasks.find((t) => t._id === taskId);
    if (!task) return;

    // Check if user has permission to edit this task
    if (!userCanEditTask(task)) {
      toast({
        title: "Permission Denied",
        description:
          "You don't have permission to change the status of this task.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update global state
      await changeTaskStatus(projectId, taskId, newStatus);

      // Update local states
      setLocalTasks(
        localTasks.map((t) =>
          t._id === taskId ? { ...t, status: newStatus } : t
        )
      );
      setTaskStatuses((prev) => ({
        ...prev,
        [taskId]: newStatus,
      }));

      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (error) {
      console.error("Failed to change task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Simple function to render the assignee cell
  const renderAssigneeCell = (assignedTo) => {
    // If there's no assignedTo field or it's null
    if (!assignedTo) {
      return <span className="text-sm text-muted-foreground">Unassigned</span>;
    }

    // If assignedTo is an object with user details
    if (typeof assignedTo === "object") {
      const name = assignedTo.fullName || assignedTo.username || "Unknown";
      const initial = name.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignedTo.avatar?.url} alt={name} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{name}</span>
        </div>
      );
    }

    // If assignedTo is just an ID (string)
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-blue-500 text-white text-xs">
            U
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">Assigned User</span>
      </div>
    );
  };

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
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[150px]">Change Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localTasks.map((task) => (
                <TableRow
                  key={task._id}
                  className={`
                    border-l-4 cursor-pointer transition-colors
                    hover:bg-muted/50
                    ${getStatusBorderColor(task.status)}
                  `}
                  onClick={() => onTaskClick && onTaskClick(task._id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <ListChecks className="h-3.5 w-3.5" />
                          <span className="text-xs text-muted-foreground">
                            ({task.subtasks.length})
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{renderAssigneeCell(task.assignedTo)}</TableCell>
                  <TableCell className="text-sm">
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={taskStatuses[task._id] || task.status}
                      onValueChange={(value) =>
                        handleTaskStatusChange(task._id, value)
                      }
                      disabled={!userCanEditTask(task)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getStatusOptions().map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-xs"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {localTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No tasks to display
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
