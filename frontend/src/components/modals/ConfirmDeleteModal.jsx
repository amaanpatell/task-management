import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import React from "react";

export default function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      withCloseButton
    >
      <Stack spacing="lg">
        <Text>{message}</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={isLoading}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
