"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

export default function Timeline() {
    const [viewMode, setViewMode] = useState("day")
    const [sprints, setSprints] = useState<BasicSprint[]>()
    const { project_name } = useProject()
    const { tasks } = useTask()
    const { startDate, endDate, totalDays } = useTimelineDates(tasks)

    // Store width for each task (day mode)
    const widthMapRef = useRef<Record<number, number>>({})

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

        // DAY MODE — pixel width
        if (viewMode === "day") {
            const startOffset = differenceInDays(taskStart, startDate)
            const duration = differenceInDays(taskEnd, taskStart) + 1

            left = 40 * startOffset
            widthMapRef.current[task.taskId] = 40 * duration
        }

        // WEEK MODE — % width
        if (viewMode === "week") {
            const startOffset = differenceInDays(taskStart, startDate)
            const startWeek = Math.floor(startOffset / 7)

            const durationDays = differenceInDays(taskEnd, taskStart) + 1
            const taskWeeks = Math.max(1, Math.ceil(durationDays / 7))

            const total = timelineUnits.length

            left = (startWeek / total) * 100
            width = (taskWeeks / total) * 100
        }

        // MONTH MODE — % width
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
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                                viewMode === m
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

                        {/* TIMELINE HEADER */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <div className="w-64 flex-shrink-0 px-4 py-3 bg-slate-50 dark:bg-slate-900
                                border-r border-slate-200 dark:border-slate-800 flex items-center">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                                    Task
                                </p>
                            </div>

                            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timelineUnits.length}, 1fr)` }}>
                                {timelineUnits.map((u, i) => (
                                    <div
                                        key={i}
                                        className="px-2 py-3 text-center border-r border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400"
                                        style={ viewMode === "day" ? { width: "40px" } : {} }
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

                                {sprintTasks.map((task: BasicTask) => {
                                    const { left, width } = getTaskBarPosition(task)

                                    return (
                                        <div
                                            key={task.taskId}
                                            className="flex border-b border-slate-100 dark:border-slate-800"
                                        >
                                            <div className="w-64 flex-shrink-0 px-4 py-2 border-r border-slate-200 dark:border-slate-800">
                                                <p className="text-sm text-slate-900 dark:text-white mb-1">
                                                    TASK {task.taskId} - {task.title}
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

                                            <div className="flex-1 relative my-auto">
                                                <div className="relative h-8">
                                                    <div
                                                        className={`absolute top-0 h-8 rounded ${getStatusColor(task.status)} flex items-center`}
                                                        style={{
                                                            left: `${left}px`,
                                                            width:
                                                                viewMode === "day"
                                                                    ? `${widthMapRef.current[task.taskId] || 0}px`
                                                                    : `${width}%`,
                                                        }}
                                                    >
                                                        <span className="text-xs px-2 break-words dark:text-white truncate">
                                                            {task.description}
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
