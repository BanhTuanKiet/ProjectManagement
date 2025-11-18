"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import {
  DndContext,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import axios from "@/config/axiosConfig";
import SortableTaskCard from "@/components/SortableTaskCard";
import { useParams } from "next/navigation";
import { BasicTask } from "@/utils/ITask";
import { taskStatus } from "@/utils/statusUtils";
import TaskDetailDrawer from "@/components/TaskDetailModal";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import { Input } from "@/components/ui/input";
import { useTask } from "@/app/(context)/TaskContext"

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 flex-1 overflow-y-auto min-h-[100px] rounded-md p-1 transition ${isOver ? "bg-blue-100" : ""
        }`}
    >
      {children}
    </div>
  );
}

export default function BoardView() {
  const [features, setFeatures] = useState<BasicTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [seeMore, setSeeMore] = useState<Record<string, boolean>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { project_name } = useParams();
  const projectId = Number(project_name);
  const { tasks } = useTask();

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setFeatures([...tasks])
    }
  }, [tasks])

  const updateTask = async (taskId: number, newStatus: string) => {
    try {
      await axios.put(`/tasks/${projectId}/${taskId}`, { status: newStatus });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await axios.delete(`/tasks/bulk-delete/`, {
        data: {
          ProjectId: projectId,
          Ids: [taskId],
        }
      });
      setFeatures((prev) => prev.filter((t) => t.taskId !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = Number(active.id);
    let newStatus = "";
    let oldStatus = "";

    if (!over.id || typeof over.id !== "string") return;

    setFeatures((prev) => {
      const oldIndex = prev.findIndex((t) => t.taskId === activeTaskId);
      const overTask = prev.find((t) => t.taskId.toString() === over.id);

      if (!overTask) {
        // Kéo sang cột trống (chỉ đổi status)
        newStatus = over.id as string;
        oldStatus = prev[oldIndex].status;

        const validStatuses = ["Todo", "Doing", "Done", "Cancel"];
        if (!validStatuses.includes(newStatus)) return prev;

        return prev.map((task) =>
          task.taskId === activeTaskId ? { ...task, status: newStatus } : task
        );
      } else {
        // Kéo trong cùng cột hoặc sang cột khác
        const newIndex = prev.findIndex((t) => t.taskId.toString() === over.id);
        if (prev[oldIndex].status === overTask.status) {
          return arrayMove(prev, oldIndex, newIndex);
        } else {
          newStatus = overTask.status;
          oldStatus = prev[oldIndex].status;
          return prev.map((task) =>
            task.taskId === activeTaskId ? { ...task, status: newStatus } : task
          );
        }
      }
    });

    if (!newStatus) return;

    const success = await updateTask(activeTaskId, newStatus);

    // ❗ Nếu lỗi → khôi phục lại trạng thái cũ
    if (!success) {
      setFeatures((prev) =>
        prev.map((task) =>
          task.taskId === activeTaskId ? { ...task, status: oldStatus } : task
        )
      );
    }
  };

  const filteredTasks = features.filter((t) =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 bg-dynamic">
      <div id="searchTask" className="flex items-center mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search task..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-64"
        />
      </div>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div id="boardArea" className="grid grid-cols-5 gap-4">
          {taskStatus.map((status) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === status.name
            );
            const isSeeMore = seeMore[status.name];
            const visibleTasks =
              isSeeMore || columnTasks.length <= 5
                ? columnTasks
                : columnTasks.slice(0, 5);

            return (
              <div
                id={`column-${status.name}`}
                key={status.id}
                className="bg-gray-50 rounded-xl p-3 shadow-md flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold" style={{ color: status.color }}>
                    {status.name}
                  </h2>
                  <span className="bg-gray-200 text-xs px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <SortableContext
                  id={status.name}
                  items={visibleTasks.map((t) => t.taskId.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={status.name}>
                    {visibleTasks.length > 0 ? (
                      visibleTasks.map((task) => (
                        <div key={task.taskId} className="relative group">
                          <SortableTaskCard
                            task={task}
                            onClick={() => setSelectedTask(task.taskId)}
                          />
                          <button
                            onClick={() => deleteTask(task.taskId)}
                            className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition bg-white rounded-full shadow-sm"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 text-sm py-6">
                        Drop here
                      </p>
                    )}
                  </DroppableColumn>
                </SortableContext>

                {columnTasks.length > 5 && (
                  <div className="mt-2 text-sm text-blue-500">
                    {!isSeeMore ? (
                      <button
                        onClick={() =>
                          setSeeMore((prev) => ({ ...prev, [status.name]: true }))
                        }
                      >
                        See more
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setSeeMore((prev) => ({ ...prev, [status.name]: false }))
                        }
                      >
                        Close
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-2 flex justify-between">
                  <button
                    id={`create-${status.name}`}
                    onClick={() => setOpenDialog(true)}
                    className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" /> Create
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>

      {selectedTask && (
        <TaskDetailDrawer
          taskId={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      <CreateTaskDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </div>
  );
}
