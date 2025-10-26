import { Badge } from "@/components/ui/badge";
import React from "react";
import { getStatusColor, getStatusLabel } from "../../utils/taskStatusUtils";
import { TaskStatusEnum } from "../../utils/constants";

/**
 * Task status badge component
 * @param {Object} props - Component props
 * @param {string} props.status - Task status
 * @param {string} [props.size="md"] - Badge size (sm, md, lg)
 * @param {string} [props.variant="filled"] - Badge variant (filled, outline, secondary)
 */
export default function TaskStatusBadge({
  status,
  size = "md",
  variant = "filled",
}) {
  // Get status label
  const label = getStatusLabel(status);

  // Map Mantine sizes to Tailwind classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  // Map status to badge variant for shadcn
  const getVariant = () => {
    if (variant === "outline") return "outline";
    if (variant === "secondary") return "secondary";

    // For filled variant, use different variants based on status
    switch (status) {
      case TaskStatusEnum.TODO:
        return "default";
      case TaskStatusEnum.IN_PROGRESS:
        return "secondary";
      case TaskStatusEnum.DONE:
        return "default";
      default:
        return "default";
    }
  };

  // Get custom color classes based on status (for filled variant)
  const getStatusColorClasses = () => {
    if (variant === "outline" || variant === "secondary") return "";

    switch (status) {
      case TaskStatusEnum.TODO:
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case TaskStatusEnum.IN_PROGRESS:
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case TaskStatusEnum.DONE:
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  return (
    <Badge
      variant={getVariant()}
      className={`
        ${sizeClasses[size] || sizeClasses.md}
        ${getStatusColorClasses()}
        font-medium
        rounded-sm
      `}
    >
      {label}
    </Badge>
  );
}
