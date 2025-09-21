"use client";

import { GripVertical, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ColoredAvatar from "@/components/ColoredAvatar";
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
import { UserMini } from "@/utils/IUser";
import { Task } from "@/utils/mapperUtil";
import { Column } from "@/config/columsConfig";

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
    availableUsers?: UserMini[];
    copySelectedTasks: () => void;
    deleteSelectedTasks: () => void;
}

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
    availableUsers = [],
    copySelectedTasks,
    deleteSelectedTasks,
}: TableWrapperProps) {
    // ----- Render Header -----
    const renderHeader = () => (
        <div className="sticky top-0 z-10 flex bg-gray-50 border-b">
            {columns.map((col, i) => (
                <div
                    key={col.key}
                    className="relative flex items-center px-3 py-2 border-r text-sm font-medium text-gray-700"
                    style={{ width: col.width, minWidth: col.minWidth }}
                >
                    {col.key === "select" ? (
                        <Checkbox
                            checked={selectedTasks.size === tasks.length && tasks.length > 0}
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
    );

    // ----- Render Cell -----
    const renderCell = (task: Task, col: Column) => {
        const isEditing = editingCell?.taskId === task.id && editingCell?.field === col.key;

        switch (col.key) {
            case "select":
                return (
                    <div className="flex items-center gap-2 h-10">
                        <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab flex items-center justify-center">
                            <GripVertical className="h-4 w-4" />
                        </Button>
                        <Checkbox
                            checked={selectedTasks.has(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            className="h-5 w-5 rounded-sm border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:text-white flex items-center justify-center"
                        />
                    </div>
                );

            case "type":
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between">
                                {task.type || "Select type"}
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {["Task", "Bug", "Story"].map((t) => (
                                <DropdownMenuItem key={t} onClick={() => handleCellEdit(task.id, "type", t)}>
                                    {t}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );

            case "key":
                return (
                    <a href={`/browse/${task.key}`} className="text-blue-600 hover:underline">
                        {task.key}
                    </a>
                );

            case "summary":
                return isEditing ? (
                    <Input
                        defaultValue={task.summary}
                        onBlur={(e) => handleCellEdit(task.id, "summary", e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCellEdit(task.id, "summary", e.currentTarget.value);
                            if (e.key === "Escape") setEditingCell(null);
                        }}
                        autoFocus
                        className="h-6 text-sm"
                    />
                ) : (
                    <span
                        onClick={() => setEditingCell({ taskId: task.id, field: "summary" })}
                        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                    >
                        {task.summary}
                    </span>
                );

            case "description":
                return isEditing ? (
                    <Input
                        defaultValue={task.description}
                        onBlur={(e) => handleCellEdit(task.id, "description", e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCellEdit(task.id, "description", e.currentTarget.value);
                            if (e.key === "Escape") setEditingCell(null);
                        }}
                        autoFocus
                        className="h-6 text-sm"
                    />
                ) : (
                    <span
                        onClick={() => setEditingCell({ taskId: task.id, field: "description" })}
                        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                    >
                        {task.description}
                    </span>
                );

            case "status":
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between">
                                {task.status}
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {[
                                { label: "TO DO", value: "To Do", color: "bg-gray-100 text-gray-800" },
                                { label: "IN PROGRESS", value: "In Progress", color: "bg-blue-100 text-blue-800" },
                                { label: "DONE", value: "Done", color: "bg-green-100 text-green-800" },
                            ].map((s) => (
                                <DropdownMenuItem key={s.value} onClick={() => handleCellEdit(task.id, "status", s.value)}>
                                    <Badge className={s.color}>{s.label}</Badge>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );

            case "assignee":
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 cursor-pointer">
                                {typeof task.assignee === "string" ? (
                                    <>
                                        <ColoredAvatar id={task.raw.assigneeId ?? ''} name={task.assignee} size="sm" />
                                        <span className="text-sm">{task.assignee}</span>
                                    </>
                                ) : task.assignee ? (
                                    <>
                                        <ColoredAvatar
                                            id={task.raw.assigneeId ?? ''}
                                            name={task.assignee.name}
                                            src={task.assignee.avatar}
                                            initials={task.assignee.initials}
                                            size="sm"
                                        />
                                        <span className="text-sm">{task.assignee.name}</span>
                                    </>
                                ) : (
                                    <Button variant="ghost" size="sm">Assign</Button>
                                )}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleCellEdit(task.id, "assignee", undefined)}>
                                <div className="flex items-center gap-2">
                                    <ColoredAvatar id={task.raw.assigneeId ?? ""} name="Unassigned" size="sm" />
                                    <span>Unassigned</span>
                                </div>
                            </DropdownMenuItem>
                            {availableUsers.map((u) => (
                                <DropdownMenuItem key={u.name} onClick={() => handleCellEdit(task.id, "assignee", u)}>
                                    <div className="flex items-center gap-2">
                                        <ColoredAvatar id={task.raw.assigneeId ?? ""} name={u.name} src={u.avatar} initials={u.initials} size="sm" />
                                        <span>{u.name}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );

            case "reporter":
                return task.reporter ? (
                    <div className="flex items-center gap-2">
                        <ColoredAvatar
                            id={task.raw.assigneeId ?? ""}
                            name={task.reporter.name}
                            src={task.reporter.avatar}
                            initials={task.reporter.initials}
                            size="sm"
                        />
                        <span className="text-sm">{task.reporter.name}</span>
                    </div>
                ) : (
                    <span>-</span>
                );

            case "dueDate":
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                                {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "Set date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                onSelect={(date) =>
                                    handleCellEdit(task.id, "dueDate", date ? date.toISOString().split("T")[0] : "")
                                }
                            />
                        </PopoverContent>
                    </Popover>
                );

            case "created":
                return (
                    <span className="text-gray-600">
                        {task.created ? format(new Date(task.created), "MMM dd, yyyy") : "-"}
                    </span>
                );

            default:
                return isEditing ? (
                    <Input
                        defaultValue={task[col.key] || ""}
                        onBlur={(e) => handleCellEdit(task.id, col.key, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCellEdit(task.id, col.key, e.currentTarget.value);
                            if (e.key === "Escape") setEditingCell(null);
                        }}
                        autoFocus
                        className="h-6 text-sm"
                    />
                ) : (
                    <span
                        onClick={() => setEditingCell({ taskId: task.id, field: col.key })}
                        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded text-gray-600"
                    >
                        {task[col.key] || "-"}
                    </span>
                );
        }
    };

    return (
        <div style={{ width: totalWidth }}>
            {renderHeader()}
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={`flex border-b hover:bg-gray-50 ${selectedTasks.has(task.id) ? "bg-blue-50" : ""}`}
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
                            {renderCell(task, col)}
                        </div>
                    ))}
                </div>
            ))}
            {selectedTasks.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-md px-4 py-2 flex items-center gap-4 z-50">
                    <span>{selectedTasks.size} work items selected</span>
                    <Button variant="outline" onClick={copySelectedTasks}>Copy</Button>
                    <Button variant="destructive" onClick={deleteSelectedTasks}>Delete</Button>
                </div>
            )}
        </div>
    );
}
