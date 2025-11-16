"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

const formatShortDate = (date) => {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    })
}

const differenceInDays = (date1, date2) => {
    const diff = date1.getTime() - date2.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const addDays = (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

const mockTasks = [
    { taskId: 1, title: "Design UI mockups", status: "completed", assigneeName: "Alice", createdAt: new Date(2024, 10, 1), deadline: new Date(2024, 10, 10), sprintId: 1 },
    { taskId: 2, title: "Setup project repository", status: "completed", assigneeName: "Bob", createdAt: new Date(2024, 10, 2), deadline: new Date(2024, 10, 5), sprintId: 1 },
    { taskId: 3, title: "Create database schema", status: "completed", assigneeName: "Charlie", createdAt: new Date(2024, 10, 3), deadline: new Date(2024, 10, 12), sprintId: 1 },
    { taskId: 4, title: "Implement authentication", status: "in-progress", assigneeName: "Bob", createdAt: new Date(2024, 10, 5), deadline: new Date(2024, 10, 18), sprintId: 1 },

    { taskId: 5, title: "API endpoint development", status: "in-progress", assigneeName: "Charlie", createdAt: new Date(2024, 10, 10), deadline: new Date(2024, 10, 25), sprintId: 2 },
    { taskId: 6, title: "Frontend component library", status: "in-progress", assigneeName: "Alice", createdAt: new Date(2024, 10, 8), deadline: new Date(2024, 10, 22), sprintId: 2 },
    { taskId: 7, title: "User profile page", status: "pending", assigneeName: "Alice", createdAt: new Date(2024, 10, 12), deadline: new Date(2024, 10, 30), sprintId: 2 },
    { taskId: 8, title: "Email notification system", status: "pending", assigneeName: "Bob", createdAt: new Date(2024, 10, 15), deadline: new Date(2024, 11, 5), sprintId: 2 },

    { taskId: 9, title: "Performance optimization", status: "pending", assigneeName: "Charlie", createdAt: new Date(2024, 10, 18), deadline: new Date(2024, 11, 10), sprintId: 3 },
    { taskId: 10, title: "Unit tests for APIs", status: "pending", assigneeName: "Bob", createdAt: new Date(2024, 10, 20), deadline: new Date(2024, 11, 8), sprintId: 3 },
    { taskId: 11, title: "Integration testing", status: "pending", assigneeName: "Alice", createdAt: new Date(2024, 10, 22), deadline: new Date(2024, 11, 15), sprintId: 3 },
    { taskId: 12, title: "Documentation writing", status: "pending", assigneeName: "Charlie", createdAt: new Date(2024, 10, 25), deadline: new Date(2024, 11, 20), sprintId: 3 },

    { taskId: 13, title: "Mobile app version", status: "pending", assigneeName: "Alice", createdAt: new Date(2024, 10, 16), deadline: new Date(2024, 11, 30) },
]

const mockSprints = [
    { sprintId: 1, name: "Sprint 1: Foundation" },
    { sprintId: 2, name: "Sprint 2: Core Features" },
    { sprintId: 3, name: "Sprint 3: Polish & Release" },
]

const statusConfig = {
    pending: { barColor: "bg-slate-400" },
    "in-progress": { barColor: "bg-blue-500" },
    completed: { barColor: "bg-green-500" },
}

export default function Timeline() {
    const [viewMode, setViewMode] = useState("day")
    const { startDate, endDate, totalDays } = useMemo(() => {
        const allDates = mockTasks.flatMap((t) => [t.createdAt, t.deadline])
        const start = new Date(Math.min(...allDates.map((d) => d.getTime())))
        const end = new Date(Math.max(...allDates.map((d) => d.getTime())))
        const days = differenceInDays(end, start) + 1

        return {
            startDate: start,
            endDate: end,
            totalDays: Math.max(days, 7),
        }
    }, [])

    const getTimelineUnits = () => {
        const units = []

        if (viewMode === "day") {
            for (let i = 0; i < totalDays; i++) {
                const d = addDays(startDate, i)
                units.push({ label: formatShortDate(d), date: d })
            }
        }

        if (viewMode === "week") {
            let current = new Date(startDate)
            let index = 1

            while (current <= endDate) {
                const weekStart = new Date(current)
                const weekEnd = addDays(weekStart, 6)

                units.push({
                    label: `W${index} (${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)})`,
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

    /* ------------------------------
        Task bar positioning
    ------------------------------ */
    const getTaskBarPosition = (task) => {
        const taskStart = new Date(task.createdAt)
        const taskEnd = task.deadline ? new Date(task.deadline) : addDays(taskStart, 1)

        const startOffset = differenceInDays(taskStart, startDate)
        const duration = differenceInDays(taskEnd, taskStart) + 1

        let left = 0
        let width = 0

        // Day mode
        if (viewMode === "day") {
            left = (startOffset / totalDays) * 100
            width = (duration / totalDays) * 100
        }

        // Week mode
        if (viewMode === "week") {
            const totalWeeks = timelineUnits.length
            const startWeek = Math.floor(startOffset / 7)
            const taskWeeks = Math.max(1, Math.ceil(duration / 7))

            left = (startWeek / totalWeeks) * 100
            width = (taskWeeks / totalWeeks) * 100
        }

        // Month mode
        if (viewMode === "month") {
            const totalMonths = timelineUnits.length

            const startMonthIndex = timelineUnits.findIndex(
                (m) =>
                    m.month === taskStart.getMonth() &&
                    m.year === taskStart.getFullYear()
            )

            const endMonthIndex = timelineUnits.findIndex(
                (m) =>
                    m.month === taskEnd.getMonth() &&
                    m.year === taskEnd.getFullYear()
            )

            const taskMonths = Math.max(1, endMonthIndex - startMonthIndex + 1)

            left = (startMonthIndex / totalMonths) * 100
            width = (taskMonths / totalMonths) * 100
        }

        return { left, width }
    }

    /* ------------------------------
        Group tasks by sprint
    ------------------------------ */
    const tasksBySprint = useMemo(() => {
        const grouped = {}

        mockTasks.forEach((task) => {
            const sprintId = task.sprintId || "unscheduled"
            if (!grouped[sprintId]) grouped[sprintId] = []
            grouped[sprintId].push(task)
        })

        return grouped
    }, [])

    /* =============================
        Render
    ============================== */
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Project Timeline
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(startDate)} – {formatDate(endDate)}
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

            <Card className="border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <div className="w-64 flex-shrink-0 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
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
                                                    mockSprints.find(
                                                        (s) =>
                                                            s.sprintId ===
                                                            parseInt(sprintId)
                                                    )?.name
                                                }
                                            </p>
                                        </div>
                                        <div className="flex-1" />
                                    </div>
                                )}

                                {sprintTasks.map((task) => {
                                    const { left, width } = getTaskBarPosition(task)
                                    const status = statusConfig[task.status]

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
                                                    <Avatar className="w-4 h-4">
                                                        <AvatarFallback className="bg-slate-400 text-white text-[10px]">
                                                            {task.assigneeName.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {task.assigneeName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 relative py-3 px-2">
                                                <div className="relative h-8">
                                                    <div
                                                        className={`absolute top-0 h-8 rounded ${status.barColor} flex items-center justify-center`}
                                                        style={{
                                                            left: `${left}%`,
                                                            width: `${width}%`,
                                                        }}
                                                    >
                                                        <span className="text-xs text-white px-2 truncate">
                                                            {task.title}
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