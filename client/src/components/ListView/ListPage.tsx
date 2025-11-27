"use client";

import { useEffect, useMemo, useState } from "react";
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
import TaskDetailModal from "../TaskDetail/TaskDetailModal";
import axios from "@/config/axiosConfig";
import { mapApiTaskToTask } from "@/utils/mapperUtil";
import ColoredAvatar from "../ColoredAvatar";
import { useProject } from "@/app/(context)/ProjectContext";
import { getTaskStatusBadge, getPriorityBadge, taskStatus } from "@/utils/statusUtils";
import type { TaskAssignee } from "@/utils/IUser"

interface ListPageProps {
  tasksNormal: BasicTask[];
  projectId: number | string;
}

export default function ListPage({ tasksNormal, projectId }: ListPageProps) {
  const {
    tasks,
    // availableUsers, // Xóa cái này, không dùng user từ table để làm filter
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
  const { project_name, projectRole, availableUsers, setAvailableUsers } = useProject();
  const [openFromUrl, setOpenFromUrl] = useState<number | null>(null);

  useEffect(() => {
    const rawHash = decodeURIComponent(window.location.hash.replace("#", ""));
    const [tab, queryString] = rawHash.split("?");

    if (!queryString) return;

    const params = new URLSearchParams(queryString);
    const status = params.get("status");
    const taskId = params.get("tasks")

    if (taskId) setOpenFromUrl(Number(taskId));

    if (status) {
      setFilters((prev) => ({ ...prev, Status: status }));
    }

    const assignee = params.get("assignee");
    if (assignee) {
      if (projectRole === "Member") {
        setFilters((prev) => ({ ...prev, AssigneeId: "me" }));
      } else {
        setFilters((prev) => ({ ...prev, AssigneeId: assignee }));
      }
    }
  }, [projectRole, project_name, setFilters]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const res = await axios.post(`/tasks/view/${projectId}`, {
        title: newTaskTitle,
        status: "To Do",
      });
      console.log("Task created:", res.data);
      const rawTask = res.data.addedTask || res.data;
      const newTaskMapped = mapApiTaskToTask(rawTask);
      addTask(newTaskMapped);

      setNewTaskTitle("");
      setIsCreating(false);

    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // PM: Thấy tất cả members
  // Leader: Thấy tất cả members trong team
  // Member: Dropdown bị ẩn
  const dropdownUsers = availableUsers || [];

  return (
    <div className="flex flex-col h-full overflow-hidden mx-auto w-full">
      {openFromUrl && (
        <TaskDetailModal
          taskId={openFromUrl}
          onClose={() => setOpenFromUrl(null)}
        />
      )}

      {/* Header */}
      <div id="toolsList" className="flex items-center justify-between p-4 border-b shrink-0 bg-white">
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
                  <span className="text-muted-foreground font-normal">Status</span>
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
                    <span className={getPriorityBadge(filters.Priority.toLowerCase())}>
                      {filters.Priority}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground font-normal">Priority</span>
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
                    <span className={getPriorityBadge(priority.toLowerCase())}>
                      {priority}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* --- Bộ lọc Assignee (Chỉ hiện cho PM và Leader) --- */}
          {projectRole !== "Member" && (
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
                        // Tìm tên trong danh sách members thay vì availableUsers
                        dropdownUsers.find((u) => u.userId === filters.AssigneeId)?.name || "Assignee"
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground font-normal">Assignee</span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44 max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Assignee</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setFilters((prev) => ({ ...prev, AssigneeId: "me" }))}>
                  Assigned to me
                </DropdownMenuItem>

                {/* Sử dụng dropdownUsers (lấy từ Context) thay vì users từ table */}
                {dropdownUsers.length > 0 ? (
                  dropdownUsers.map((availableUsers) => (
                    <DropdownMenuItem
                      key={availableUsers.userId}
                      onClick={() => setFilters((prev) => ({ ...prev, AssigneeId: availableUsers.userId }))}
                    >
                      <ColoredAvatar id={availableUsers.userId} name={availableUsers.name} size="sm" />
                      <span className="text-sm ml-2">{availableUsers.name}</span>
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
          )}

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
      <div id="descriptTaskList" className="flex-1 flex flex-col overflow-hidden">
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

          {selectedTask && (
            <TaskDetailModal
              taskId={selectedTask.id}
              onClose={() => setSelectedTask(null)}
            />
          )}
        </div>
      </div>

      {/* Footer tạo task */}
      <div id="createTaskList" className="border-t p-4 shrink-0 bg-white">
        {isCreating ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter task summary..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateTask(); // Gọi hàm chung
                }
              }}
              className="w-64"
              autoFocus // Thêm autoFocus cho tiện
            />
            <Button onClick={handleCreateTask}> {/* Gọi hàm chung */}
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