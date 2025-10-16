"use client"

import { useState } from "react"
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
    Briefcase,
    Star,
    UserIcon,
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
interface Member {
    id: string
    userName: string
    email: string
    phoneNumber: string
    role: "Project Manager" | "Leader" | "Member"
    addedBy: string
    joinedAt: string
}

interface TaskStats {
    priority: number
    total: number
    todo: number
    inProgress: number
    done: number
    cancel: number
    expired: number
}

interface ProjectData {
    id: string
    name: string
    description: string
    createdById: string
    createdAt: string
    members: Member[]
    taskStats: TaskStats[]
    totalTasks: number
    completedTasks: number
}

const mockProject: ProjectData = {
    id: "1",
    name: "E-Commerce Platform Redesign",
    description:
        "Complete redesign of the e-commerce platform with focus on user experience, performance optimization, and mobile responsiveness.",
    createdById: "user-001",
    createdAt: "2025-01-15T08:00:00Z",
    totalTasks: 52,
    completedTasks: 28,
    members: [
        {
            id: "1",
            userName: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            phoneNumber: "+84 912 345 678",
            role: "Project Manager",
            addedBy: "System",
            joinedAt: "2025-01-15T08:00:00Z",
        },
        {
            id: "2",
            userName: "Trần Thị B",
            email: "tranthib@example.com",
            phoneNumber: "+84 923 456 789",
            role: "Leader",
            addedBy: "Nguyễn Văn A",
            joinedAt: "2025-01-16T10:30:00Z",
        },
        {
            id: "3",
            userName: "Lê Văn C",
            email: "levanc@example.com",
            phoneNumber: "+84 934 567 890",
            role: "Leader",
            addedBy: "Nguyễn Văn A",
            joinedAt: "2025-01-18T14:20:00Z",
        },
        {
            id: "4",
            userName: "Phạm Thị D",
            email: "phamthid@example.com",
            phoneNumber: "+84 945 678 901",
            role: "Member",
            addedBy: "Trần Thị B",
            joinedAt: "2025-01-20T09:15:00Z",
        },
        {
            id: "5",
            userName: "Hoàng Văn E",
            email: "hoangvane@example.com",
            phoneNumber: "+84 956 789 012",
            role: "Member",
            addedBy: "Trần Thị B",
            joinedAt: "2025-01-22T11:45:00Z",
        },
        {
            id: "6",
            userName: "Đặng Thị F",
            email: "dangthif@example.com",
            phoneNumber: "+84 967 890 123",
            role: "Member",
            addedBy: "Lê Văn C",
            joinedAt: "2025-01-25T16:00:00Z",
        },
    ],
    taskStats: [
        { priority: 1, total: 15, todo: 2, inProgress: 4, done: 7, cancel: 1, expired: 1 },
        { priority: 2, total: 20, todo: 3, inProgress: 5, done: 10, cancel: 1, expired: 1 },
        { priority: 3, total: 17, todo: 5, inProgress: 3, done: 11, cancel: 2, expired: 1 },
    ],
}

