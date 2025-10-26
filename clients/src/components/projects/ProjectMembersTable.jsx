import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserRolesEnum } from "../../utils/constants";
import { formatDate } from "../../utils/dateUtils";
import { canRemoveMember } from "../../utils/permissions";

/**
 * Project members table component
 * @param {Object} props - Component props
 * @param {Array} props.members - Array of project members
 * @param {Function} props.onEdit - Function to call when edit role button is clicked
 * @param {Function} props.onRemove - Function to call when remove member button is clicked
 * @param {boolean} props.canManage - Whether the current user can manage members
 * @param {boolean} props.compact - Whether to show a compact version of the table
 * @param {Object} props.currentUser - The current logged in user
 */
export default function ProjectMembersTable({
  members,
  onEdit,
  onRemove,
  canManage,
  compact,
  currentUser,
}) {
  if (!members || members.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No members in this project yet.
      </p>
    );
  }

  // Helper function to get initials for avatar fallback
  const getInitials = (user) => {
    const name = user.fullName || user.username || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            {canManage && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const { allowed: canBeRemoved, message: removeMessage } =
              canRemoveMember(currentUser, member.user, members);

            return (
              <TableRow key={member.user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.avatar?.url} />
                      <AvatarFallback>
                        {getInitials(member.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.user.fullName || member.user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.role === UserRolesEnum.ADMIN
                        ? "destructive"
                        : member.role === UserRolesEnum.PROJECT_ADMIN
                        ? "default"
                        : "secondary"
                    }
                  >
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(member.createdAt)}</TableCell>
                {canManage && (
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onEdit(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit role</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onRemove(member)}
                              disabled={!canBeRemoved}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {!canBeRemoved ? removeMessage : "Remove member"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
