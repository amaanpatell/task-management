import { Button, Group, Modal, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";

export default function NoteFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { content: "" },
  isLoading = false,
  title = "Create New Note",
  submitText = "Save Note",
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: {
      content: (value) => (!value?.trim() ? "Content is required" : null),
    },
  });

  const handleSubmit = (values) => {
    onSubmit(values);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Textarea
            label="Note Content"
            placeholder="Enter your note here..."
            minRows={4}
            required
            {...form.getInputProps("content")}
            data-autofocus
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {submitText}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
