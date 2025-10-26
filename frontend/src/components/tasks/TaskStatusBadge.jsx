import { Badge } from "@mantine/core";
import React from "react";
import { getStatusColor, getStatusLabel } from "../../utils/taskStatusUtils";

export default function TaskStatusBadge({
  status,
  size = "md",
  variant = "filled",
}) {
  // Get status color and label
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <Badge
      color={color}
      size={size}
      variant={variant}
      radius="sm"
      styles={{
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      }}
    >
      {label}
    </Badge>
  );
}
