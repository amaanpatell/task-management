import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title="Error"
      color="red"
      mb="md"
      withCloseButton={!!onClose}
      onClose={onClose}
    >
      {error}
    </Alert>
  );
}
