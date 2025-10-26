import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTaskStore } from "../../../store";
import { TaskStatusEnum } from "../../../utils/constants";
import TaskCard from "../TaskCard";
import { Loader2 } from "lucide-react";

/**
 * Kanban board component for visualizing tasks in columns by status
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of tasks to display
 * @param {Function} props.onTaskClick - Function to call when a task is clicked
 * @param {Function} props.onDragEnd - Function to handle drag end event
 */
export default function KanbanBoard({ tasks = [], onTaskClick, onDragEnd }) {
  const { projectId } = useParams();
  const { isLoading } = useTaskStore();
  const [columns, setColumns] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Group tasks by status whenever tasks array changes
  useEffect(() => {
    const groupedTasks = Object.values(TaskStatusEnum).reduce(
      (acc, status) => ({
        ...acc,
        [status]: tasks.filter((task) => task.status === status),
      }),
      {}
    );

    setColumns(groupedTasks);
  }, [tasks]);

  const getColumnColor = (status) => {
    const colors = {
      [TaskStatusEnum.TODO]: "bg-blue-50",
      [TaskStatusEnum.IN_PROGRESS]: "bg-yellow-50",
      [TaskStatusEnum.DONE]: "bg-green-50",
    };
    return colors[status] || "bg-gray-50";
  };

  const getColumnTitle = (status) => {
    const titles = {
      [TaskStatusEnum.TODO]: "To Do",
      [TaskStatusEnum.IN_PROGRESS]: "In Progress",
      [TaskStatusEnum.DONE]: "Done",
    };
    return titles[status] || status;
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);

    const { destination, source } = result;

    // Return if dropped outside or in the same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Update columns state
    setColumns((prevColumns) => {
      const sourceColumn = [...prevColumns[source.droppableId]];
      const destColumn = [...prevColumns[destination.droppableId]];

      // Get the task and update its status
      const [movedTask] = sourceColumn.splice(source.index, 1);
      const updatedTask = { ...movedTask, status: destination.droppableId };

      // Insert task at new position
      destColumn.splice(destination.index, 0, updatedTask);

      return {
        ...prevColumns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      };
    });

    // Call parent's onDragEnd to handle API update
    if (onDragEnd) {
      onDragEnd(result);
    }
  };

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(columns).map(([status, statusTasks]) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <Card
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`
                    min-h-[70vh] 
                    transition-all duration-200
                    ${getColumnColor(status)}
                    ${
                      snapshot.isDraggingOver
                        ? "border-blue-500 border-2 shadow-lg"
                        : "border"
                    }
                  `}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {getColumnTitle(status)} ({statusTasks.length})
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {statusTasks.map((task, index) => (
                      <Draggable
                        key={`task-${task._id}`}
                        draggableId={`task-${task._id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              if (!isDragging && onTaskClick) {
                                onTaskClick(task._id);
                              }
                            }}
                            className={`
                              transition-all duration-200
                              ${
                                snapshot.isDragging
                                  ? "opacity-80 scale-[1.02]"
                                  : "opacity-100"
                              }
                            `}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                          >
                            <TaskCard
                              task={task}
                              projectId={projectId}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {statusTasks.length === 0 && (
                      <div className="text-center text-muted-foreground mt-8">
                        No tasks in this column
                      </div>
                    )}
                    {provided.placeholder}
                  </CardContent>
                </Card>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
