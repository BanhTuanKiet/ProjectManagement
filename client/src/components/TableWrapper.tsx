"use client";

import { GripVertical, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Task {
  id: string;
  key: string;
  summary: string;
  status: "To Do" | "Done" | "In Progress";
  assignee?: {
    name: string;
    avatar: string;
    initials: string;
  };
  dueDate?: string;
  type: "Task";
  [key: string]: any;
}

interface Column {
  key: string;
  title: string;
  width: number;
  minWidth: number;
  resizable: boolean;
}

interface TableWrapperProps {
  tasks: Task[];
  columns: Column[];
  totalWidth: number;
  selectedTasks: Set<string>;
  editingCell: { taskId: string; field: string } | null;
  handleMouseDown: (e: React.MouseEvent, columnIndex: number) => void;
  toggleAllTasks: () => void;
  toggleTaskSelection: (taskId: string) => void;
  handleCellEdit: (taskId: string, field: string, value: any) => void;
  handleDragStart: (e: React.DragEvent, taskId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetTaskId: string) => void;
  setEditingCell: React.Dispatch<
    React.SetStateAction<{ taskId: string; field: string } | null>
  >;
}

const users = [
  { name: "Thái Bảo", avatar: "/diverse-user-avatars.png", initials: "TB" },
  { name: "Unassigned", avatar: "", initials: "U" },
  { name: "Nguyễn An", avatar: "/diverse-user-avatars.png", initials: "NA" },
];

export default function TableWrapper({
  tasks,
  columns,
  totalWidth,
  selectedTasks,
  editingCell,
  handleMouseDown,
  toggleAllTasks,
  toggleTaskSelection,
  handleCellEdit,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setEditingCell,
}: TableWrapperProps) {
  return (
    <div style={{ width: totalWidth }}>
      {/* Header Row */}
      <div className="sticky top-0 z-10 flex bg-gray-50 border-b">
        {columns.map((col, i) => (
          <div
            key={col.key}
            className="relative flex items-center px-3 py-2 border-r text-sm font-medium text-gray-700"
            style={{ width: col.width, minWidth: col.minWidth }}
          >
            {col.key === "select" ? (
              <Checkbox
                checked={
                  selectedTasks.size === tasks.length && tasks.length > 0
                }
                onCheckedChange={toggleAllTasks}
              />
            ) : (
              <span>{col.title}</span>
            )}

            {col.resizable && (
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                onMouseDown={(e) => handleMouseDown(e, i)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex border-b hover:bg-gray-50 ${
            selectedTasks.has(task.id) ? "bg-blue-50" : ""
          }`}
          style={{ width: totalWidth }}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, task.id)}
        >
          {columns.map((col) => (
            <div
              key={`${task.id}-${col.key}`}
              className="relative flex items-center px-3 py-2 border-r text-sm"
              style={{ width: col.width, minWidth: col.minWidth }}
            >
              {/* --- Render cell theo col.key --- */}

              {/* Checkbox + drag handle */}
              {col.key === "select" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-grab"
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Checkbox
                    checked={selectedTasks.has(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                  />
                </div>
              )}

              {/* Type column */}
              {col.key === "type" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                    >
                      {task.type || "Select type"}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {["Task", "Bug", "Story"].map((t) => (
                      <DropdownMenuItem
                        key={t}
                        onClick={() => handleCellEdit(task.id, "type", t)}
                      >
                        {t}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Key column */}
              {col.key === "key" && (
                <a
                  href={`/browse/${task.key}`}
                  className="text-blue-600 hover:underline"
                >
                  {task.key}
                </a>
              )}

              {/* Summary column */}
              {col.key === "summary" &&
                (editingCell?.taskId === task.id &&
                editingCell?.field === "summary" ? (
                  <Input
                    defaultValue={task.summary}
                    onBlur={(e) =>
                      handleCellEdit(task.id, "summary", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCellEdit(
                          task.id,
                          "summary",
                          e.currentTarget.value
                        );
                      }
                      if (e.key === "Escape") setEditingCell(null);
                    }}
                    autoFocus
                    className="h-6 text-sm"
                  />
                ) : (
                  <span
                    onClick={() =>
                      setEditingCell({ taskId: task.id, field: "summary" })
                    }
                    className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                  >
                    {task.summary}
                  </span>
                ))}

              {/* Status column */}
              {col.key === "status" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                    >
                      {task.status}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleCellEdit(task.id, "status", "To Do")}
                    >
                      <Badge className="bg-gray-100 text-gray-800">TO DO</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleCellEdit(task.id, "status", "In Progress")
                      }
                    >
                      <Badge className="bg-blue-100 text-blue-800">
                        IN PROGRESS
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCellEdit(task.id, "status", "Done")}
                    >
                      <Badge className="bg-green-100 text-green-800">
                        DONE
                      </Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Assignee column */}
              {col.key === "assignee" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      {task.assignee ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{task.assignee.name}</span>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm">
                          Assign
                        </Button>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {users.map((u) => (
                      <DropdownMenuItem
                        key={u.name}
                        onClick={() =>
                          handleCellEdit(
                            task.id,
                            "assignee",
                            u.name === "Unassigned" ? undefined : u
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>{u.initials}</AvatarFallback>
                          </Avatar>
                          <span>{u.name}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* DueDate column */}
              {col.key === "dueDate" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      {task.dueDate
                        ? format(new Date(task.dueDate), "MMM dd, yyyy")
                        : "Set date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={
                        task.dueDate ? new Date(task.dueDate) : undefined
                      }
                      onSelect={(date) =>
                        handleCellEdit(
                          task.id,
                          "dueDate",
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
              )}

              {/* Default editable cells */}
              {![
                "select",
                "type",
                "key",
                "summary",
                "status",
                "assignee",
                "dueDate",
              ].includes(col.key) &&
                (editingCell?.taskId === task.id &&
                editingCell?.field === col.key ? (
                  <Input
                    defaultValue={task[col.key] || ""}
                    onBlur={(e) =>
                      handleCellEdit(task.id, col.key, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleCellEdit(task.id, col.key, e.currentTarget.value);
                      if (e.key === "Escape") setEditingCell(null);
                    }}
                    autoFocus
                    className="h-6 text-sm"
                  />
                ) : (
                  <span
                    onClick={() =>
                      setEditingCell({ taskId: task.id, field: col.key })
                    }
                    className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded text-gray-600"
                  >
                    {task[col.key] || "-"}
                  </span>
                ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
