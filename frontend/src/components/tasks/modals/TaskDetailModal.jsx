import { Modal } from "@mantine/core";
import React from "react";
import TaskDetail from "../TaskDetail";

export default function TaskDetailModal({ opened, onClose, taskId }) {
  return (
    <Modal opened={opened} onClose={onClose} title="Task Details" size="lg">
      <TaskDetail taskId={taskId} onClose={onClose} />
    </Modal>
  );
}
