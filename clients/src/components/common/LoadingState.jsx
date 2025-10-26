import { Loader2 } from "lucide-react";

/**
 * Reusable loading overlay component
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the loading overlay is visible
 */
export default function LoadingState({ visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}