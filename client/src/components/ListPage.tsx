"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TableWrapper from "./TableWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/axiosConfig";
import { UserMini } from "@/utils/IUser";
import { mapApiTaskToTask, mapApiUserToUserMini } from "@/utils/mapperUtil";
import {
  Search,
  ChevronDown,
  MoreHorizontal,
  Settings,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BasicTask } from "@/utils/ITask";
import { initialColumns, Column } from "@/config/columsConfig";
import { useTaskTable } from "@/hooks/useResizableColumns";
// interface Task {
//   id: string;
//   key: string;
//   summary: string;
//   status: "To Do" | "Done" | "In Progress";
//   assignee?: { name: string; avatar: string; initials: string };
//   dueDate?: string;
//   type: "Task";
//   [key: string]: any;
// }

// interface Column {
//   key: string;
//   title: string;
//   width: number;
//   minWidth: number;
//   resizable: boolean;
// }

// const initialColumns: Column[] = [
//   { key: "select", title: "", width: 65, minWidth: 65, resizable: false },
//   { key: "type", title: "Type", width: 110, minWidth: 80, resizable: true },
//   { key: "key", title: "Key", width: 120, minWidth: 80, resizable: true },
//   {
//     key: "summary",
//     title: "Summary",
//     width: 400,
//     minWidth: 200,
//     resizable: true,
//   },
//   {
//     key: "status",
//     title: "Status",
//     width: 120,
//     minWidth: 100,
//     resizable: true,
//   },
//   {
//     key: "assignee",
//     title: "Assignee",
//     width: 180,
//     minWidth: 120,
//     resizable: true,
//   },
//   {
//     key: "dueDate",
//     title: "Due date",
//     width: 145,
//     minWidth: 120,
//     resizable: true,
//   },
//   {
//     key: "priority",
//     title: "Priority",
//     width: 120,
//     minWidth: 100,
//     resizable: true,
//   },
//   {
//     key: "comments",
//     title: "Comments",
//     width: 145,
//     minWidth: 120,
//     resizable: true,
//   },
//   {
//     key: "labels",
//     title: "Labels",
//     width: 170,
//     minWidth: 120,
//     resizable: true,
//   },
//   {
//     key: "created",
//     title: "Created",
//     width: 145,
//     minWidth: 120,
//     resizable: true,
//   },
//   {
//     key: "updated",
//     title: "Updated",
//     width: 145,
//     minWidth: 120,
//     resizable: true,
//   },
//   {
//     key: "reporter",
//     title: "Reporter",
//     width: 180,
//     minWidth: 120,
//     resizable: true,
//   },
//   { key: "team", title: "Team", width: 160, minWidth: 120, resizable: true },
// ];

