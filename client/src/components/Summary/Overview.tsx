import { BasicTask, TaskStats } from '@/utils/ITask'
import { formatTaskStatus, getPriorityBadge, getPriorityLabel, getTaskStatusBadge } from '@/utils/statusUtils'
import { AlertCircle, BarChart3, CalendarX, CheckCircle2, Clock, XCircle } from 'lucide-react'
import React from 'react'

const taskStatuses = [
    { key: 'total', color: 'from-purple-500 to-purple-600', Icon: BarChart3, textClass: 'text-purple-100', iconClass: 'text-purple-200' },
    { key: 'todo', color: 'from-blue-400 to-blue-500', Icon: AlertCircle, textClass: 'text-blue-100', iconClass: 'text-gray-200', bgColor: "bg-blue-400" },
    { key: 'inProgress', color: 'from-yellow-400 to-yellow-500', Icon: Clock, textClass: 'text-yellow-100', iconClass: 'text-yellow-200', bgColor: "bg-yellow-400" },
    { key: 'done', color: 'from-green-500 to-green-600', Icon: CheckCircle2, textClass: 'text-green-100', iconClass: 'text-green-200', bgColor: "bg-green-400" },
    { key: 'cancel', color: 'from-red-400 to-red-500', Icon: XCircle, textClass: 'text-red-100', iconClass: 'text-red-200', isSmall: true, bgColor: "bg-orange-400" },
    { key: 'expired', color: 'from-orange-400 to-orange-500', Icon: CalendarX, textClass: 'text-orange-100', iconClass: 'text-orange-200', isSmall: true, bgColor: "bg-red-400" },
]

export default function Overview({ 
    mockTasks 
}: { 
    mockTasks: BasicTask[] 
}) {
    const taskStatistics = Object.values(
        mockTasks.reduce<Record<number, TaskStats>>((acc, task) => {
            const p = task.priority
            if (!acc[p]) {
                acc[p] = {
                    priority: p,
                    total: 0,
                    todo: 0,
                    inProgress: 0,
                    done: 0,
                    cancel: 0,
                    expired: 0
                }
            }

            acc[p].total += 1

            const status = task.status.toLowerCase()

            if (status === "todo") acc[p].todo += 1
            else if (status === "in progress") acc[p].inProgress += 1
            else if (status === "done") acc[p].done += 1
            else if (status === "cancel") acc[p].cancel += 1
            else if (status === "expired") acc[p].expired += 1

            return acc
        }, {} as Record<number, TaskStats>)
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50 bg-white">
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Task Statistics by Priority</h2>

                {taskStatistics.map((stat) => {
                    const completionRate = Math.round((stat.done / stat.total) * 100)

                    return (
                        <div key={stat.priority} className="bg-white rounded-xl border border-gray-200 p-6 py-3 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-4 h-4 rounded-full ${getPriorityBadge(stat.priority)}`} />
                                    <h3 className="font-semibold text-gray-900">{getPriorityLabel(stat.priority)}</h3>
                                    <span className="text-sm text-gray-500">({stat.total} tasks)</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{completionRate}%</span>
                            </div>

                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4 flex">
                                {taskStatuses.filter(t => t.key !== 'total').map((status) => (
                                    <div
                                        key={status.key}
                                        className={`${status.bgColor}`}
                                        style={{ width: `${(stat[status.key as keyof TaskStats] / stat.total) * 100}%` }}
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-5 gap-4">
                                {taskStatuses.filter(t => t.key !== 'total').map((status) => (
                                    <div key={status.key} className="flex flex-col items-center">
                                        <span className={getTaskStatusBadge(status.key)}>
                                            {formatTaskStatus(status.key)}: {stat[status.key as keyof TaskStats]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                {taskStatuses.map((status) => {
                    const StatusIcon = status.Icon
                    const totalCount = taskStatistics.reduce((sum, stat) => sum + stat[status.key as keyof TaskStats], 0)

                    return (
                        <div
                            key={status.key}
                            className={`bg-gradient-to-br rounded-xl p-6 text-white ${status.color} cursor-pointer transition-transform duration-300 hover:scale-105 shadow-md`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className={`${status.textClass} font-medium`}>{formatTaskStatus(status.key)}</span>
                                <StatusIcon size={22} className={status.iconClass} />
                            </div>
                            <div className="text-3xl font-bold">{totalCount}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
