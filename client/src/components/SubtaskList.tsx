"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { GripVertical, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import ColoredAvatar from "@/components/ColoredAvatar"
import axios from "@/config/axiosConfig"
import type { Task } from "@/utils/mapperUtil"
import type { Column } from "@/config/columsConfig"
import { mapApiTaskToTask, mapPriorityFromApi } from "@/utils/mapperUtil"
import { getTaskStatusBadge, getPriorityBadge, getPriorityIcon } from "@/utils/statusUtils"
import { Member } from "@/utils/IUser"

interface SubtaskListProps {
    parentTaskId: number
    projectId: number
    subtasks: Task[]
    columns: Column[]
    totalWidth: number
    selectedTasks: Set<number>
    toggleTaskSelection: (taskId: number) => void
    onCreateSubtask: (parentId: number, summary: string) => Promise<void>
    onCancelCreate: () => void
    isAdding: boolean
    availableUsers?: Member[]
}

export default function SubtaskList({
    parentTaskId,
    projectId,
    subtasks,
    columns,
    totalWidth,
    selectedTasks,
    toggleTaskSelection,
    onCreateSubtask,
    onCancelCreate,
    isAdding,
    availableUsers = [],
}: SubtaskListProps) {

    const inputRowRef = useRef<HTMLDivElement | null>(null)
    const [newSubSummary, setNewSubSummary] = useState("")
    const [editingCell, setEditingCell] = useState<{ taskId: number; field: string } | null>(null)

    // Danh sách field primitive có thể edit trực tiếp
    const editablePrimitiveFields = ["summary", "description"] as const
    type EditablePrimitiveField = typeof editablePrimitiveFields[number]

    const [localSubtasks, setLocalSubtasks] = useState<Task[]>(subtasks)
    useEffect(() => setLocalSubtasks(subtasks), [subtasks])

    const handleSubtaskEdit = useCallback(
        async (subtaskId: number, taskId: number, field: string, value: string | undefined) => {
            try {
                setLocalSubtasks(prev =>
                    prev.map(s => (s.id === subtaskId ? { ...s, [field]: value } : s))
                )

                const res = await axios.put(`/SubTasks/${subtaskId}/update/project/${projectId}`, {
                    subtaskId,
                    taskId,
                    [field]: value,
                })

                const updatedSubtask = mapApiTaskToTask(res.data)
                setLocalSubtasks(prev =>
                    prev.map(s => (s.id === subtaskId ? updatedSubtask : s))
                )
            } catch (err) {
                console.error("Update subtask failed:", err)
            } finally {
                setEditingCell(null)
            }
        },
        []
    )

    // Click outside cancel create
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (isAdding && inputRowRef.current && !inputRowRef.current.contains(event.target as Node)) {
                onCancelCreate()
                setNewSubSummary("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isAdding, onCancelCreate])

    return (
        <>
            {localSubtasks.map((subtask) => (
                <div
                    key={subtask.id}
                    className="flex border-b bg-gray-50 pl-10"
                    style={{ width: totalWidth }}
                >
                    {columns.map((col) => {
                        const isEditing =
                            editingCell?.taskId === subtask.id &&
                            editingCell.field === col.key

                        // ======================================
                        // FIX QUAN TRỌNG – Chỉ lấy value primitive
                        // ======================================
                        const rawValue = editablePrimitiveFields.includes(col.key as EditablePrimitiveField)
                            ? (subtask[col.key as EditablePrimitiveField] ?? "")
                            : ""

                        switch (col.key) {
                            case "select":
                                return (
                                    <div key={col.key} className="flex items-center gap-2 h-10">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab flex items-center justify-center">
                                            <GripVertical className="h-4 w-4" />
                                        </Button>
                                        <Checkbox
                                            checked={selectedTasks.has(subtask.id)}
                                            onCheckedChange={() => toggleTaskSelection(subtask.id)}
                                        />
                                    </div>
                                )

                            case "type":
                                return (
                                    <div
                                        key={col.key}
                                        className="relative flex items-center px-3 py-2 border-r text-sm text-gray-600"
                                        style={{ width: col.width, minWidth: col.minWidth }}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="flex-1 justify-between bg-transparent">
                                                    {subtask.type || "Select type"}
                                                    <ChevronDown className="h-4 w-4 ml-2" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent>
                                                {["Task", "Bug", "Story"].map((t) => (
                                                    <DropdownMenuItem
                                                        key={t}
                                                        onClick={() => handleSubtaskEdit(subtask.id, parentTaskId, "type", t)}
                                                    >
                                                        {t}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )

                            case "key":
                                return (
                                    <span
                                        key={col.key}
                                        className="border-r flex items-center px-3 py-2 text-blue-600 hover:underline cursor-pointer"
                                        style={{ width: col.width, minWidth: col.minWidth }}
                                    >
                                        {subtask.key}
                                    </span>
                                )

                            case "summary":
                                return (
                                    <div
                                        key={col.key}
                                        className="relative flex items-center px-3 py-2 border-r text-sm text-gray-600"
                                        style={{ width: col.width, minWidth: col.minWidth }}
                                    >
                                        {isEditing ? (
                                            <Input
                                                defaultValue={subtask.summary}
                                                onBlur={(e) =>
                                                    handleSubtaskEdit(subtask.id, parentTaskId, "summary", e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        handleSubtaskEdit(subtask.id, parentTaskId, "summary", e.currentTarget.value)
                                                    if (e.key === "Escape") setEditingCell(null)
                                                }}
                                                autoFocus
                                                className="h-6 text-sm"
                                            />
                                        ) : (
                                            <span
                                                onClick={() => setEditingCell({ taskId: subtask.id, field: "summary" })}
                                                className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                                            >
                                                ↳ {subtask.summary}
                                            </span>
                                        )}
                                    </div>
                                )

                            case "status":
                                return (
                                    <div
                                        key={col.key}
                                        className="relative flex items-center px-3 py-2 border-r text-sm text-gray-600"
                                        style={{ width: col.width, minWidth: col.minWidth }}
                                    >
                                        <Badge className={getTaskStatusBadge(subtask.status)}>
                                            {subtask.status}
                                        </Badge>
                                    </div>
                                )

                            case "assignee":
                                return (
                                    <DropdownMenu key={col.key}>
                                        <DropdownMenuTrigger asChild>
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                {subtask.assignee ? (
                                                    <>
                                                        <ColoredAvatar
                                                            id={subtask.raw.assigneeId ?? ""}
                                                            name={
                                                                typeof subtask.assignee === "string"
                                                                    ? subtask.assignee
                                                                    : subtask.assignee.name
                                                            }
                                                            size="sm"
                                                        />
                                                        <span className="text-sm">
                                                            {typeof subtask.assignee === "string"
                                                                ? subtask.assignee
                                                                : subtask.assignee.name}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <Button variant="ghost" size="sm">
                                                        Assign
                                                    </Button>
                                                )}
                                            </div>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleSubtaskEdit(subtask.id, parentTaskId, "assignee", undefined)
                                                }
                                            >
                                                Unassigned
                                            </DropdownMenuItem>

                                            {availableUsers.map((u) => (
                                                <DropdownMenuItem
                                                    key={u.userId}
                                                    onClick={() =>
                                                        handleSubtaskEdit(subtask.id, parentTaskId, "AssigneeId", u.userId)
                                                    }
                                                >
                                                    {u.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )

                            case "priority":
                                const priorityStr: "Low" | "Medium" | "High" =
                                    typeof subtask.priority === "number"
                                        ? mapPriorityFromApi(subtask.priority) ?? "Low"
                                        : subtask.priority || "Low"

                                const priorityColorMap = {
                                    Low: "bg-green-100 text-green-800",
                                    Medium: "bg-yellow-100 text-yellow-800",
                                    High: "bg-red-100 text-red-800",
                                }

                                return (
                                    <div
                                        key={col.key}
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
                                                        onClick={() =>
                                                            handleSubtaskEdit(subtask.id, parentTaskId, "priority", p)
                                                        }
                                                        className={`flex items-center gap-2 ${priorityColorMap[p]}`}
                                                    >
                                                        {getPriorityIcon(p)}
                                                        <span>{p}</span>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )

                            default:
                                return (
                                    <div
                                        key={col.key}
                                        className="relative flex items-center px-3 py-2 border-r text-sm text-gray-600"
                                        style={{ width: col.width, minWidth: col.minWidth }}
                                    >
                                        {isEditing ? (
                                            <Input
                                                defaultValue={rawValue}
                                                onBlur={(e) =>
                                                    handleSubtaskEdit(subtask.id, parentTaskId, col.key, e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        handleSubtaskEdit(subtask.id, parentTaskId, col.key, e.currentTarget.value)
                                                    if (e.key === "Escape") setEditingCell(null)
                                                }}
                                                autoFocus
                                                className="h-6 text-sm"
                                            />
                                        ) : (
                                            <span
                                                onClick={() =>
                                                    editablePrimitiveFields.includes(col.key as EditablePrimitiveField) &&
                                                    setEditingCell({ taskId: subtask.id, field: col.key })
                                                }
                                                className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                                            >
                                                {rawValue || "-"}
                                            </span>
                                        )}
                                    </div>
                                )
                        }
                    })}
                </div>
            ))}

            {isAdding && (
                <div ref={inputRowRef} className="flex border-b bg-gray-50" style={{ width: totalWidth }}>
                    <div className="px-3 py-2 w-full flex gap-2">
                        <Input
                            placeholder="Enter subtask summary..."
                            value={newSubSummary}
                            onChange={(e) => setNewSubSummary(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && newSubSummary.trim()) {
                                    onCreateSubtask(parentTaskId, newSubSummary)
                                    setNewSubSummary("")
                                }
                            }}
                            className="flex-1"
                        />
                        <Button
                            onClick={() => {
                                if (newSubSummary.trim()) {
                                    onCreateSubtask(parentTaskId, newSubSummary)
                                    setNewSubSummary("")
                                }
                            }}
                        >
                            Create
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                onCancelCreate()
                                setNewSubSummary("")
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}
