import { BasicTask } from '@/utils/ITask'
import {
    getDeadlineStatus,
    getPriorityBadge,
    getPriorityBorderColor,
    getPriorityLabel
} from '@/utils/statusUtils'
import { formatDate } from "@/utils/dateUtils"
import { Clock, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TaskOverviewProps {
    task: BasicTask
    type?: "deadline" | "today"
}

export default function TaskOverview({ task, type = "deadline" }: TaskOverviewProps) {
    const deadlineStatus = getDeadlineStatus(task.deadline)
    const priorityBorder = getPriorityBorderColor(task.priority)
    const priorityBadge = getPriorityBadge(task.priority)
    const router = useRouter()

    return (
        <div
            onClick={() => router.push(`/project/${task.projectId}/#list?tasks=${task.taskId}`)}
            className={`
                group relative flex flex-col justify-between gap-2 rounded-r-lg rounded-l-sm 
                border border-border bg-card p-3 pl-3.5 shadow-sm transition-all duration-200 
                hover:-translate-y-0.5 hover:shadow-md cursor-pointer
                ${priorityBorder} border-l-[6px] h-full
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

                        {type === "deadline" ? (
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${deadlineStatus.className}`}>
                                <Clock size={10} />
                                {deadlineStatus.label}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                Deadline: {formatDate(task.deadline)}
                            </div>
                        )}
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
                    {formatDate(task.createdAt)}
                </div>
            </div>
        </div>
    )
}
