"use client"

import { getBorderColor, getCheckboxColor } from "@/utils/statusUtils"
import { Checkbox } from "@radix-ui/react-checkbox"
import type React from "react"
import ColoredAvatar from "./ColoredAvatar"
import type { BasicTask } from "@/utils/ITask"
import { getDeadlineStyle } from "@/utils/dateUtils"

export default function TaskCalendar({
    task,
    setSelectedTask,
}: {
    task: BasicTask
    setSelectedTask: React.Dispatch<React.SetStateAction<number | null>>
}) {
    return (
        <div key={task.taskId} className="space-y-1 w-full">
            <div
                className={`flex items-center gap-2 p-1 rounded text-xs w-full ${getDeadlineStyle(task) ? "bg-red-500/20 border border-red-500" : `bg-muted/50 ${getBorderColor(task.status)}`}`}
                onClick={() => setSelectedTask(task.taskId)}
            >
                <Checkbox checked={true} className={`h-4 w-4 appearance-none flex-shrink-0 ${getCheckboxColor(task.status)}`} />
                <span className={`flex-1 truncate min-w-0 ${getDeadlineStyle(task) ? "text-red-700 dark:text-red-300" : ""}`}>
                    {task.title}
                </span>
                {task.assignee && <ColoredAvatar id={task.assigneeId || ""} name={task.assignee} size="sm" />}
            </div>
        </div>
    )
}
