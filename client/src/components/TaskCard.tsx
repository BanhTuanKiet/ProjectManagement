"use client"

import type React from "react"
import ColoredAvatar from "./ColoredAvatar"
import type { BasicTask } from "@/utils/ITask"
import { getTaskStatusBadge } from "@/utils/statusUtils"

export default function TaskCard({
    task,
    setSelectedTask,
}: {
    task: BasicTask
    setSelectedTask: React.Dispatch<React.SetStateAction<number | null>>
}) {
    return (
        <div
            onClick={() => setSelectedTask(task.taskId)}
            className="group w-full bg-card hover:bg-accent/50 border border-border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between h-full"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">
                    TASK-{task.taskId}
                </span>
                <span className={getTaskStatusBadge(task.status)}>
                    {task.status}
                </span>
            </div>

            <h4 className="truncate text-sm font-semibold text-foreground mb-3 line-clamp-2 leading-relaxed">
                {task.title}
            </h4>

            <div className="flex items-center justify-start mt-auto">
                {task.assignee && (
                    <div className="flex items-center gap-2">
                        <ColoredAvatar
                            id={task.assigneeId || ""}
                            name={task.assignee}
                            size="sm"
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                            {task.assignee}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}