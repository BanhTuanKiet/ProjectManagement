"use client"

import { GripVertical, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ColoredAvatar from "@/components/ColoredAvatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import type { UserMini } from "@/utils/IUser"
import type { Task } from "@/utils/mapperUtil"
import type { Column } from "@/config/columsConfig"
import React, { useState, useEffect, useRef } from "react"
import axios from "@/config/axiosConfig"
import { mapApiTaskToTask } from "@/utils/mapperUtil"

interface TableWrapperProps {
    tasks: Task[]
    projectId: number
    columns: Column[]
    totalWidth: number
    selectedTasks: Set<string>
    editingCell: { taskId: string; field: string } | null
    handleMouseDown: (e: React.MouseEvent, columnIndex: number) => void
    toggleAllTasks: () => void
    toggleTaskSelection: (taskId: string) => void
    handleCellEdit: (taskId: string, field: string, value: any) => void
    handleDragStart: (e: React.DragEvent, taskId: string) => void
    handleDragOver: (e: React.DragEvent) => void
    handleDrop: (e: React.DragEvent, targetTaskId: string) => void
    setEditingCell: React.Dispatch<React.SetStateAction<{ taskId: string; field: string } | null>>
    availableUsers?: UserMini[]
    copySelectedTasks: () => void
    deleteSelectedTasks: () => void
    onTaskClick: (task: Task) => void
}

export default function TableWrapper({
    tasks,
    projectId,
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
    onTaskClick,
}: TableWrapperProps) {
    const inputRowRef = useRef<HTMLDivElement | null>(null)
    const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
    const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null)
    const [newSubSummary, setNewSubSummary] = useState("")
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (addingSubtaskFor && inputRowRef.current && !inputRowRef.current.contains(event.target as Node)) {
                setAddingSubtaskFor(null)
                setNewSubSummary("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [addingSubtaskFor])

    const toggleExpand = async (taskId: string) => {
        if (expandedTasks.has(taskId)) {
            setExpandedTasks((prev) => {
                const newSet = new Set(prev)
                newSet.delete(taskId)
                return newSet
            })
        } else {
            // fetch subtasks từ API
            const subtasks = await fetchSubtasks(taskId)
            handleCellEdit(taskId, "subtasks", subtasks)

            setExpandedTasks((prev) => new Set(prev).add(taskId))
        }
    }

    const handleCreateSubtask = async (parentId: string, projectId: number) => {
        if (!newSubSummary.trim()) return
        try {
            const res = await axios.post(`/subtasks`, {
                projectId,
                taskId: parentId,
                title: newSubSummary,
                status: "To Do",
            })
            const created = mapApiTaskToTask(res.data)
            handleCellEdit(parentId, "subtasks", [...(tasks.find((t) => t.id === parentId)?.subtasks || []), created])

            setNewSubSummary("")
            setAddingSubtaskFor(null)
        } catch (err) {
            console.error("Error creating subtask", err)
        }
    }

    const fetchSubtasks = async (taskId: string) => {
        try {
            const res = await axios.get(`/subtasks/byTask/${taskId}`)
            console.log("Fetched subtasks for TaskId " + taskId + ": ", res.data)
            const mapped = res.data.map((sub: any) => mapApiTaskToTask(sub))
            return mapped
        } catch (err) {
            console.error("Error fetching subtasks", err)
            return []
        }
    }

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
    )

    // ----- Render Cell -----
    const renderCell = (task: Task, col: Column) => {
        const isEditing = editingCell?.taskId === task.id && editingCell?.field === col.key

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
                )

            case "type":
                return (
                    <div
                        className="flex items-center justify-between relative w-full"
                        onMouseEnter={() => setHoveredTaskId(task.id)}
                        onMouseLeave={() => setHoveredTaskId(null)}
                    >
                        {/* Hiện khi hover */}
                        {hoveredTaskId === task.id && (
                            <div className="flex items-center ml-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(task.id)}>
                                    {expandedTasks.has(task.id) ? (
                                        <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 transition-transform" />
                                    )}
                                </Button>
                            </div>
                        )}
                        {/* Dropdown chọn type */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 justify-between bg-transparent">
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

                        {/* Dấu + bên phải cell */}
                        {hoveredTaskId === task.id && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => setAddingSubtaskFor(task.id)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )

            case "key":
                return (
                    <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => onTaskClick(task)}>
                        {task.key}
                    </span>
                )

            case "summary":
                return isEditing ? (
                    <Input
                        defaultValue={task.summary}
                        onBlur={(e) => handleCellEdit(task.id, "summary", e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCellEdit(task.id, "summary", e.currentTarget.value)
                            if (e.key === "Escape") setEditingCell(null)
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
                )

            case "description":
                return isEditing ? (
                    <Input
                        defaultValue={task.description}
                        onBlur={(e) => handleCellEdit(task.id, "description", e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCellEdit(task.id, "description", e.currentTarget.value)
                            if (e.key === "Escape") setEditingCell(null)
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
                )

            case "status":
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between bg-transparent">
                                {task.status}
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {[
                                {
                                    label: "TO DO",
                                    value: "To Do",
                                    color: "bg-gray-100 text-gray-800",
                                },
                                {
                                    label: "IN PROGRESS",
                                    value: "In Progress",
                                    color: "bg-blue-100 text-blue-800",
                                },
                                {
                                    label: "DONE",
                                    value: "Done",
                                    color: "bg-green-100 text-green-800",
                                },
                            ].map((s) => (
                                <DropdownMenuItem key={s.value} onClick={() => handleCellEdit(task.id, "status", s.value)}>
                                    <Badge className={s.color}>{s.label}</Badge>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )

            case "assignee":
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 cursor-pointer">
                                {typeof task.assignee === "string" ? (
                                    <>
                                        <ColoredAvatar id={task.raw.assigneeId ?? ""} name={task.assignee} size="sm" />
                                        <span className="text-sm">{task.assignee}</span>
                                    </>
                                ) : task.assignee ? (
                                    <>
                                        <ColoredAvatar
                                            id={task.raw.assigneeId ?? ""}
                                            name={task.assignee.name}
                                            src={task.assignee.avatar}
                                            initials={task.assignee.initials}
                                            size="sm"
                                        />
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
                            <DropdownMenuItem onClick={() => handleCellEdit(task.id, "assignee", undefined)}>
                                <div className="flex items-center gap-2">
                                    <ColoredAvatar id={task.raw.assigneeId ?? ""} name="Unassigned" size="sm" />
                                    <span>Unassigned</span>
                                </div>
                            </DropdownMenuItem>
                            {availableUsers.map((u) => (
                                <DropdownMenuItem key={u.name} onClick={() => handleCellEdit(task.id, "assignee", u)}>
                                    <div className="flex items-center gap-2">
                                        <ColoredAvatar
                                            id={task.raw.assigneeId ?? ""}
                                            name={u.name}
                                            src={u.avatar}
                                            initials={u.initials}
                                            size="sm"
                                        />
                                        <span>{u.name}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )

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
                )

            case "dueDate":
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal bg-transparent">
                                {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "Set date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                onSelect={(date) => handleCellEdit(task.id, "dueDate", date ? date.toISOString().split("T")[0] : "")}
                            />
                        </PopoverContent>
                    </Popover>
                )

            case "created":
                return (
                    <span className="text-gray-600">{task.created ? format(new Date(task.created), "MMM dd, yyyy") : "-"}</span>
                )

            default:
                return isEditing ? (
                    <Input
                        defaultValue={task[col.key] || ""}
                        onBlur={(e) => handleCellEdit(task.id, col.key, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCellEdit(task.id, col.key, e.currentTarget.value)
                            if (e.key === "Escape") setEditingCell(null)
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
                )
        }
    }

    return (
        <div style={{ width: totalWidth }}>
            {renderHeader()}
            {tasks.map((task) => (
                <React.Fragment key={task.id}>
                    {/* row chính */}
                    <div
                        className={`flex border-b hover:bg-gray-50 ${selectedTasks.has(task.id) ? "bg-blue-50" : ""}`}
                        style={{ width: totalWidth }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, task.id)}
                        onMouseEnter={() => setHoveredTaskId(task.id)}
                        onMouseLeave={() => setHoveredTaskId(null)}
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
                    {/* Hiện subtasks nếu expand */}
                    {expandedTasks.has(task.id) &&
                        task.subtasks &&
                        task.subtasks.length > 0 &&
                        task.subtasks.map((sub) => (
                            <div key={sub.id} className="flex border-b bg-gray-50 pl-10" style={{ width: totalWidth }}>
                                {columns.map((col) => (
                                    <div
                                        key={`${sub.id}-${col.key}`}
                                        className="relative flex items-center px-3 py-2 border-r text-sm text-gray-600"
                                        style={{ width: col.width, minWidth: col.minWidth }}
                                    >
                                        {col.key === "summary" ? (
                                            <span className="pl-4">↳ {sub.summary}</span>
                                        ) : col.key === "status" ? (
                                            <Badge
                                                className={
                                                    sub.status === "Done"
                                                        ? "bg-green-100 text-green-800"
                                                        : sub.status === "In Progress"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                }
                                            >
                                                {sub.status}
                                            </Badge>
                                        ) : col.key === "assignee" && sub.assignee ? (
                                            <div className="flex items-center gap-2">
                                                <ColoredAvatar
                                                    id={sub.assignee.id || ""}
                                                    name={sub.assignee.name}
                                                    src={sub.assignee.avatar}
                                                    initials={sub.assignee.initials}
                                                    size="sm"
                                                />
                                                <span className="text-sm">{sub.assignee.name}</span>
                                            </div>
                                        ) : col.key === "key" ? (
                                            <span className="text-blue-600">{sub.key}</span>
                                        ) : col.key === "select" ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6" />
                                                <Checkbox
                                                    checked={selectedTasks.has(sub.id)}
                                                    onCheckedChange={() => toggleTaskSelection(sub.id)}
                                                    className="h-5 w-5"
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ))}

                    {/* row phụ thêm subtask */}
                    {addingSubtaskFor === task.id && (
                        <div ref={inputRowRef} className="flex border-b bg-gray-50" style={{ width: totalWidth }}>
                            <div className="px-3 py-2 w-full flex gap-2">
                                <Input
                                    placeholder="Enter subtask summary..."
                                    value={newSubSummary}
                                    onChange={(e) => setNewSubSummary(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && newSubSummary.trim()) {
                                            handleCreateSubtask(task.id, projectId)
                                        }
                                    }}
                                    className="flex-1"
                                />
                                <Button onClick={() => handleCreateSubtask(task.id, projectId)}>Create</Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setAddingSubtaskFor(null)
                                        setNewSubSummary("")
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </React.Fragment>
            ))}
            {selectedTasks.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-md px-4 py-2 flex items-center gap-4 z-50">
                    <span>{selectedTasks.size} work items selected</span>
                    <Button variant="outline" onClick={copySelectedTasks}>
                        Copy
                    </Button>
                    <Button variant="destructive" onClick={deleteSelectedTasks}>
                        Delete
                    </Button>
                </div>
            )}
        </div>
    )
}
