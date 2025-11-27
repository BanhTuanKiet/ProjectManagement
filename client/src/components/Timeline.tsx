// FULL UPDATED CODE WITH DAY-VIEW PAGINATION (21 DAYS PER PAGE)

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

type TimelineUnit =
    | { label: string; date?: Date }
    | { label: string; start?: Date; end?: Date }
    | { label: string; month?: number; year?: number }

const pageSize = 22
const basePixel = 40

export default function Timeline() {
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")
    const [sprints, setSprints] = useState<BasicSprint[]>()
    const { project_name } = useProject()
    const { tasks } = useTask()
    const { startDate, endDate, totalDays } = useTimelineDates(tasks)


    const [zoomLevel, setZoomLevel] = useState<number>(1)
    const widthMapRef = useRef<Record<number, number>>({})

    const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({})
    const toggleSprint = (id: string) => setCollapsedSprints((p) => ({ ...p, [id]: !p[id] }))
    const [page, setPage] = useState(0)

    useEffect(() => {
        setPage(0)
    }, [viewMode, startDate])

    useEffect(() => {
        const fetchSprint = async () => {
            if (!project_name) return
            try {
                const res = await axios.get(`/sprints/${project_name}`)
                setSprints(res.data)
            } catch (e) {
                console.error(e)
            }
        }
        fetchSprint()
    }, [project_name])

    const getTimelineUnits = (): TimelineUnit[] => {
        if (!startDate || !endDate) return []
        const units: TimelineUnit[] = []

        if (viewMode === "day") {
            for (let i = 0; i < totalDays; i++) {
                const d = addDays(startDate, i)
                units.push({ label: formatShortDate(d.toString()), date: d })
            }
        }

        if (viewMode === "week") {
            let current = new Date(startDate)
            while (current <= endDate) {
                const ws = new Date(current)
                const we = addDays(ws, 6)
                units.push({ label: `${formatShortDate(ws.toString())} - ${formatShortDate(we.toString())}`, start: ws, end: we })
                current = addDays(current, 7)
            }
        }

        if (viewMode === "month") {
            let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
            while (current <= endDate) {
                units.push({
                    label: current.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
                    month: current.getMonth(),
                    year: current.getFullYear(),
                })
                current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
            }
        }
        return units
    }

    const timelineUnits = useMemo(() => getTimelineUnits(), [viewMode, startDate, endDate, totalDays, zoomLevel])

    const totalPages = useMemo(() => {
        if (viewMode !== "day") return 1
        return Math.ceil(timelineUnits.length / pageSize)
    }, [timelineUnits, viewMode])

    const pagedUnits = useMemo(() => {
        if (viewMode !== "day") return timelineUnits
        const start = page * pageSize
        return timelineUnits.slice(start, start + pageSize)
    }, [timelineUnits, page, viewMode])

    const getTaskBarPosition = (task: BasicTask) => {
        const taskStart = task.createdAt ? new Date(task.createdAt) : new Date()
        const taskEnd = task.deadline ? new Date(task.deadline) : addDays(taskStart, 1)

        let left = 0
        let width = 0

        if (viewMode === "day") {
            let startOffset = differenceInDays(taskStart, startDate)
            const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1)

            // page offset
            startOffset = startOffset - page * pageSize

            // hide tasks not on this page
            if (startOffset < 0 || startOffset >= pageSize) {
                return { left: -9999, width: 0 }
            }

            const pxPerDay = basePixel * zoomLevel
            left = pxPerDay * startOffset
            const pxWidth = pxPerDay * duration
            widthMapRef.current[task.taskId] = pxWidth
            width = pxWidth
        }

        if (viewMode === "week") {
            const startOffset = differenceInDays(taskStart, startDate)
            const startWeek = Math.floor(startOffset / 7)
            const durationDays = Math.max(1, differenceInDays(taskEnd, taskStart) + 1)
            const taskWeeks = Math.max(1, Math.ceil(durationDays / 7))
            const total = Math.max(1, timelineUnits.length)
            left = (startWeek / total) * 100
            width = (taskWeeks / total) * 100
        }

        if (viewMode === "month") {
            const total = Math.max(1, timelineUnits.length)
            const sIdx = timelineUnits.findIndex((m) => "month" in m && m.month === taskStart.getMonth())
            const eIdx = timelineUnits.findIndex((m) => "month" in m && m.month === taskEnd.getMonth())
            const si = sIdx === -1 ? 0 : sIdx
            const ei = eIdx === -1 ? si : eIdx
            const months = Math.max(1, ei - si + 1)
            left = (si / total) * 100
            width = (months / total) * 100
        }

        return { left, width }
    }

    const tasksBySprint = useMemo(() => {
        const grouped: Record<string, BasicTask[]> = {}
            ; (tasks || []).forEach((t) => {
                const sid = t.sprintId?.toString() ?? "unscheduled"
                if (!grouped[sid]) grouped[sid] = []
                grouped[sid].push(t)
            })
        return grouped
    }, [tasks])

    const gridTemplate = () => {
        if (!pagedUnits || pagedUnits.length === 0) return ""
        if (viewMode === "day") {
            const px = basePixel * zoomLevel
            return `repeat(${pagedUnits.length}, ${px}px)`
        }
        return `repeat(${pagedUnits.length}, 1fr)`
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
            <div id="ProjectTimeline" className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Project Timeline</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {startDate ? formatDate(startDate.toString()) : "-"} – {endDate ? formatDate(endDate.toString()) : "-"}
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    {viewMode === "day" && (
                        <>
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                                className="cursor-pointer px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                Page {page + 1} / {totalPages}
                            </span>

                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage((p) => p + 1)}
                                className="cursor-pointer px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded disabled:opacity-40"
                            >
                                Next
                            </button>
                        </>
                    )}

                    <div className="flex gap-2">
                        {["day", "week", "month"].map((m) => (
                            <button
                                key={m}
                                onClick={() => setViewMode(m as "day" | "week" | "month")}
                                className={`cursor-pointer px-3 py-1 rounded text-sm font-medium ${viewMode === m
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-200 dark:bg-slate-700 dark:text-white"
                                    }`}
                            >
                                {m.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {viewMode === "day" && (
                        <>
                            <label className="text-xs text-slate-500 dark:text-slate-400">Zoom</label>
                            <select
                                value={zoomLevel}
                                onChange={(e) => setZoomLevel(Number(e.target.value))}
                                className="cursor-pointer px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 dark:text-white text-sm"
                            >
                                <option value={0.5}>50%</option>
                                <option value={0.75}>75%</option>
                                <option value={1}>100%</option>
                                <option value={1.5}>150%</option>
                                <option value={2}>200%</option>
                            </select>
                        </>
                    )}
                </div>
            </div>

            <Card className="border border-slate-200 dark:border-slate-800 py-0">
                <div id="TableTimeline" className="overflow-x-auto">
                    <div className="min-w-full">
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <div className="w-64 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex items-center">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">{tasks.length} Task(s)</p>
                            </div>

                            <div
                                className="flex-1 grid"
                                style={{ gridTemplateColumns: gridTemplate() }}
                            >
                                {pagedUnits.map((u, i) => (
                                    <div key={i} className="px-2 py-3 text-center border-r border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                                        {u.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {Object.entries(tasksBySprint).map(([sid, sprintTasks]) => (
                            <div key={sid}>
                                <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <div className="w-63 px-4 py-2 border-r border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {sid === 'unscheduled' ? "Unscheduled" : `Sprint - ${sid}`} {sprints?.find((s) => s.sprintId === parseInt(sid))?.name}
                                            <br />
                                            {sprintTasks.length} Task(s)
                                        </p>

                                        <button
                                            onClick={() => toggleSprint(sid)}
                                            className="cursor-pointer text-xs py-1 px-2 rounded bg-slate-200 dark:bg-slate-700"
                                        >
                                            {collapsedSprints[sid] ? ">" : "v"}
                                        </button>
                                    </div>
                                    <div className="flex-1" />
                                </div>

                                {!collapsedSprints[sid] &&
                                    sprintTasks.map((task) => {
                                        const { left, width } = getTaskBarPosition(task)

                                        return (
                                            <div key={task.taskId} className="flex border-b border-slate-100 dark:border-slate-800">
                                                <div className="w-63 px-4 py-2 border-r border-slate-200 dark:border-slate-800">
                                                    <p className="text-sm text-slate-900 dark:text-white mb-1 truncate">
                                                        TASK {task.taskId} - {task.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <ColoredAvatar id={task.assigneeId || ""} name={task.assignee} size="sm" />
                                                        <span className="text-xs text-muted-foreground font-medium truncate">{task.assignee}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 relative my-auto">
                                                    <div className="relative h-10">
                                                        <div className="absolute left-0 right-0 top-5 h-[2px] bg-slate-100 dark:bg-slate-800" />
                                                        <div
                                                            className={`cursor-pointer absolute top-1.5 h-8 rounded ${getStatusColor(task.status)} flex items-center`}
                                                            style={
                                                                viewMode === "day"
                                                                    ? { left: `${left}px`, width: `${width}px`, paddingLeft: 8, paddingRight: 8 }
                                                                    : { left: `${left}%`, width: `${width}%`, paddingLeft: 8, paddingRight: 8 }
                                                            }
                                                        >
                                                            <span className="text-xs dark:text-white truncate">{task.description || task.title}</span>
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