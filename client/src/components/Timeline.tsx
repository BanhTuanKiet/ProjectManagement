"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { addDays, differenceInDays, formatDate, formatShortDate } from "@/utils/dateUtils"
import { BasicTask } from "@/utils/ITask"
import { getStatusColor } from "@/utils/statusUtils"
import { BasicSprint } from "@/utils/ISprint"
import axios from "@/config/axiosConfig"
import { useProject } from "@/app/(context)/ProjectContext"
import { useTask } from "@/app/(context)/TaskContext"
import ColoredAvatar from "./ColoredAvatar"
import useTimelineDates from "@/hooks/useTimelineDates"

// const mockTasks: BasicTask[] = [
//     // ---- Sprint 1 ----
//     {
//         taskId: 1,
//         projectId: 1,
//         title: "Project requirement analysis",
//         description: "Gather and document system requirements",
//         status: "completed",
//         priority: 1,
//         assigneeId: "u1",
//         assignee: "Alice",
//         createdBy: "Alice",
//         createdAt: new Date(2024, 9, 29).toISOString(),
//         deadline: new Date(2024, 10, 3).toISOString(),
//         sprintId: 1,
//     },
//     {
//         taskId: 2,
//         projectId: 1,
//         title: "Setup project workspace",
//         status: "completed",
//         priority: 2,
//         assigneeId: "u2",
//         assignee: "Bob",
//         createdBy: "Bob",
//         createdAt: new Date(2024, 9, 29).toISOString(),
//         deadline: new Date(2024, 9, 30).toISOString(),
//         sprintId: 1,
//     },

//     // ---- Sprint 2 ----
//     {
//         taskId: 3,
//         projectId: 1,
//         title: "Database ERD design",
//         status: "completed",
//         priority: 1,
//         assigneeId: "u3",
//         assignee: "Charlie",
//         createdBy: "Charlie",
//         createdAt: new Date(2024, 10, 6).toISOString(),
//         deadline: new Date(2024, 10, 8).toISOString(),
//         sprintId: 2,
//     },
//     {
//         taskId: 4,
//         projectId: 1,
//         title: "Setup initial database migrations",
//         status: "completed",
//         priority: 2,
//         assigneeId: "u2",
//         assignee: "Bob",
//         createdBy: "Bob",
//         createdAt: new Date(2024, 10, 7).toISOString(),
//         deadline: new Date(2024, 10, 11).toISOString(),
//         sprintId: 2,
//     },

//     // ---- Sprint 3 ----
//     {
//         taskId: 5,
//         projectId: 1,
//         title: "Project CRUD API",
//         status: "in-progress",
//         priority: 1,
//         assigneeId: "u1",
//         assignee: "Alice",
//         createdBy: "Alice",
//         createdAt: new Date(2024, 10, 13).toISOString(),
//         deadline: new Date(2024, 10, 17).toISOString(),
//         sprintId: 3,
//     },
//     {
//         taskId: 6,
//         projectId: 1,
//         title: "Project list UI",
//         status: "pending",
//         priority: 2,
//         assigneeId: "u3",
//         assignee: "Charlie",
//         createdBy: "Charlie",
//         createdAt: new Date(2024, 10, 14).toISOString(),
//         deadline: new Date(2024, 10, 19).toISOString(),
//         sprintId: 3,
//     },

//     // ---- Sprint 4 ----
//     {
//         taskId: 7,
//         projectId: 1,
//         title: "Task CRUD API",
//         status: "pending",
//         priority: 1,
//         assigneeId: "u2",
//         assignee: "Bob",
//         createdBy: "Bob",
//         createdAt: new Date(2024, 10, 20).toISOString(),
//         deadline: new Date(2024, 10, 25).toISOString(),
//         sprintId: 4,
//     },
//     {
//         taskId: 8,
//         projectId: 1,
//         title: "Drag and drop task board",
//         status: "pending",
//         priority: 3,
//         assigneeId: "u1",
//         assignee: "Alice",
//         createdBy: "Alice",
//         createdAt: new Date(2024, 10, 21).toISOString(),
//         deadline: new Date(2024, 10, 27).toISOString(),
//         sprintId: 4,
//     },

//     // ---- Sprint 5 ----
//     {
//         taskId: 9,
//         projectId: 1,
//         title: "Gantt chart backend API",
//         status: "pending",
//         priority: 1,
//         assigneeId: "u1",
//         assignee: "Alice",
//         createdBy: "Alice",
//         createdAt: new Date(2024, 10, 27).toISOString(),
//         deadline: new Date(2024, 11, 1).toISOString(),
//         sprintId: 5,
//     },
//     {
//         taskId: 10,
//         projectId: 1,
//         title: "Gantt chart UI integration",
//         status: "pending",
//         priority: 2,
//         assigneeId: "u3",
//         assignee: "Charlie",
//         createdBy: "Charlie",
//         createdAt: new Date(2024, 10, 28).toISOString(),
//         deadline: new Date(2024, 11, 3).toISOString(),
//         sprintId: 5,
//     },

