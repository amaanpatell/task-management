import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Alert component shown when no project is selected
 */
export default function NoProjectAlert() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl py-12">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Project Selected</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            Please select a project from the header dropdown or create a new
            project.
          </p>
          <Button
            onClick={() => navigate("/projects")}
            variant="outline"
            className="w-full"
          >
            Go to Projects
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
