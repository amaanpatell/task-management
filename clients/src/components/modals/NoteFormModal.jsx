import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";

/**
 * Note form modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 * @param {string} [props.title="Create New Note"] - Modal title
 * @param {string} [props.submitText="Save Note"] - Submit button text
 */
export default function NoteFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { content: "" },
  isLoading = false,
  title = "Create New Note",
  submitText = "Save Note",
}) {
  const [content, setContent] = useState(initialValues.content);
  const [error, setError] = useState("");

  // Reset form when modal opens with new initial values
  useEffect(() => {
    setContent(initialValues.content);
    setError("");
  }, [initialValues.content, opened]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!content?.trim()) {
      setError("Content is required");
      return;
    }
    
    setError("");
    onSubmit({ content });
    
    // Reset form
    setContent("");
  };

  const handleClose = () => {
    setContent("");
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
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">
                Note Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Enter your note here..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (error) setError("");
                }}
                rows={4}
                className={error ? "border-red-500" : ""}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}