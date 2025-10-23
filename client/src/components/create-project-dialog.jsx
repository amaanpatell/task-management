"use client";

import { useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useProjectStore from "@/store/projectStore";
import { Label } from "@/components/ui/label";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Get createProject action from Zustand store
  const createProject = useProjectStore((state) => state.createProject);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      console.error("Project name is required");
      return;
    }

    setIsLoading(true);
    try {
      // Log the payload being sent for debugging
      console.log("Creating project with data:", {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      // Create project using Zustand store action
      await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      console.log("Project created successfully");

      // Reset form and close dialog on success
      setFormData({ name: "", description: "" });
      setOpen(false);
    } catch (error) {
      // Enhanced error logging
      console.error("Failed to create project:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full justify-start gap-2">
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your workspace. You can update these details
            later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter project description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