export default function ListPage({ tasksNormal, }: { tasksNormal: BasicTask[]; }) {
  // const [tasks, setTasks] = useState<Task[]>([]);
  // const [availableUsers, setAvailableUsers] = useState<UserMini[]>([]);
  // const [columns, setColumns] = useState<Column[]>(initialColumns);
  // const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  // const [searchQuery, setSearchQuery] = useState("");
  // const [editingCell, setEditingCell] = useState<{
  //   taskId: string;
  //   field: string;
  // } | null>(null);
  // const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Kết hợp fetch tasks và users
  // để tránh gọi API nhiều lần
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await axios.get("/users");
  //       console.log("Fetched users:", response.data);

  //       const mappedUsers = response.data.map(mapApiUserToUserMini);
  //       const mappedTasks = tasksnomal.map(mapApiTaskToTask);

  //       setTasks(mappedTasks);
  //       setAvailableUsers(mappedUsers);
  //     } catch (error) {
  //       console.log("Error fetching users:", error);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  // // ... giữ nguyên code resize, drag, edit, filter ...
  // const resizingColumn = useRef<{
  //   index: number;
  //   startX: number;
  //   startWidth: number;
  // } | null>(null);

  // // Resize cột
  // const handleMouseDown = useCallback(
  //   (e: React.MouseEvent, columnIndex: number) => {
  //     e.preventDefault();
  //     const startX = e.clientX;
  //     const startWidth = columns[columnIndex].width;

  //     resizingColumn.current = { index: columnIndex, startX, startWidth };

  //     const handleMouseMove = (e: MouseEvent) => {
  //       if (!resizingColumn.current) return;
  //       const { index, startX, startWidth } = resizingColumn.current;
  //       const deltaX = e.clientX - startX;
  //       const newWidth = Math.max(columns[index].minWidth, startWidth + deltaX);

  //       setColumns((prev) =>
  //         prev.map((col, i) =>
  //           i === index ? { ...col, width: newWidth } : col
  //         )
  //       );
  //     };

  //     const handleMouseUp = () => {
  //       resizingColumn.current = null;
  //       document.removeEventListener("mousemove", handleMouseMove);
  //       document.removeEventListener("mouseup", handleMouseUp);
  //     };

  //     document.addEventListener("mousemove", handleMouseMove);
  //     document.addEventListener("mouseup", handleMouseUp);
  //   },
  //   [columns]
  // );

  // // Chọn task
  // const toggleTaskSelection = (taskId: string) => {
  //   setSelectedTasks((prev) => {
  //     const newSet = new Set(prev);
  //     if (newSet.has(taskId)) newSet.delete(taskId);
  //     else newSet.add(taskId);
  //     return newSet;
  //   });
  // };

  // const toggleAllTasks = () => {
  //   if (selectedTasks.size === tasks.length) {
  //     setSelectedTasks(new Set());
  //   } else {
  //     setSelectedTasks(new Set(tasks.map((t) => t.id)));
  //   }
  // };

  // // Edit trực tiếp
  // const handleCellEdit = (taskId: string, field: string, value: string) => {
  //   setTasks((prev) =>
  //     prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
  //   );
  //   setEditingCell(null);
  // };

  // // Kéo thả reorder
  // const handleDragStart = (e: React.DragEvent, taskId: string) => {
  //   setDraggedTask(taskId);
  //   e.dataTransfer.effectAllowed = "move";
  // };
  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.dataTransfer.dropEffect = "move";
  // };
  // const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
  //   e.preventDefault();
  //   if (!draggedTask || draggedTask === targetTaskId) return;
  //   const draggedIndex = tasks.findIndex((t) => t.id === draggedTask);
  //   const targetIndex = tasks.findIndex((t) => t.id === targetTaskId);

  //   const newTasks = [...tasks];
  //   const [draggedItem] = newTasks.splice(draggedIndex, 1);
  //   newTasks.splice(targetIndex, 0, draggedItem);

  //   setTasks(newTasks);
  //   setDraggedTask(null);
  // };

  // // Filter
  // const filteredTasks = tasks.filter((t) => {
  //   const summary = t.summary?.toLowerCase() || "";
  //   const key = t.key?.toLowerCase() || "";
  //   return (
  //     summary.includes(searchQuery.toLowerCase()) ||
  //     key.includes(searchQuery.toLowerCase())
  //   );
  // });

  // const totalWidth = columns.reduce((s, c) => s + c.width, 0);
  const {
    tasks,
    availableUsers,
    columns,
    selectedTasks,
    searchQuery,
    editingCell,
    filteredTasks,
    totalWidth,
    setSearchQuery,
    setEditingCell,
    handleMouseDown,
    toggleAllTasks,
    toggleTaskSelection,
    handleCellEdit,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useTaskTable(tasksNormal);
  return (
    <div className="flex flex-col h-full overflow-hidden max-w-7xl mx-auto w-full">
      {/* Header cố định */}
      <div className="flex items-center justify-between p-4 border-b shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search list"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>

          <Avatar className="h-8 w-8">
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback>TB</AvatarFallback>
          </Avatar>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                Filter <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Assigned to me</DropdownMenuItem>
              <DropdownMenuItem>Due this week</DropdownMenuItem>
              <DropdownMenuItem>Done items</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                Group <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Assignee</DropdownMenuItem>
              <DropdownMenuItem>Priority</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <TableWrapper
            tasks={filteredTasks}
            columns={columns}
            totalWidth={totalWidth}
            selectedTasks={selectedTasks}
            editingCell={editingCell}
            handleMouseDown={handleMouseDown}
            toggleAllTasks={toggleAllTasks}
            toggleTaskSelection={toggleTaskSelection}
            handleCellEdit={handleCellEdit}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            setEditingCell={setEditingCell}
            availableUsers={availableUsers}
          />
        </div>
      </div>

      {/* Footer cố định */}
      <div className="border-t p-4 shrink-0 bg-white">
        <Button variant="ghost" className="gap-2">
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>
    </div>
  );
}
