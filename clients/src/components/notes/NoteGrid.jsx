import React from "react";
import NoteCard from "./NoteCard";

/**
 * Note grid component
 * @param {Object} props - Component props
 * @param {Array} props.notes - Array of notes
 * @param {Function} props.onEditNote - Function to call when edit button is clicked
 * @param {Function} props.onDeleteNote - Function to call when delete button is clicked
 * @param {string} [props.emptyMessage="No notes yet. Click \"Add New Note\" to create one."] - Message to display when there are no notes
 */
export default function NoteGrid({
  notes,
  onEditNote,
  onDeleteNote,
  emptyMessage = 'No notes yet. Click "Add New Note" to create one.',
}) {
  if (!notes || notes.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onEdit={onEditNote}
          onDelete={onDeleteNote}
        />
      ))}
    </div>
  );
}