"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { useProject } from "@/app/(context)/ProjectContext"
import type { ProjectBasic } from "@/utils/IProject"
import { formatDate } from "@/utils/dateUtils"
import { useTask } from "@/app/(context)/TaskContext"
import type { BasicTask } from "@/utils/ITask"
import Overview from "./Overview"
import ChartView from "./ChartView"
import MemberList from "../MemberList"
import MoreHorizontalDropdown from '@/components/MorehorizonalDropdown'

export default function Summary() {
    const { projects, project_name, members } = useProject()
    const [project, setProject] = useState<ProjectBasic | undefined>()
    const { tasks } = useTask()
    const [mockTasks, setMockTasks] = useState<BasicTask[]>([])

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


    const totalTasks = mockTasks.length ?? 0
    const doneTasks = mockTasks.filter((t) => t.status.toLocaleLowerCase() === "done").length
    const overallProgress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

    return (
        <div className="min-h-screen bg-gray-50 p-0 bg-dynamic">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
                                <MoreHorizontalDropdown />
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
            </div>
        </div>
    )
}