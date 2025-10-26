import { Button } from "@/components/ui/button";
import { FrownIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex flex-col items-center space-y-6 py-12">
        <FrownIcon className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-4xl font-bold text-center">404 - Page Not Found</h1>
        <p className="text-xl text-muted-foreground text-center max-w-[500px]">
          Sorry, we couldn't find the page you're looking for. The page might
          have been removed, renamed, or doesn't exist.
        </p>
        <div className="flex flex-col items-center space-y-3 mt-4">
          <Button size="lg" onClick={() => navigate("/projects")}>
            Go to Projects
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
