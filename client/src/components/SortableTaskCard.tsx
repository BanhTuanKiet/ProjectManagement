"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BasicTask } from "@/utils/ITask";
import { getBorderColor } from "@/utils/statusUtils";

interface SortableTaskCardProps {
  task: BasicTask;
  onClick: () => void;
}

export default function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.taskId.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow ${getBorderColor(task.status)}`}
    >
      <p className="font-medium">{task.title}</p>
      <div className="text-xs text-gray-500 flex flex-col mt-1">
        <span>
          📅 {task.deadline ? new Date(task.deadline).toDateString() : "No deadline"}
        </span>
        <span>🔖 PROJ-{task.projectId}</span>
        <span>👤 {task.assignee || "Unassigned"}</span>
      </div>
    </div>
  );
}
