import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";

export default function SubtaskFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { title: "" },
  isLoading = false,
  title = "Add Subtask",
  submitText = "Add Subtask",
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: initialValues.title || "",
    },
    validate: {
      title: (value) => (value.trim().length < 1 ? "Title is required" : null),
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title={title}
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack spacing="md">
          <TextInput
            label="Subtask Title"
            placeholder="Enter subtask title"
            required
            key={form.key("title")}
            {...form.getInputProps("title")}
            data-autofocus
          />
          <Button type="submit" loading={isLoading} fullWidth mt="md">
            {submitText}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
