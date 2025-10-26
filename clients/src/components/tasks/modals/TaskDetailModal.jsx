import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import TaskDetail from "../TaskDetail";

/**
 * Task detail modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.taskId - ID of the task to display
 */
export default function TaskDetailModal({ opened, onClose, taskId }) {
  return (
    <Dialog open={opened} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        <TaskDetail taskId={taskId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
