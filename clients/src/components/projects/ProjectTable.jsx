import { Edit, Trash, Users } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "../../utils/dateUtils";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

/**
 * Project table component
 * @param {Object} props - Component props
 * @param {Array} props.projects - Array of projects
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.canManageProject - Function to determine if user can manage a project
 */
export default function ProjectTable({
  projects,
  onEdit,
  onDelete,
  canManageProject,
}) {
  if (projects.length === 0) {
    return null;
  }

  // Helper function to normalize project structure
  // API might return either {project: {...}, role: ...} or {...} directly
  const getProjectData = (item) => {
    // If item has a 'project' property, it's the wrapped structure
    if (item && item.project) {
      return {
        project: item.project,
        role: item.role,
        isWrapped: true,
      };
    }
    // Otherwise, it's the direct structure
    return {
      project: item,
      role: item.role, // role might be at top level or undefined
      isWrapped: false,
    };
  };

  return (
    <Card>
      <CardContent className="p-6">
        <ScrollArea className="w-full">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects
                  .filter((item) => {
                    const { project } = getProjectData(item);
                    return project && project._id;
                  })
                  .map((item) => {
                    const { project } = getProjectData(item);

                    return (
                      <TableRow key={project._id}>
                        <TableCell>
                          <Link
                            to={`/projects/${project._id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {project.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <p className="line-clamp-2 text-sm">
                            {project.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{project.members || 0}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(project.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => onEdit(item)}
                              disabled={!canManageProject(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDelete(item)}
                              disabled={!canManageProject(item)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
