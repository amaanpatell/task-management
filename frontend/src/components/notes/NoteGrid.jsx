import { SimpleGrid, Text } from "@mantine/core";
import React from "react";
import NoteCard from "./NoteCard";

export default function NoteGrid({
  notes,
  onEditNote,
  onDeleteNote,
  emptyMessage = 'No notes yet. Click "Add New Note" to create one.',
}) {
  if (!notes || notes.length === 0) {
    return (
      <Text c="dimmed" ta="center" mt="xl" style={{ gridColumn: "1 / -1" }}>
        {emptyMessage}
      </Text>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onEdit={onEditNote}
          onDelete={onDeleteNote}
        />
      ))}
    </SimpleGrid>
  );
}
