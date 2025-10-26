import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Reusable error alert component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {Function} [props.onClose] - Optional callback for when the alert is closed
 */
export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4 relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 rounded-md hover:bg-destructive/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}
