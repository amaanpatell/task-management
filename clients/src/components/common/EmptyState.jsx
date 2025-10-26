import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Reusable empty state component
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {string} [props.buttonText] - Optional button text
 * @param {Function} [props.onButtonClick] - Optional button click handler
 */
export default function EmptyState({ message, buttonText, onButtonClick }) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-muted-foreground text-center">
            {message}
          </p>
          {buttonText && onButtonClick && (
            <Button onClick={onButtonClick}>{buttonText}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}