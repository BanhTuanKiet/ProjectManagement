"use client";

import { useMemo, useState } from "react";
import TableWrapper from "./TableWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, MoreHorizontal, Settings, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BasicTask } from "@/utils/ITask";
import { Task } from "@/utils/mapperUtil";
import { useTaskTable } from "@/hooks/useResizableColumns";
import TaskDetailDrawer from "./TaskDetailDrawer";
import { useParams } from "next/dist/client/components/navigation";
import axios from "@/config/axiosConfig";
import { mapApiTaskToTask } from "@/utils/mapperUtil";
import ColoredAvatar from "./ColoredAvatar";
import { getTaskStatusBadge, getPriorityBadge, getPriorityIcon, taskStatus } from "@/utils/statusUtils";

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
    filters,
    setFilters,
    setSearchQuery,
    editingCell,
    totalWidth,
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
  const stableFilters = useMemo(() => filters, [filters.Status, filters.Priority, filters.AssigneeId]);
  // const projectId = Number(project_name);

  return (
    <div className="flex flex-col h-full overflow-hidden max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0 bg-white">
        <div className="flex items-center gap-4">
          {/* Ô tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>

          <Avatar className="h-8 w-8">
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback>TB</AvatarFallback>
          </Avatar>

          {/* --- Bộ lọc theo Status --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                {filters.Status ? (
                  <span className={`flex items-center gap-2 ${getTaskStatusBadge(filters.Status)}`}>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          taskStatus.find((s) => s.name === filters.Status)?.color,
                      }}
                    />
                    {filters.Status}
                  </span>
                ) : (
                  "Status"
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {taskStatus.map((status) => (
                <DropdownMenuItem
                  key={status.id}
                  onClick={() => setFilters((prev) => ({ ...prev, Status: status.name }))}
                >
                  <div className={`flex items-center gap-2 ${getTaskStatusBadge(status.name)}`}>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span>{status.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* --- Bộ lọc theo Priority --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                {filters.Priority ? (
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(filters.Priority)}
                    <span className={getPriorityBadge(filters.Priority.toLowerCase())}>
                      {filters.Priority}
                    </span>
                  </div>
                ) : (
                  "Priority"
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["High", "Medium", "Low"].map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => setFilters((prev) => ({ ...prev, Priority: priority }))}
                >
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(priority)}
                    <span className={getPriorityBadge(priority.toLowerCase())}>
                      {priority}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* --- Bộ lọc theo Assignee --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                {filters.AssigneeId ? (
                  <>
                    {filters.AssigneeId === "me" ? (
                      "Assigned to me"
                    ) : filters.AssigneeId === "null" ? (
                      "Unassigned"
                    ) : (
                      availableUsers.find((u) => u.userId === filters.AssigneeId)?.name || "Assignee"
                    )}
                  </>
                ) : (
                  "Assignee"
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              <DropdownMenuLabel>Assignee</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setFilters((prev) => ({ ...prev, AssigneeId: "me" }))}>
                Assigned to me
              </DropdownMenuItem>

              {availableUsers?.length > 0 ? (
                availableUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.userId}
                    onClick={() => setFilters((prev) => ({ ...prev, AssigneeId: user.userId }))}
                  >
                    <ColoredAvatar id={user.userId} name={user.name} size="sm" />
                    <span className="text-sm">{user.name}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No available users</DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setFilters((prev) => ({ ...prev, AssigneeId: "null" }))}>
                Unassigned
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          {/* --- Nút clear filter --- */}
          <Button
            variant="outline"
            className="text-red-500 border-red-300 hover:bg-red-50"
            onClick={() => {
              setFilters({});
            }}
          >
            Clear Filter
          </Button>
        </div>

        {/* Các nút bên phải */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>


      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <TableWrapper
            tasks={tasks}
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

          <TaskDetailDrawer
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        </div>
      </div>

      {/* Footer tạo task */}
      <div className="border-t p-4 shrink-0 bg-white">
        {isCreating ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter task summary..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && newTaskTitle.trim()) {
                  try {
                    const res = await axios.post(`/tasks/view/${projectId}`, {
                      title: newTaskTitle,
                      status: "To Do",
                    });
                    addTask(mapApiTaskToTask(res.data));
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
                  const res = await axios.post(`/tasks/view/${projectId}`, {
                    title: newTaskTitle,
                    status: "To Do",
                  });
                  addTask(mapApiTaskToTask(res.data));
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
