import { LoadingOverlay } from "@mantine/core";

export default function LoadingState({ visible }) {
  return <LoadingOverlay visible={visible} overlayBlur={2} />;
}