//     // ---- Sprint 6 ----
//     {
//         taskId: 11,
//         projectId: 1,
//         title: "Analytics dashboard",
//         status: "pending",
//         priority: 2,
//         assigneeId: "u1",
//         assignee: "Alice",
//         createdBy: "Alice",
//         createdAt: new Date(2024, 11, 3).toISOString(),
//         deadline: new Date(2024, 11, 8).toISOString(),
//         sprintId: 6,
//     },
//     {
//         taskId: 12,
//         projectId: 1,
//         title: "Task statistics API",
//         status: "pending",
//         priority: 1,
//         assigneeId: "u2",
//         assignee: "Bob",
//         createdBy: "Bob",
//         createdAt: new Date(2024, 11, 4).toISOString(),
//         deadline: new Date(2024, 11, 9).toISOString(),
//         sprintId: 6,
//     },

//     // ---- Sprint 7 ----
//     {
//         taskId: 13,
//         projectId: 1,
//         title: "Member invitation flow",
//         status: "pending",
//         priority: 1,
//         assigneeId: "u3",
//         assignee: "Charlie",
//         createdBy: "Charlie",
//         createdAt: new Date(2024, 11, 10).toISOString(),
//         deadline: new Date(2024, 11, 12).toISOString(),
//         sprintId: 7,
//     },
//     {
//         taskId: 14,
//         projectId: 1,
//         title: "Role-based permissions",
//         status: "pending",
//         priority: 3,
//         assigneeId: "u1",
//         assignee: "Alice",
//         createdBy: "Alice",
//         createdAt: new Date(2024, 11, 11).toISOString(),
//         deadline: new Date(2024, 11, 17).toISOString(),
//         sprintId: 7,
//     },

//     // ---- Sprint 8 ----
//     {
//         taskId: 15,
//         projectId: 1,
//         title: "UI/UX polishing",
//         status: "pending",
//         priority: 2,
//         assigneeId: "u2",
//         assignee: "Bob",
//         createdBy: "Bob",
//         createdAt: new Date(2024, 11, 17).toISOString(),
//         deadline: new Date(2024, 11, 21).toISOString(),
//         sprintId: 8,
//     },

//     // ---- Sprint 9 ----
//     {
//         taskId: 16,
//         projectId: 1,
//         title: "System QA testing",
//         status: "pending",
//         priority: 3,
//         assigneeId: "u1",
//         assignee: "Alice",
//         createdBy: "Alice",
//         createdAt: new Date(2024, 11, 24).toISOString(),
//         deadline: new Date(2024, 11, 28).toISOString(),
//         sprintId: 9,
//     },

//     // ---- Sprint 10 ----
//     {
//         taskId: 17,
//         projectId: 1,
//         title: "Production deployment",
//         status: "pending",
//         priority: 1,
//         assigneeId: "u2",
//         assignee: "Bob",
//         createdBy: "Bob",
//         createdAt: new Date(2024, 11, 30).toISOString(),
//         deadline: new Date(2024, 11, 30).toISOString(),
//         sprintId: 10,
//     },
// ];

