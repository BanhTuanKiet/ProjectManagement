// "use client";
// import { useState } from "react";
// import {
//   DndContext,
//   closestCorners,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragOverlay,
// } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Column, Task } from "@/types";
// import { initialColumns } from "@/data";

// function TaskCard({ task }: { task: Task }) {
//   return (
//     <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
//       <p className="text-sm font-medium">{task.title}</p>
//       {task.dueDate && (
//         <p className="text-xs text-orange-600 mt-1">📅 {task.dueDate}</p>
//       )}
//       <p className="text-xs text-blue-600 mt-1">{task.project}</p>
//       {task.assignee && (
//         <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs mt-2">
//           {task.assignee}
//         </span>
//       )}
//     </div>
//   );
// }

// function SortableTask({ task }: { task: Task }) {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: task.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       <TaskCard task={task} />
//     </div>
//   );
// }

// export default function BoardPage() {
//   const [columns, setColumns] = useState<Column[]>(initialColumns);
//   const [activeTask, setActiveTask] = useState<Task | null>(null);

//   const sensors = useSensors(useSensor(PointerSensor));

//   // Tìm column chứa task theo id
//   const findColumnByTaskId = (taskId: string) => {
//     return columns.find((col) => col.tasks.some((t) => t.id === taskId));
//   };

//   const handleDragStart = (event: any) => {
//     const { active } = event;
//     const column = findColumnByTaskId(active.id);
//     const task = column?.tasks.find((t) => t.id === active.id) || null;
//     setActiveTask(task);
//   };

//   const handleDragOver = (event: any) => {
//     const { active, over } = event;
//     if (!over) return;

//     const sourceCol = findColumnByTaskId(active.id);
//     const destCol = findColumnByTaskId(over.id);

//     if (!sourceCol || !destCol || sourceCol.id === destCol.id) return;

//     setColumns((prev) => {
//       const sourceTasks = [...sourceCol.tasks];
//       const taskIndex = sourceTasks.findIndex((t) => t.id === active.id);
//       const [movedTask] = sourceTasks.splice(taskIndex, 1);

//       const destTasks = [...destCol.tasks, movedTask];

//       return prev.map((col) => {
//         if (col.id === sourceCol.id) return { ...col, tasks: sourceTasks };
//         if (col.id === destCol.id) return { ...col, tasks: destTasks };
//         return col;
//       });
//     });
//   };

//   const handleDragEnd = () => {
//     setActiveTask(null);
//   };

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCorners}
//       onDragStart={handleDragStart}
//       onDragOver={handleDragOver}
//       onDragEnd={handleDragEnd}
//     >
//       <div className="flex gap-4 p-4 overflow-x-auto">
//         {columns.map((col) => (
//           <div
//             key={col.id}
//             className="w-72 flex-shrink-0 bg-gray-50 rounded-xl shadow-sm p-3"
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-sm font-semibold">{col.title}</h2>
//               {col.tasks.length > 0 && (
//                 <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
//                   {col.tasks.length}
//                 </span>
//               )}
//             </div>

//             {/* Tasks */}
//             <SortableContext items={col.tasks.map((t) => t.id)}>
//               <div className="flex flex-col gap-3">
//                 {col.tasks.map((task) => (
//                   <SortableTask key={task.id} task={task} />
//                 ))}
//               </div>
//             </SortableContext>
//           </div>
//         ))}
//       </div>

//       <DragOverlay>
//         {activeTask ? <TaskCard task={activeTask} /> : null}
//       </DragOverlay>
//     </DndContext>
//   );
// }

"use client";

import { BasicTask } from "@/utils/ITask";
import { taskStatus, getBorderColor } from "@/utils/statusUtils";
import { Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import TaskDetailDrawer from "./TaskDetailDrawer";
import { Task } from "@/utils/mapperUtil";

export default function BoardView({ tasks }: { tasks: BasicTask[] }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {taskStatus.map((status) => {
        // Lọc task theo status (Todo, In Progress, Done,...)
        const columnTasks = tasks.filter((t) => t.status === status.name);

        return (
          <div key={status.id} className="bg-gray-50 rounded-xl p-3 shadow-md hover:">
            {/* Header cột */}
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
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <div
                  key={task.taskId}
                  className={`bg-white rounded-lg p-3 shadow ${getBorderColor(
                    task.status
                  )}`}
                >
                  <p className="font-medium">{task.title}</p>
                  <div className="text-xs text-gray-500 flex flex-col mt-1">
                    <span>
                      📅{" "}
                      {task.deadline
                        ? new Date(task.deadline).toDateString()
                        : "No deadline"}
                    </span>
                    <span>🔖 PROJ-{task.projectId}</span>
                    <span>👤 {task.assignee || "Unassigned"}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <button className="text-left w-full text-white py-2 rounded-md hover:bg-blue-600 transition-colors pl-2">
                <Plus className="inline-block mr-1 size-4" /> Create
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        );
      })}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