const statusConfig = {
    todo: { label: "To Do", icon: AlertCircle, color: "text-gray-500", bgColor: "bg-gray-400" },
    inProgress: { label: "In Progress", icon: Clock, color: "text-blue-500", bgColor: "bg-blue-500" },
    done: { label: "Done", icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-500" },
    cancel: { label: "Cancelled", icon: XCircle, color: "text-red-500", bgColor: "bg-red-400" },
    expired: { label: "Expired", icon: CalendarX, color: "text-orange-500", bgColor: "bg-orange-400" },
}

export default function Summary() {
    const [project] = useState<ProjectData>(mockProject)
    const [activeTab, setActiveTab] = useState<"overview" | "members">("overview")

    const overallProgress = Math.round((project.completedTasks / project.totalTasks) * 100)
    const createdDate = new Date(project.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    const getPriorityLabel = (priority: number) => {
        const labels = { 1: "High", 2: "Medium", 3: "Low" }
        return labels[priority as keyof typeof labels] || `Priority ${priority}`
    }

    const getPriorityColor = (priority: number) => {
        const colors = {
            1: "bg-red-500",
            2: "bg-orange-500",
            3: "bg-yellow-500",
        }
        return colors[priority as keyof typeof colors] || "bg-gray-500"
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const roles = [
        { label: "Project Manager", value: "Project Manager", color: "bg-gray-100 text-gray-800" },
        { label: "Leader", value: "Leader", color: "bg-blue-100 text-blue-800" },
        { label: "Member", value: "Member", color: "bg-green-100 text-green-800" },
    ]


    return (
        <div className="min-h-screen bg-gray-50 p-0">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Project Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Settings size={20} />
                                </button>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-4">{project.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Created {createdDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    <span>{project.members.length} members</span>
                                </div>
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

                    {/* Overall Progress Bar */}
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
                            <span>{project.completedTasks} completed</span>
                            <span>{project.totalTasks - project.completedTasks} remaining</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
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
                </div>

                {/* Content */}
                {activeTab === "overview" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Task Statistics by Priority */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">Task Statistics by Priority</h2>

                            {project.taskStats.map((stat) => {
                                const completionRate = Math.round((stat.done / stat.total) * 100)

                                return (
                                    <div key={stat.priority} className="bg-white rounded-lg border border-gray-200 p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(stat.priority)}`} />
                                                <h3 className="font-semibold text-gray-900">{getPriorityLabel(stat.priority)}</h3>
                                                <span className="text-sm text-gray-500">({stat.total} tasks)</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{completionRate}%</span>
                                        </div>

                                        {/* Progress Bar with 5 statuses */}
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                            <div className="h-full flex">
                                                <div
                                                    className={statusConfig.done.bgColor}
                                                    style={{ width: `${(stat.done / stat.total) * 100}%` }}
                                                />
                                                <div
                                                    className={statusConfig.inProgress.bgColor}
                                                    style={{ width: `${(stat.inProgress / stat.total) * 100}%` }}
                                                />
                                                <div
                                                    className={statusConfig.todo.bgColor}
                                                    style={{ width: `${(stat.todo / stat.total) * 100}%` }}
                                                />
                                                <div
                                                    className={statusConfig.cancel.bgColor}
                                                    style={{ width: `${(stat.cancel / stat.total) * 100}%` }}
                                                />
                                                <div
                                                    className={statusConfig.expired.bgColor}
                                                    style={{ width: `${(stat.expired / stat.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Status Breakdown - 5 statuses */}
                                        <div className="grid grid-cols-5 gap-3">
                                            {Object.entries(statusConfig).map(([key, config]) => {
                                                const StatusIcon = config.icon
                                                const count = stat[key as keyof typeof stat] as number

                                                return (
                                                    <div key={key} className="flex flex-col items-center">
                                                        <StatusIcon size={16} className={config.color} />
                                                        <div className="text-xs text-gray-500 mt-1 text-center">{config.label}</div>
                                                        <div className="text-sm font-semibold text-gray-900">{count}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Summary Cards */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">Summary</h2>

                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-blue-100">Total Tasks</span>
                                    <BarChart3 size={20} className="text-blue-200" />
                                </div>
                                <div className="text-3xl font-bold">{project.totalTasks}</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-green-100">Done</span>
                                    <CheckCircle2 size={20} className="text-green-200" />
                                </div>
                                <div className="text-3xl font-bold">{project.completedTasks}</div>
                                <div className="text-sm text-green-100 mt-1">{overallProgress}% of total</div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-blue-100">In Progress</span>
                                    <Clock size={20} className="text-blue-200" />
                                </div>
                                <div className="text-3xl font-bold">
                                    {project.taskStats.reduce((sum, stat) => sum + stat.inProgress, 0)}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-100">To Do</span>
                                    <AlertCircle size={20} className="text-gray-200" />
                                </div>
                                <div className="text-3xl font-bold">{project.taskStats.reduce((sum, stat) => sum + stat.todo, 0)}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-lg p-4 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <XCircle size={16} />
                                        <span className="text-xs text-red-100">Cancelled</span>
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {project.taskStats.reduce((sum, stat) => sum + stat.cancel, 0)}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-4 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CalendarX size={16} />
                                        <span className="text-xs text-orange-100">Expired</span>
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {project.taskStats.reduce((sum, stat) => sum + stat.expired, 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Members Tab - Table Layout */
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

                        {/* Table */}
                        <div className="overflow-x-auto">
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