export default function Timeline() {
    const [viewMode, setViewMode] = useState("day")
    const [sprints, setSprints] = useState<BasicSprint[]>()
    const { project_name } = useProject()
    const { tasks } = useTask()
    const { startDate, endDate, totalDays } = useTimelineDates(tasks)

    useEffect(() => {
        const fetchSrpint = async () => {
            try {
                const response = await axios.get(`/sprints/${project_name}`)
                setSprints(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchSrpint()
    }, [project_name])

    const getTimelineUnits = () => {
        const units = []

        if (viewMode === "day") {
            for (let i = 0; i < totalDays; i++) {
                const d = addDays(startDate, i)
                units.push({ label: formatShortDate(d.toString()), date: d })
            }
        }

        if (viewMode === "week") {
            let current = new Date(startDate)
            let index = 1

            while (current <= endDate) {
                const weekStart = new Date(current)
                const weekEnd = addDays(weekStart, 6)

                units.push({
                    label: `W${index} (${formatShortDate(weekStart.toString())} - ${formatShortDate(weekEnd.toString())})`,
                    start: weekStart,
                    end: weekEnd,
                })

                current = addDays(current, 7)
                index++
            }
        }

        if (viewMode === "month") {
            let current = new Date(startDate)

            while (current <= endDate) {
                units.push({
                    label: current.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                    }),
                    month: current.getMonth(),
                    year: current.getFullYear(),
                })

                current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
            }
        }

        return units
    }

    const timelineUnits = useMemo(() => getTimelineUnits(), [viewMode, startDate, endDate])

    const getTaskBarPosition = (task: BasicTask) => {
        const taskStart = new Date(task.createdAt)
        const taskEnd = task.deadline ? new Date(task.deadline) : addDays(taskStart, 1)

        let left = 0
        let width = 0

        // DAY MODE
        if (viewMode === "day") {
            const startOffset = differenceInDays(taskStart, startDate)
            const duration = differenceInDays(taskEnd, taskStart) + 1

            const total = timelineUnits.length

            left = (startOffset / total) * 100
            width = (duration / total) * 100
        }

        // WEEK MODE
        if (viewMode === "week") {
            const startOffset = differenceInDays(taskStart, startDate)
            const startWeek = Math.floor(startOffset / 7)

            const durationDays = differenceInDays(taskEnd, taskStart) + 1
            const taskWeeks = Math.max(1, Math.ceil(durationDays / 7))

            const total = timelineUnits.length

            left = (startWeek / total) * 100
            width = (taskWeeks / total) * 100
        }

        // MONTH MODE
        if (viewMode === "month") {
            const total = timelineUnits.length

            const startIndex = timelineUnits.findIndex(
                (m) => m.month === taskStart.getMonth() && m.year === taskStart.getFullYear()
            )

            const endIndex = timelineUnits.findIndex(
                (m) => m.month === taskEnd.getMonth() && m.year === taskEnd.getFullYear()
            )

            const months = Math.max(1, endIndex - startIndex + 1)

            left = (startIndex / total) * 100
            width = (months / total) * 100
        }

        return { left, width }
    }


    const tasksBySprint = useMemo(() => {
        const grouped: Record<string, BasicTask[]> = {}

        tasks.forEach((task) => {
            const sprintId = task.sprintId?.toString() ?? "unscheduled"
            if (!grouped[sprintId]) grouped[sprintId] = []
            grouped[sprintId].push(task)
        })

        return grouped
    }, [tasks])

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Project Timeline
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(startDate.toString())} – {formatDate(endDate.toString())}
                    </p>
                </div>

                <div className="flex gap-2">
                    {["day", "week", "month"].map((m) => (
                        <button
                            key={m}
                            onClick={() => setViewMode(m)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${viewMode === m
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-slate-200 dark:bg-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
                                }`}
                        >
                            {m.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="border border-slate-200 dark:border-slate-800 py-0">
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <div className="w-64 flex-shrink-0 px-4 py-3 bg-slate-50 dark:bg-slate-900
                                border-r border-slate-200 dark:border-slate-800 flex items-center">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                                    Task
                                </p>
                            </div>

                            <div className="flex-1 flex">
                                {timelineUnits.map((u, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 px-2 py-3 text-center border-r border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400"
                                    >
                                        {u.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {Object.entries(tasksBySprint).map(([sprintId, sprintTasks]) => (
                            <div key={sprintId}>
                                {sprintId !== "unscheduled" && (
                                    <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                        <div className="w-64 flex-shrink-0 px-4 py-2 border-r border-slate-200 dark:border-slate-800">
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                {
                                                    (() => {
                                                        const sprint = sprints?.find(s => s.sprintId === parseInt(sprintId))
                                                        return sprint ? `Sprint ${sprint.sprintId} – ${sprint.name}` : null
                                                    })()
                                                }
                                            </p>
                                        </div>
                                        <div className="flex-1" />
                                    </div>
                                )}

                                {sprintTasks && sprintTasks?.map((task: BasicTask) => {
                                    const { left, width } = getTaskBarPosition(task)

                                    return (
                                        <div
                                            key={task.taskId}
                                            className="flex border-b border-slate-100 dark:border-slate-800"
                                        >
                                            <div className="w-64 flex-shrink-0 px-4 py-3 border-r border-slate-200 dark:border-slate-800">
                                                <p className="text-sm text-slate-900 dark:text-white mb-1">
                                                    {task.title}
                                                </p>

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
                                            </div>

<div className="flex-1 relative py-3 px-2">
    <div className="relative h-8">
        <div
            className={`absolute top-0 h-8 rounded ${getStatusColor(task.status)} flex items-center`}
            style={{
                left: `${left}%`,
                width: `${Math.max(width, 10)}%`,
            }}
        >
            <span className="text-xs px-2 break-words dark:text-white truncate">
                {task.createdAt}
            </span>
        </div>
    </div>
</div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}