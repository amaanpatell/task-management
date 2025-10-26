import { Button, Modal, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";

export default function ProjectFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { name: "", description: "" },
  isLoading = false,
  title = "Create New Project",
  submitText = "Create Project",
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: {
      name: (value) => (!value?.trim() ? "Name is required" : null),
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
          <TextInput
            label="Project Name"
            placeholder="Enter project name"
            required
            {...form.getInputProps("name")}
            data-autofocus
          />
          <Textarea
            label="Description"
            placeholder="Enter project description (optional)"
            autosize
            minRows={3}
            maxRows={6}
            {...form.getInputProps("description")}
          />
          <Button type="submit" loading={isLoading} fullWidth mt="md">
            {submitText}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
