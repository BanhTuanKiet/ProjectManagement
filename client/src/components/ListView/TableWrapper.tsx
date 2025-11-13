"use client"

import { GripVertical, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ColoredAvatar from "@/components/ColoredAvatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import type { Member, UserMini } from "@/utils/IUser"
import type { Task } from "@/utils/mapperUtil"
import type { Column } from "@/config/columsConfig"
import React, { useState, useEffect, useRef } from "react"
import axios from "@/config/axiosConfig"
import DueDateCell from "../DueDateCell"
import { mapApiTaskToTask, mapPriorityFromApi } from "@/utils/mapperUtil"
import SubtaskList from "../SubtaskList"
import { getPriorityIcon } from "@/utils/statusUtils"

interface TableWrapperProps {
    tasks: Task[]
    projectId: number
    columns: Column[]
    totalWidth: number
    selectedTasks: Set<number>
    editingCell: { taskId: number; field: string } | null
    handleMouseDown: (e: React.MouseEvent, columnIndex: number) => void
    toggleAllTasks: () => void
    toggleTaskSelection: (taskId: number) => void
    handleCellEdit: (taskId: number, field: string, value: any) => void
    handleDragStart: (e: React.DragEvent, taskId: number) => void
    handleDragOver: (e: React.DragEvent) => void
    handleDrop: (e: React.DragEvent, targetTaskId: number) => void
    handleColumnDragStart: (e: React.DragEvent, columnIndex: number) => void
    handleColumnDragOver: (e: React.DragEvent) => void
    handleColumnDrop: (e: React.DragEvent, targetColumnIndex: number) => void
    setEditingCell: React.Dispatch<React.SetStateAction<{ taskId: number; field: string } | null>>
    availableUsers?: Member[]
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
    handleColumnDragStart,
    handleColumnDragOver,
    handleColumnDrop,
    setEditingCell,
    availableUsers = [],
    copySelectedTasks,
    deleteSelectedTasks,
    onTaskClick,
}: TableWrapperProps) {
    const inputRowRef = useRef<HTMLDivElement | null>(null)
    const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null)
    const [addingSubtaskFor, setAddingSubtaskFor] = useState<number | null>(null)
    const [newSubSummary, setNewSubSummary] = useState("")
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set())
    const [subTask, setSubTask] = useState<Task[] | null>(null)

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

    const toggleExpand = async (taskId: number) => {
        if (expandedTasks.has(taskId)) {
            setExpandedTasks((prev) => {
                const newSet = new Set(prev)
                newSet.delete(taskId)
                return newSet
            })
        } else {
            // fetch subtasks từ API
            const subtasks = await fetchSubtasks(taskId)
            const updatedTasks = tasks.map((t) =>
                t.id === taskId ? { ...t, subtasks } : t
            )
            setExpandedTasks((prev) => new Set(prev).add(taskId))
        }
    }

    const handleCreateSubtask = async (parentId: number, newSubSummary: string) => {
        if (!newSubSummary.trim()) return
        try {
            const res = await axios.post(`/subtasks`, {
                projectId,
                taskId: parentId,
                title: newSubSummary,
                status: "Todo",
            })
            const created = mapApiTaskToTask(res.data)
            handleCellEdit(parentId, "subtasks", [...(tasks.find((t) => t.id === parentId)?.subtasks || []), created])

            setNewSubSummary("")
            setAddingSubtaskFor(null)
        } catch (err) {
            console.error("Error creating task", err)
        }
    }

    const fetchSubtasks = async (taskId: number) => {
        try {
            const res = await axios.get(`/subtasks/byTask/${taskId}`)
            console.log("Fetched subtasks for TaskId " + taskId + ": ", res.data)
            const mapped = res.data.map((sub: any) => mapApiTaskToTask(sub))
            setSubTask(mapped)
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
                    draggable
                    onDragStart={(e) => handleColumnDragStart(e, i)}
                    onDragOver={handleColumnDragOver}
                    onDrop={(e) => handleColumnDrop(e, i)}
                    className="relative flex items-center px-3 py-2 border-r border-l text-sm font-medium text-gray-700"
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
                        className="flex items-center gap-2 relative w-full"
                        onMouseEnter={() => setHoveredTaskId(task.id)}
                        onMouseLeave={() => setHoveredTaskId(null)}
                    >
                        {/* Hiện khi hover */}
                        {hoveredTaskId === task.id && (
                            <div className="flex items-center">
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
                            <Button id="createTaskList" variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setAddingSubtaskFor(task.id); setExpandedTasks(prev => new Set(prev).add(task.id)); }}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )

            case "key":
                return (
                    <span id="ClickTaskDeatailModal" className="text-blue-600 hover:underline cursor-pointer" onClick={() => onTaskClick(task)}>
                        {task.key}
                    </span>
                )

            case "summary":
                return isEditing ? (
                    <Input
                        id="EditList"
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
                        id="EditList"
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
                            <Button id="EditList" variant="outline" size="sm" className="w-full justify-between bg-transparent">
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
                            <div id="EditList" className="flex items-center gap-2 cursor-pointer">
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
                    <div id="EditList" className="flex items-center gap-2">
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

            case "dueDate": {
                return <DueDateCell task={task} handleCellEdit={handleCellEdit} />
            }

            case "priority":
                // Map priority FE string hợp lệ từ BE number hoặc string
                const priorityStr: "Low" | "Medium" | "High" =
                    typeof task.priority === "number"
                        ? mapPriorityFromApi(task.priority) ?? "Low" // BE number -> FE string
                        : typeof task.priority === "string"
                            ? task.priority as "Low" | "Medium" | "High"
                            : "Low";

                // Màu cho badge/menu item
                const priorityColorMap: Record<"Low" | "Medium" | "High", string> = {
                    Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                    High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                };

                return (
                    <div
                        id="EditList"
                        key={`${task.id}-${col.key}`}
                        className="relative flex items-center px-3 py-2 border-r text-sm text-gray-600"
                        style={{ width: col.width, minWidth: col.minWidth }}
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span className="flex items-center gap-1 cursor-pointer">
                                    {getPriorityIcon(priorityStr)}
                                    <Badge className={priorityColorMap[priorityStr]}>{priorityStr}</Badge>
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {(["Low", "Medium", "High"] as const).map((p) => (
                                    <DropdownMenuItem
                                        key={p}
                                        onClick={() => {
                                            // Update local state + gửi BE
                                            handleCellEdit(task.id, "priority", p)
                                        }}
                                        className={`flex items-center gap-2 ${priorityColorMap[p]}`}
                                    >
                                        {getPriorityIcon(p)}
                                        <span>{p}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );


            case "created":
                return (
                    <span id="EditList" className="text-gray-600">{task.created ? format(new Date(task.created), "MMM dd, yyyy") : "-"}</span>
                )

            default:
                return isEditing ? (
                    <Input
                        id="EditList"
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
                        className={`flex border-b border-l hover:bg-gray-200 ${selectedTasks.has(task.id) ? "bg-blue-50" : ""}`}
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
                                className="relative flex items-center justify-center px-3 py-2 border-r text-sm"
                                style={{ width: col.width, minWidth: col.minWidth }}
                            >
                                {renderCell(task, col)}
                            </div>
                        ))}
                    </div>
                    {/* Hiện subtasks nếu expand */}
                    {expandedTasks.has(task.id) && (
                        <SubtaskList
                            parentTaskId={task.id}
                            projectId={projectId}
                            subtasks={subTask || []}
                            columns={columns}
                            totalWidth={totalWidth}
                            selectedTasks={selectedTasks}
                            toggleTaskSelection={toggleTaskSelection}
                            onCreateSubtask={handleCreateSubtask}
                            onCancelCreate={() => setAddingSubtaskFor(null)}
                            isAdding={addingSubtaskFor === task.id}
                            availableUsers={availableUsers}
                        />
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
