// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import type { Task, Column } from "./ListPage";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// import { GripVertical, Plus, ChevronDown, Calendar } from "lucide-react";

// interface TaskTableProps {
//   columns: Column[];
//   tasks: Task[];
//   filteredTasks: Task[];
//   totalWidth: number;
//   selectedTasks: Set<string>;
//   toggleAllTasks: () => void;
//   toggleTaskSelection: (id: string) => void; // 👈 chỉ string thôi
//   handleMouseDown: (e: React.MouseEvent, columnIndex: number) => void;
//   handleDragStart: (e: React.DragEvent, id: string) => void; // 👈 sửa lại string
//   handleDragOver: (e: React.DragEvent) => void;
//   handleDrop: (e: React.DragEvent, id: string) => void; // 👈 sửa lại string
//   editingCell: { taskId: string; field: string } | null;
//   setEditingCell: (cell: { taskId: string; field: string } | null) => void;
//   handleCellEdit: (taskId: string, field: string, value: string) => void;
// }

// export function TaskTable({
//   columns,
//   tasks,
//   filteredTasks,
//   totalWidth,
//   selectedTasks,
//   toggleAllTasks,
//   toggleTaskSelection,
//   handleMouseDown,
//   handleDragStart,
//   handleDragOver,
//   handleDrop,
//   editingCell,
//   setEditingCell,
//   handleCellEdit,
// }: TaskTableProps) {
//   return (
//     <div className="flex-1 overflow-auto">
//       <div className="flex flex-col min-w-max">
//         {/* Header Row */}
//         <div
//           className="sticky top-0 bg-gray-50 border-b z-10 flex"
//           style={{ width: totalWidth }}
//         >
//           {columns.map((col, i) => (
//             <div
//               key={col.key}
//               className="relative flex items-center px-3 py-2 border-r text-sm font-medium text-gray-700"
//               style={{ width: col.width, minWidth: col.minWidth }}
//             >
//               {col.key === "select" ? (
//                 <Checkbox
//                   checked={
//                     selectedTasks.size === tasks.length && tasks.length > 0
//                   }
//                   onCheckedChange={toggleAllTasks}
//                 />
//               ) : (
//                 <span>{col.title}</span>
//               )}
//               {col.resizable && (
//                 <div
//                   className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
//                   onMouseDown={(e) => handleMouseDown(e, i)}
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Body Rows */}
//         {filteredTasks.map((task) => (
//           <div
//             key={task.id}
//             className={`flex border-b hover:bg-gray-50 ${
//               selectedTasks.has(task.id) ? "bg-blue-50" : ""
//             }`}
//             style={{ width: totalWidth }}
//             draggable
//             onDragStart={(e) => handleDragStart(e, task.id)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, task.id)}
//           >
//             {columns.map((col) => (
//               <div
//                 key={`${task.id}-${col.key}`}
//                 className="relative flex items-center px-3 py-2 border-r text-sm"
//                 style={{ width: col.width, minWidth: col.minWidth }}
//               >
//                 {/* Checkbox + drag handle */}
//                 {col.key === "select" && (
//                   <div className="flex items-center gap-2">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-6 w-6 cursor-grab"
//                     >
//                       <GripVertical className="h-4 w-4" />
//                     </Button>
//                     <Checkbox
//                       checked={selectedTasks.has(task.id)}
//                       onCheckedChange={() => toggleTaskSelection(task.id)}
//                     />
//                   </div>
//                 )}

//                 {/* Type */}
//                 {col.key === "type" && (
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="h-6 w-6">
//                         <Plus className="h-3 w-3" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent>
//                       <DropdownMenuItem>Task</DropdownMenuItem>
//                       <DropdownMenuItem>Bug</DropdownMenuItem>
//                       <DropdownMenuItem>Story</DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 )}

//                 {/* Key */}
//                 {col.key === "key" && (
//                   <a
//                     href={`/browse/${task.key}`}
//                     className="text-blue-600 hover:underline"
//                   >
//                     {task.key}
//                   </a>
//                 )}

