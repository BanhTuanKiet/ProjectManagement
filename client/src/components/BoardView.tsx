"use client";

import { useState, useEffect } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import axios from "@/config/axiosConfig";
import SortableTaskCard from "@/components/SortableTaskCard";
import { useParams } from "next/navigation"
import { BasicTask } from "@/utils/ITask";
import { taskStatus, getBorderColor } from "@/utils/statusUtils";
import TaskDetailDrawer from "./TaskDetailDrawer";
import CreateTaskDialog from "@/components/CreateTaskDialog";

export default function BoardView({ tasks }: { tasks: BasicTask[] }) {
  const [features, setFeatures] = useState<BasicTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<BasicTask | null>(null);
  const [seeMore, setSeeMore] = useState<Record<string, boolean>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const { project_name } = useParams()
  const projectId = Number(project_name)

  useEffect(() => {
    if (tasks) setFeatures(tasks);
  }, [tasks]);

  // Gọi API update
  const updateTask = async (taskId: number, newStatus: string) => {
    try {
      await axios.put(`/tasks/${projectId}/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error(error);
    }
  };

  // Drag & Drop handler
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = Number(active.id);
    let newStatus = "";

    setFeatures((prev) => {
      const oldIndex = prev.findIndex((t) => t.taskId.toString() === active.id);
      const overTask = prev.find((t) => t.taskId.toString() === over.id);

      if (overTask) {
        const newIndex = prev.findIndex((t) => t.taskId.toString() === over.id);
        if (prev[oldIndex].status === overTask.status) {
          return arrayMove(prev, oldIndex, newIndex);
        } else {
          newStatus = overTask.status;
          return prev.map((task) =>
            task.taskId.toString() === active.id
              ? { ...task, status: overTask.status }
              : task
          );
        }
      } else {
        // thả vào group column
        newStatus = over.id as string;
        return prev.map((task) =>
          task.taskId.toString() === active.id
            ? { ...task, status: newStatus }
            : task
        );
      }
    });

    if (newStatus) {
      await updateTask(activeTaskId, newStatus);
    }
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-5 gap-4 p-4 bg-dynamic">
        {taskStatus.map((status) => {
          const columnTasks = features.filter((t) => t.status === status.name);
          const visibleTasks =
            seeMore[status.name] || columnTasks.length <= 5
              ? columnTasks
              : columnTasks.slice(0, 5);

          return (
            <div
              key={status.id}
              className="bg-gray-50 rounded-xl p-3 shadow-md flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold" style={{ color: status.color }}>
                  {status.name}
                </h2>
                {columnTasks.length > 0 && (
                  <span className="bg-gray-200 text-xs px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                )}
              </div>

              {/* Danh sách task */}
              <SortableContext
                id={status.name}
                items={visibleTasks.map((t) => t.taskId.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {visibleTasks.map((task) => (
                    <SortableTaskCard
                      key={task.taskId}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}

                </div>
              </SortableContext>

              {/* See more */}
              {columnTasks.length > 5 && !seeMore[status.name] && (
                <button
                  className="text-blue-500 text-sm mt-2"
                  onClick={() =>
                    setSeeMore((prev) => ({ ...prev, [status.name]: true }))
                  }
                >
                  See more
                </button>
              )}

              {/* Nút tạo task */}
              <div className="mt-2 flex justify-between">
                <button
                  onClick={() => setOpenDialog(true)}
                  className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Create
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer chi tiết */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Dialog tạo task */}
      <CreateTaskDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </DndContext>
  );
}


// "use client";

// import { BasicTask } from "@/utils/ITask";
// import { taskStatus, getBorderColor } from "@/utils/statusUtils";
// import { Plus, MoreHorizontal } from "lucide-react";
// import { useState } from "react";
// import TaskDetailDrawer from "./TaskDetailDrawer";
// import { Task } from "@/utils/mapperUtil";

// export default function BoardView({ tasks }: { tasks: BasicTask[] }) {
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

//   return (
//     <div className="grid grid-cols-5 gap-4 p-4 bg-dynamic">
//       {taskStatus.map((status) => {
//         // Lọc task theo status (Todo, In Progress, Done,...)
//         const columnTasks = tasks.filter((t) => t.status === status.name);

//         return (
//           <div key={status.id} className="bg-gray-50 rounded-xl p-3 shadow-md hover:">
//             {/* Header cột */}
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="font-semibold" style={{ color: status.color }}>
//                 {status.name}
//               </h2>
//               {columnTasks.length > 0 && (
//                 <span className="bg-gray-200 text-xs px-2 py-1 rounded-full">
//                   {columnTasks.length}
//                 </span>
//               )}
//             </div>

//             {/* Danh sách task */}
//             <div className="space-y-2">
//               {columnTasks.map((task) => (
//                 <div
//                   key={task.taskId}
//                   className={`bg-white rounded-lg p-3 shadow ${getBorderColor(
//                     task.status
//                   )}`}
//                 >
//                   <p className="font-medium">{task.title}</p>
//                   <div className="text-xs text-gray-500 flex flex-col mt-1">
//                     <span>
//                       📅{" "}
//                       {task.deadline
//                         ? new Date(task.deadline).toDateString()
//                         : "No deadline"}
//                     </span>
//                     <span>🔖 PROJ-{task.projectId}</span>
//                     <span>👤 {task.assignee || "Unassigned"}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-2">
//               <button className="text-left w-full text-white py-2 rounded-md hover:bg-blue-600 transition-colors pl-2">
//                 <Plus className="inline-block mr-1 size-4" /> Create
//               </button>
//               <button className="p-1 hover:bg-gray-100 rounded">
//                 <MoreHorizontal className="w-4 h-4 text-gray-500" />
//               </button>
//             </div>
//           </div>
//         );
//       })}
//       {selectedTask && (
//         <TaskDetailDrawer
//           task={selectedTask}
//           onClose={() => setSelectedTask(null)}
//         />
//       )}
//     </div>
//   );
// }
