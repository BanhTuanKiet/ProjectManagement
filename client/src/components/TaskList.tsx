import { BasicTask } from "@/utils/ITask"
import { Badge } from "@/components/ui/badge"
import { Clock } from 'lucide-react'
import ColoredAvatar from "./ColoredAvatar"
import { getStatusColor } from "@/utils/statusUtils"

export function TaskList({ tasks }: { tasks: BasicTask[] }) {
    const isOverdue = (deadline: string) => {
        return new Date(deadline) < new Date()
    }
console.log(tasks)
    if (!tasks || tasks.length === 0) {
        return <div className="p-3 text-center text-xs text-muted-foreground">No tasks available</div>
    }

    return (
        <div className="max-h-64 overflow-y-auto p-1">
            <div className="space-y-1">
                {tasks.map((task) => (
                    <div
                        key={task.taskId}
                        className={`
                            flex items-center gap-2 rounded border 
                            bg-card p-2 hover:bg-accent/50 transition-colors cursor-pointer
                         `}
                    >
                        <div className="flex items-center gap-1.5 min-w-fit">
                            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                TASK-{task.taskId}
                            </span>
                            <Badge variant="secondary" className={`${getStatusColor(task.status)} text-[10px] px-1.5 py-0 h-4`}>
                                {task.status}
                            </Badge>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{task.title}</p>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-fit">
                            {isOverdue(task.deadline) && (
                                <div className="flex items-center gap-0.5 text-red-500">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-[10px] font-medium">Overdue</span>
                                </div>
                            )}
                            <ColoredAvatar id={task.assigneeId ?? task.createdBy} name={task.assignee} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}