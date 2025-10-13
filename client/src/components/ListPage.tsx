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
import { Task } from "@/utils/mapperUtil";
import TaskDetailDrawer from "./TaskDetailDrawer";
import { useParams } from "next/dist/client/components/navigation";
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
interface ListPageProps {
  tasksNormal: BasicTask[];
  projectId: number | string;
}
export default function ListPage({ tasksNormal, projectId }: ListPageProps) {
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
    handleColumnDragStart,
    handleColumnDragOver,
    handleColumnDrop,
    addTask,
    copySelectedTasks,
    deleteSelectedTasks,
  } = useTaskTable(tasksNormal);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { project_name } = useParams();
  const projectId1 = Number(project_name);

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
            projectId={Number(projectId)}
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
            handleColumnDragStart={handleColumnDragStart}
            handleColumnDragOver={handleColumnDragOver}
            handleColumnDrop={handleColumnDrop}
            setEditingCell={setEditingCell}
            availableUsers={availableUsers}
            copySelectedTasks={copySelectedTasks}
            deleteSelectedTasks={deleteSelectedTasks}
            onTaskClick={setSelectedTask}
          />
          {/* Drawer hiển thị chi tiết */}
          <TaskDetailDrawer
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        </div>
      </div>

      {/* Footer cố định */}
      <div className="border-t p-4 shrink-0 bg-white">
        {isCreating ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter task summary..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // chặn xuống dòng
                  if (!newTaskTitle.trim()) return;
                  try {
                    const projectId = projectId1; // 👈 tuỳ props/state
                    const res = await axios.post(`/tasks/view/${projectId}`, {
                      title: newTaskTitle,
                      status: "To Do",
                    });
                    const createdTask = mapApiTaskToTask(res.data);
                    addTask(createdTask);
                    setNewTaskTitle("");
                    setIsCreating(false);
                  } catch (err) {
                    console.error("Error creating task:", err);
                  }
                }
              }}
              className="w-64"
            />
            <Button
              onClick={async () => {
                if (!newTaskTitle.trim()) return;
                try {
                  const projectId = projectId1; // 👈 tuỳ props/state
                  console.log("title", newTaskTitle);
                  const res = await axios.post(`/tasks/view/${projectId}`, {
                    title: newTaskTitle,
                    status: "To Do",
                  });
                  const createdTask = mapApiTaskToTask(res.data);
                  addTask(createdTask);
                  setNewTaskTitle("");
                  setIsCreating(false);
                } catch (err) {
                  console.error("Error creating task:", err);
                }
              }}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreating(false);
                setNewTaskTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>
        )}
      </div>
    </div>
  );
}
