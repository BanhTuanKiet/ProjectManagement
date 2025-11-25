"use client"

import { useMemo, useState } from "react"
import {
    AlertCircle,
    Clock,
    User,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { BasicTask } from "@/utils/ITask"
import { getDeadlineStatus, getPriorityBadge, getPriorityBorderColor, getPriorityLabel } from "@/utils/statusUtils"
import { formatDate } from "@/utils/dateUtils"

interface DeadlineTasksListProps {
    tasks: BasicTask[]
    onTaskClick?: (task: BasicTask) => void
}

function TaskItem({ task, onTaskClick }: { task: BasicTask; onTaskClick?: (task: BasicTask) => void }) {
    const deadlineStatus = getDeadlineStatus(task.deadline)
    const priorityBorder = getPriorityBorderColor(task.priority)
    const priorityBadge = getPriorityBadge(task.priority)

    return (
        <div
            onClick={() => onTaskClick?.(task)}
            className={`
        group relative flex flex-col justify-between gap-2 rounded-r-lg rounded-l-sm border border-border bg-card p-3 pl-3.5
        shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer
        ${priorityBorder} border-l-[4px] h-full
      `}
        >
            <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm leading-tight text-foreground truncate pr-1 group-hover:text-primary transition-colors">
                            {task.title}
                        </h3>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium uppercase tracking-wider ${priorityBadge}`}>
                            <span className="hidden sm:inline">{getPriorityLabel(task.priority)}</span>
                        </div>

                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${deadlineStatus.className}`}>
                            <Clock size={10} />
                            {deadlineStatus.label}
                        </div>
                    </div>
                </div>

                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {task.description}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-border pt-2 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary ring-2 ring-background">
                        {task.assignee ? task.assignee.charAt(0).toUpperCase() : <User size={12} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-foreground leading-none">
                            {task.assignee || "Unassigned"}
                        </span>
                    </div>
                </div>

                <div className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                    {formatDate(task.deadline)}
                </div>
            </div>
        </div>
    )
}

const ITEMS_PER_PAGE = 6

export function UpcomingDeadline({ tasks, onTaskClick }: DeadlineTasksListProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const upcomingTasks = useMemo(() => {
        if (!tasks || tasks.length === 0) return []
        const now = new Date()
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        return tasks
            .filter((task) => {
                const deadlineDate = new Date(task.deadline)
                return deadlineDate <= in7Days && task.isActive
            })
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    }, [tasks])

    const totalPages = Math.ceil(upcomingTasks.length / ITEMS_PER_PAGE);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTasks = upcomingTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (upcomingTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-3 rounded-full bg-muted p-3">
                    <Clock size={24} className="text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No urgent tasks</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    {"Great! You've completed the tasks scheduled to the limit."}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <AlertCircle size={20} className="text-destructive" />
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-tight text-foreground">
                        Upcoming Deadlines <span className="ml-1 text-muted-foreground font-normal">({upcomingTasks.length})</span>
                    </h2>
                </div>

                {totalPages > 1 && (
                    <span className="text-xs text-muted-foreground">
                        Page {currentPage}/{totalPages}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {currentTasks.map((task) => (
                    <TaskItem key={task.taskId || task.id} task={task} onTaskClick={onTaskClick} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-border mt-4">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Previous Page"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`
                        w-7 h-7 flex items-center justify-center text-xs rounded-md transition-all
                        ${currentPage === page
                                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                                        : "text-muted-foreground hover:bg-muted"
                                    }
                    `}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Next Page"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    )
}
