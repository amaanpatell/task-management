import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";

/**
 * Subtask form modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 * @param {string} [props.title="Add Subtask"] - Modal title
 * @param {string} [props.submitText="Add Subtask"] - Submit button text
 */
export default function SubtaskFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { title: "" },
  isLoading = false,
  title = "Add Subtask",
  submitText = "Add Subtask",
}) {
  const [subtaskTitle, setSubtaskTitle] = useState(initialValues.title || "");
  const [error, setError] = useState("");

  // Reset form when modal opens with new initial values
  useEffect(() => {
    setSubtaskTitle(initialValues.title || "");
    setError("");
  }, [initialValues.title, opened]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    if (subtaskTitle.trim().length < 1) {
      setError("Title is required");
      return;
    }

    setError("");
    onSubmit({ title: subtaskTitle });

    // Reset form
    setSubtaskTitle("");
  };

  const handleClose = () => {
    setSubtaskTitle("");
    setError("");
    onClose();
  };

  const handleOpenChange = (open) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={opened} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Subtask Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter subtask title"
              value={subtaskTitle}
              onChange={(e) => {
                setSubtaskTitle(e.target.value);
                if (error) setError("");
              }}
              className={error ? "border-red-500" : ""}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full mt-4">
            {isLoading ? "Saving..." : submitText}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