//                 {/* Summary */}
//                 {col.key === "summary" &&
//                   (editingCell?.taskId === task.id &&
//                   editingCell?.field === "summary" ? (
//                     <Input
//                       defaultValue={task.summary}
//                       onBlur={(e) =>
//                         handleCellEdit(task.id, "summary", e.target.value)
//                       }
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter")
//                           handleCellEdit(
//                             task.id,
//                             "summary",
//                             e.currentTarget.value
//                           );
//                         if (e.key === "Escape") setEditingCell(null);
//                       }}
//                       autoFocus
//                       className="h-6 text-sm"
//                     />
//                   ) : (
//                     <span
//                       onClick={() =>
//                         setEditingCell({ taskId: task.id, field: "summary" })
//                       }
//                       className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
//                     >
//                       {task.summary}
//                     </span>
//                   ))}

//                 {/* Status */}
//                 {col.key === "status" && (
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="w-full justify-between"
//                       >
//                         {task.status}
//                         <ChevronDown className="h-4 w-4 ml-2" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent>
//                       <DropdownMenuItem
//                         onClick={() =>
//                           handleCellEdit(task.id, "status", "To Do")
//                         }
//                       >
//                         <Badge className="bg-gray-100 text-gray-800">
//                           TO DO
//                         </Badge>
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         onClick={() =>
//                           handleCellEdit(task.id, "status", "In Progress")
//                         }
//                       >
//                         <Badge className="bg-blue-100 text-blue-800">
//                           IN PROGRESS
//                         </Badge>
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         onClick={() =>
//                           handleCellEdit(task.id, "status", "Done")
//                         }
//                       >
//                         <Badge className="bg-green-100 text-green-800">
//                           DONE
//                         </Badge>
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 )}

//                 {/* Assignee */}
//                 {col.key === "assignee" && (
//                   <div className="flex items-center gap-2">
//                     {task.assignee ? (
//                       <>
//                         <Avatar className="h-6 w-6">
//                           <AvatarImage
//                             src={task.assignee.avatar || "/placeholder.svg"}
//                           />
//                           <AvatarFallback className="text-xs">
//                             {task.assignee.initials}
//                           </AvatarFallback>
//                         </Avatar>
//                         <span className="text-sm">{task.assignee.name}</span>
//                       </>
//                     ) : (
//                       <Button variant="ghost" size="sm">
//                         Assign
//                       </Button>
//                     )}
//                   </div>
//                 )}

//                 {/* Due Date */}
//                 {col.key === "dueDate" && (
//                   <Input
//                     type="date"
//                     defaultValue={
//                       task.dueDate
//                         ? new Date(task.dueDate).toISOString().split("T")[0]
//                         : ""
//                     }
//                     onChange={(e) =>
//                       handleCellEdit(task.id, "dueDate", e.target.value)
//                     }
//                     className="h-6 text-sm"
//                   />
//                 )}

//                 {/* Default editable */}
//                 {![
//                   "select",
//                   "type",
//                   "key",
//                   "summary",
//                   "status",
//                   "assignee",
//                   "dueDate",
//                 ].includes(col.key) &&
//                   (editingCell?.taskId === task.id &&
//                   editingCell?.field === col.key ? (
//                     <Input
//                       defaultValue={(task as any)[col.key] || ""}
//                       onBlur={(e) =>
//                         handleCellEdit(task.id, col.key, e.target.value)
//                       }
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter")
//                           handleCellEdit(
//                             task.id,
//                             col.key,
//                             e.currentTarget.value
//                           );
//                         if (e.key === "Escape") setEditingCell(null);
//                       }}
//                       autoFocus
//                       className="h-6 text-sm"
//                     />
//                   ) : (
//                     <span
//                       onClick={() =>
//                         setEditingCell({ taskId: task.id, field: col.key })
//                       }
//                       className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded text-gray-600"
//                     >
//                       {(task as any)[col.key] || "-"}
//                     </span>
//                   ))}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
