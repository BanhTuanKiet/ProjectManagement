"use client"

import { useEffect, useState } from "react"
import {
    Calendar,
    Users,
    BarChart3,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    CalendarX,
    MoreVertical,
    Plus,
    Settings,
    UserPlus,
    ChevronDown,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/app/(context)/ProjectContext"
import { ProjectBasic } from "@/utils/IProject"
import { formatDate } from "@/utils/dateUtils"
import { useTask } from "@/app/(context)/TaskContext"
import { BasicTask, TaskStats } from "@/utils/ITask"
import ColoredAvatar from "./ColoredAvatar"
import MemberList from "./MemberList"
import Overview from "./Summary/Overview"

export default function Summary() {
    const { projects, project_name, members } = useProject()
    const [project, setProject] = useState<ProjectBasic | undefined>()
    const [activeTab, setActiveTab] = useState<"overview" | "members">("overview")
    const { tasks } = useTask()
    const [mockTasks, setMockTasks] = useState<BasicTask[]>([])

    useEffect(() => {
        if (project_name) {
            const projectTemp = projects.find(p => p.projectId === Number(project_name))
            if (projectTemp) setProject(projectTemp)
        }
    }, [project_name, projects])

    useEffect(() => {
        if (project && tasks) setMockTasks(tasks)
    }, [project, tasks])

    const projectManager = members?.find(m => m.isOwner)
    const projectMembers = members?.filter(m => !m.isOwner)

    const totalTasks = mockTasks.length ?? 0
    const doneTasks = mockTasks.filter(t => t.status.toLocaleLowerCase() === "done").length
    const overallProgress = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0

    const roles = [
        { label: "Project Manager", value: "Project Manager", color: "bg-gray-100 text-gray-800" },
        { label: "Leader", value: "Leader", color: "bg-blue-100 text-blue-800" },
        { label: "Member", value: "Member", color: "bg-green-100 text-green-800" },
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-0">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Settings size={20} />
                                </button>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-4">{project?.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Created {formatDate(project?.startDate ?? "")}</span>
                                </div>

                                {projectManager && projectMembers && <MemberList object={{ projectManager, projectMembers }} />}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                Export
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                <Plus size={16} className="inline mr-1" />
                                New Task
                            </button>
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

                <div className="border-b border-gray-200 bg-white rounded-t-lg">
                    <div className="flex gap-8 px-6">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "overview"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <BarChart3 size={16} className="inline mr-2" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "members"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Users size={16} className="inline mr-2" />
                            Members
                        </button>
                    </div>

                    {activeTab === "overview" ? (
                        <Overview mockTasks={mockTasks} />
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                        <UserPlus size={16} className="inline mr-1" />
                                        Invite Member
                                    </button>
                                </div>
                            </div>

                            {/* <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Added By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined At
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {project.members.map((member) => {
                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                            {member.userName.charAt(0)}
                                                        </div>
                                                        <div className="font-medium text-gray-900">{member.userName}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{member.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{member.phoneNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div
                                                        className={`inline-flex items-center gap-2 rounded-lg border text-sm font-medium`}
                                                    >
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full justify-between bg-transparent"
                                                                >
                                                                    {member.role}
                                                                    <ChevronDown className="h-4 w-4 ml-2" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="z-50">
                                                                {roles.map((s) => (
                                                                    <DropdownMenuItem key={s.value}>
                                                                        <Badge className={s.color}>{s.label}</Badge>
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{member.addedBy}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{formatDateTime(member.joinedAt)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div> */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}