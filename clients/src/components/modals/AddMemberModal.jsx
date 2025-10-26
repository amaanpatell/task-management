import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRolesEnum } from "../../utils/constants";

/**
 * Add member modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {boolean} [props.isLoading] - Whether the form is loading
 */
export default function AddMemberModal({
  opened,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      email: "",
      role: UserRolesEnum.MEMBER,
    },
  });

  const selectedRole = watch("role");

  const onSubmitForm = (values) => {
    onSubmit(values);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Create role options with user-friendly labels and descriptions
  const roleOptions = [
    {
      value: UserRolesEnum.ADMIN,
      label: "Admin",
      description: "Full access to manage the project and its members",
    },
    {
      value: UserRolesEnum.PROJECT_ADMIN,
      label: "Project Admin",
      description: "Can manage project tasks and content, but not members",
    },
    {
      value: UserRolesEnum.MEMBER,
      label: "Member",
      description: "Basic access to view and contribute to the project",
    },
  ];

  return (
    <Dialog open={opened} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Project Members</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              autoFocus
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/,
                  message: "Invalid email",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <p className="text-xs text-muted-foreground">
              Select the appropriate permission level for this member
            </p>

            <RadioGroup
              value={selectedRole}
              onValueChange={(value) => setValue("role", value)}
              className="space-y-3 mt-3"
            >
              {roleOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer space-y-1 font-normal"
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
