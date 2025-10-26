import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import React from "react";

/**
 * Note card component
 * @param {Object} props - Component props
 * @param {Object} props.note - Note object
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 */
export default function NoteCard({ note, onEdit, onDelete }) {
  // Function to render the creator information
  const renderCreator = () => {
    // If there's no createdBy field or it's null
    if (!note.createdBy) {
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              ?
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">Unknown User</span>
        </div>
      );
    }

    // If createdBy is an object with user details
    if (typeof note.createdBy === "object") {
      const name =
        note.createdBy.fullName || note.createdBy.username || "Unknown";
      const initial = name.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={note.createdBy.avatar?.url} alt={name} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">By: {name}</span>
        </div>
      );
    }

    // If createdBy is just an ID (string)
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-blue-500 text-white text-xs">
            U
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">By: User</span>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with date and menu */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {note.createdAt
                ? new Date(note.createdAt).toLocaleDateString()
                : ""}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit && onEdit(note)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Note
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete && onDelete(note)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Note content */}
          <p className="text-sm leading-relaxed">{note.content}</p>

          {/* Creator information */}
          {renderCreator()}
        </div>
      </CardContent>
    </Card>
  );
}
