"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BasicTask } from "@/utils/ITask";
import { getBorderColor } from "@/utils/statusUtils";
import { ClockAlert } from "lucide-react"
import ColoredAvatar from "./ColoredAvatar";

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

  const isOverdue = task.deadline
    ? new Date(task.deadline).getTime() < Date.now()
    : false;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow ${getBorderColor(task.status)}`}
    >
      <p className="font-medium pb-1">{task.title}</p>
      <div className="text-xs text-gray-500 flex flex-col mt-1">
        <span className="flex gap-2 pb-2">
          <ClockAlert className={`${isOverdue ? "text-red-600" : "text-blue-600"} size-5 pl-0.5`} />
          <p className="pt-1 font-normal">{task.deadline ? new Date(task.deadline).toDateString() : "No deadline"}</p>
        </span>
        {/* <span>🔖 PROJ-{task.projectId}</span> */}
        <span className="flex gap-1">
          <ColoredAvatar
            src={task.avatarUrl}
            id={task.assigneeId || ""}
            name={task.assignee}
            size="sm"
          />
          <p className="font-normal pt-1">{task.assignee || "Unassigned"} </p>
        </span>
      </div>
    </div>
  );
}
