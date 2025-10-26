import { Button, Card, Stack, Text } from "@mantine/core";

export default function EmptyState({ message, buttonText, onButtonClick }) {
  return (
    <Card p="xl" withBorder>
      <Stack align="center" spacing="md">
        <Text size="lg" c="dimmed">
          {message}
        </Text>
        {buttonText && onButtonClick && (
          <Button onClick={onButtonClick}>{buttonText}</Button>
        )}
      </Stack>
    </Card>
  );
}
