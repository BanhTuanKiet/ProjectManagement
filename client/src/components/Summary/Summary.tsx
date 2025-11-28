"use client"

import { useEffect, useState, useMemo } from "react"
import { Calendar, AlertTriangle, Clock } from "lucide-react"
import axios from '@/config/axiosConfig'
import { useProject } from "@/app/(context)/ProjectContext"
import type { ProjectBasic } from "@/utils/IProject"
import { formatDate } from "@/utils/dateUtils"
import { useTask } from "@/app/(context)/TaskContext"
import type { BasicTask } from "@/utils/ITask"
import Overview from "./Overview"
import ChartView from "./ChartView"
import MemberList from "../MemberList"
import SettingsPopup from "../SettingsPopup"
import TaskSupport from "../TaskSupport"

export default function Summary() {
    const { projects, project_name, members } = useProject()
    const [project, setProject] = useState<ProjectBasic | undefined>()
    const { tasks } = useTask()
    const [mockTasks, setMockTasks] = useState<BasicTask[]>([])

    // States để lưu trữ các task gần/đã hết hạn (lấy từ API)
    const [nearTasks, setNearTasks] = useState<BasicTask[]>([])
    const [isLoadingCritical, setIsLoadingCritical] = useState(false)

    // States cho TaskSupport Dialog
    const [isSupportOpen, setIsSupportOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<BasicTask | null>(null)

    useEffect(() => {
        if (project_name) {
            const projectTemp = projects.find((p) => p.projectId === Number(project_name))
            if (projectTemp) setProject(projectTemp)
        }
    }, [project_name, projects])

    useEffect(() => {
        if (project && tasks) {
            setMockTasks(tasks)
        }
    }, [project, tasks])

    const fetchCriticalTasks = async (projectId: number) => {
        setIsLoadingCritical(true)
        try {
            const response = await axios.get(`/tasks/near-deadline/${projectId}`)
            console.log("DATA: ", response)
            setNearTasks(response.data) // Lưu dữ liệu tổng hợp
        } catch (error) {
            console.error("Lỗi khi tải task gần hết hạn:", error)
            setNearTasks([])
        } finally {
            setIsLoadingCritical(false)
        }
    }

    useEffect(() => {
        if (project_name) {
            const projectIdNumber = Number(project_name)
            if (!isNaN(projectIdNumber)) {
                fetchCriticalTasks(projectIdNumber)
            }
        }
    }, [project_name])


    // --- 4. Tính toán Metrics và Phân loại Task ---

    const totalTasks = mockTasks.length ?? 0
    const doneTasks = mockTasks.filter((t) => t.status.toLocaleLowerCase() === "done").length
    const overallProgress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

    // Phân loại task Gần/Đã hết hạn từ dữ liệu API đã lọc (nearTasks)
    const { expiredTasks, nearDeadlineTasks } = useMemo(() => {
        const now = new Date().getTime()

        // Chỉ xử lý các task có Deadline hợp lệ
        const deadlineTasks = nearTasks.filter(t => t.deadline)

        // 1. Task Đã Quá Hạn (Deadline < Thời điểm hiện tại)
        const expired = deadlineTasks.filter(t => new Date(t.deadline).getTime() < now)

        // 2. Task Gần Hết Hạn (Deadline >= Thời điểm hiện tại)
        const near = deadlineTasks.filter(t => new Date(t.deadline).getTime() >= now)

        return { expiredTasks: expired, nearDeadlineTasks: near }
    }, [nearTasks])


    const handleOpenSupport = (task: BasicTask) => {
        setSelectedTask(task)
        setIsSupportOpen(true)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-0">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- 1. Phần Header & Tổng quan Dự án --- */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
                                <SettingsPopup />
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-4">{project?.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Created {formatDate(project?.startDate ?? "")}</span>
                                </div>

                                {project && members && (
                                    <MemberList
                                        project={project}
                                        members={members}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                            <span className="text-sm font-semibold text-gray-900">{overallProgress}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{doneTasks} done</span>
                            <span>{totalTasks - doneTasks} remaining</span>
                        </div>
                    </div>
                </div>

                <div id="overView" className="border-b border-gray-200 bg-white rounded-t-lg">
                    <Overview mockTasks={mockTasks} />
                </div>
                {project_name && (
                    <div id="chartView" className="border-b border-gray-200 bg-white rounded-b-lg">
                        <ChartView projectId={project_name} />
                    </div>
                )}

                {(isLoadingCritical || expiredTasks.length > 0 || nearDeadlineTasks.length > 0) && (
                    <div id="criticalTasks" className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">

                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-red-500" />
                            Critical Tasks
                        </h2>

                        {isLoadingCritical && (
                            <div className="text-center text-gray-500 py-4">
                                Loading critical tasks...
                            </div>
                        )}

                        {!isLoadingCritical && expiredTasks.length === 0 && nearDeadlineTasks.length === 0 && (
                            <div className="text-center text-gray-500 py-4 border-t">
                                There are no expired or near-deadline tasks.
                            </div>
                        )}

                        {!isLoadingCritical && (
                            <div
                                className={`grid gap-4 ${expiredTasks.length > 0 && nearDeadlineTasks.length > 0
                                    ? "grid-cols-1 md:grid-cols-2"
                                    : "grid-cols-1"
                                    }`}
                            >

                                {/* ===== EXPIRED TASKS ===== */}
                                {expiredTasks.length > 0 && (
                                    <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                                            <Clock size={18} /> Expired Tasks ({expiredTasks.length})
                                        </h3>

                                        <div className="max-h-64 overflow-y-auto pr-2">
                                            <ul className="space-y-3">
                                                {expiredTasks.map((t) => (
                                                    <li
                                                        key={t.taskId}
                                                        className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 text-sm"
                                                    >
                                                        <span className="font-semibold truncate">{t.title}</span>

                                                        <span className="text-gray-600 truncate">
                                                            {t.assignee ?? "N/A"}
                                                        </span>

                                                        <span className="font-medium">
                                                            {t.deadline ? new Date(t.deadline).toLocaleDateString() : "N/A"}
                                                        </span>

                                                        <button
                                                            onClick={() => handleOpenSupport(t)}
                                                            className="px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition"
                                                        >
                                                            Support
                                                        </button>
                                                    </li>

                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* ===== NEAR DEADLINE TASKS ===== */}
                                {nearDeadlineTasks.length > 0 && (
                                    <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                                            <AlertTriangle size={18} /> Near Deadline ({nearDeadlineTasks.length})
                                        </h3>

                                        <div className="max-h-64 overflow-y-auto pr-2">
                                            <ul className="space-y-3">
                                                {nearDeadlineTasks.map((t) => (
                                                    <li
                                                        key={t.taskId}
                                                        className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 text-sm text-yellow-800"
                                                    >
                                                        <span className="font-semibold truncate">
                                                            {t.title}
                                                        </span>

                                                        <span className="truncate">
                                                            {t.assignee ?? "N/A"}
                                                        </span>

                                                        <span>
                                                            {t.deadline
                                                                ? new Date(t.deadline).toLocaleDateString()
                                                                : "N/A"}
                                                        </span>

                                                        <button
                                                            onClick={() => handleOpenSupport(t)}
                                                            className="px-3 py-1 bg-yellow-600 text-white rounded-md text-xs hover:bg-yellow-700 transition"
                                                        >
                                                            Support
                                                        </button>
                                                    </li>

                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* TaskSupport Dialog */}
            <TaskSupport
                open={isSupportOpen}
                onClose={() => setIsSupportOpen(false)}
                projectId={project_name ?? ""}
                task={selectedTask}
            />
        </div>
    )
}