import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRolesEnum } from "../../utils/constants";

/**
 * Member role modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 */
export default function MemberRoleModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { role: "" },
  isLoading = false,
}) {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const selectedRole = watch("role");

  // Update form when initialValues change
  useEffect(() => {
    if (initialValues.role) {
      setValue("role", initialValues.role);
    }
  }, [initialValues, setValue]);

  const onSubmitForm = (values) => {
    if (!values.role) {
      return;
    }
    onSubmit(values);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={opened} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Member Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value)}
            >
              <SelectTrigger id="role" autoFocus>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRolesEnum.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRolesEnum.PROJECT_ADMIN}>
                  Project Admin
                </SelectItem>
                <SelectItem value={UserRolesEnum.MEMBER}>Member</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Role
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}