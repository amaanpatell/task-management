import { Group, Text, Title } from "@mantine/core";

export default function PageHeader({ title, subtitle, rightSection }) {
  return (
    <Group position="apart" mb="xl">
      <div>
        <Title order={2}>{title}</Title>
        {subtitle && (
          <Text c="dimmed" mt="xs">
            {subtitle}
          </Text>
        )}
      </div>
      {rightSection && rightSection}
    </Group>
  );
}
