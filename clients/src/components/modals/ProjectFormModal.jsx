import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

/**
 * Project form modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 * @param {string} [props.title="Create New Project"] - Modal title
 * @param {string} [props.submitText="Create Project"] - Submit button text
 */
export default function ProjectFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { name: "", description: "" },
  isLoading = false,
  title = "Create New Project",
  submitText = "Create Project",
}) {
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({ name: "", description: "" })
      setErrors({})
    }
  }

  const handleClose = () => {
    setFormData({ name: "", description: "" })
    setErrors({})
    onClose()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  return (
    <Dialog open={opened} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={handleInputChange}
              autoFocus
              required
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter project description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Loading..." : submitText}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
