"use client"

import type React from "react"
import ColoredAvatar from "./ColoredAvatar"
import type { BasicTask } from "@/utils/ITask"
import { getDeadlineStyle } from "@/utils/dateUtils"
import { Clock, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { getPriorityIcon, getTaskStatusBadge } from "@/utils/statusUtils"

export default function TaskCard({
    task,
    setSelectedTask,
}: {
    task: BasicTask
    setSelectedTask: React.Dispatch<React.SetStateAction<number | null>>
}) {
    const isOverdue = getDeadlineStyle(task)

    return (
        <div
            className="group w-full bg-card hover:bg-accent/50 border border-border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md"
            onClick={() => setSelectedTask(task.taskId)}
        >
            {/* Header with task ID and priority */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">TASK-{task.taskId}</span>
                </div>
                <span className={getTaskStatusBadge(task.status)}>
                    {task.status}
                </span>
            </div>

            {/* Task title */}
            <h4 className="text-sm font-medium text-foreground mb-3 line-clamp-2 leading-relaxed">{task.title}</h4>

            {/* Footer with metadata */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isOverdue && (
                        <div className="flex items-center gap-1 text-xs text-destructive">
                            <Clock className="h-3 w-3" />
                            <span>Overdue</span>
                        </div>
                    )}
                    {task.deadline && !isOverdue && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                {task.assignee && <ColoredAvatar id={task.assigneeId || ""} name={task.assignee} size="sm" />}
            </div>
        </div>
    )
}
