import { BasicTask, TaskStats } from '@/utils/ITask'
import { formatTaskStatus, getPriorityBadge, getPriorityLabel, getTaskStatusBadge } from '@/utils/statusUtils'
import { AlertCircle, BarChart3, CalendarX, CheckCircle2, Clock, XCircle } from 'lucide-react'
import React, { useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Area, AreaChart } from "recharts"
import { driver } from 'driver.js'
import axios from "@/config/axiosConfig";
import { useProject } from "@/app/(context)/ProjectContext"

const taskStatuses = [
    { key: 'total', color: 'from-purple-500 to-purple-600', Icon: BarChart3, textClass: 'text-purple-100', iconClass: 'text-purple-200' },
    { key: 'todo', color: 'from-blue-400 to-blue-500', Icon: AlertCircle, textClass: 'text-blue-100', iconClass: 'text-gray-200', bgColor: "bg-blue-400" },
    { key: 'inProgress', color: 'from-yellow-400 to-yellow-500', Icon: Clock, textClass: 'text-yellow-100', iconClass: 'text-yellow-200', bgColor: "bg-yellow-400" },
    { key: 'done', color: 'from-green-500 to-green-600', Icon: CheckCircle2, textClass: 'text-green-100', iconClass: 'text-green-200', bgColor: "bg-green-400" },
    { key: 'cancel', color: 'from-red-400 to-red-500', Icon: XCircle, textClass: 'text-red-100', iconClass: 'text-red-200', isSmall: true, bgColor: "bg-orange-400" },
    { key: 'expired', color: 'from-orange-400 to-orange-500', Icon: CalendarX, textClass: 'text-orange-100', iconClass: 'text-orange-200', isSmall: true, bgColor: "bg-red-400" },
]

const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700">
                <p className="font-semibold text-sm">{data.name}</p>
                <p className="text-xs font-bold text-blue-300">{data.value} tasks</p>
            </div>
        );
    }
    return null;
};

const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700">
                <p className="text-xs text-gray-300 mb-1">{payload[0].payload.date}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Overview({
    mockTasks
}: {
    mockTasks: BasicTask[]
}) {

    const handleNavigateWithStatus = (statusKey: string) => {
        if (statusKey === "inProgress")
            statusKey = "In Progress"
        if (statusKey === "todo")
            statusKey = "ToDo"
        const newHash = `list?status=${encodeURIComponent(statusKey)}`
        window.location.hash = newHash
    }

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

    const tasksByUser = mockTasks.reduce((acc, task) => {
        if (!acc[task.assignee]) {
            acc[task.assignee] = {
                user: task.assignee,
                total: 0,
                todo: 0,
                inProgress: 0,
                done: 0,
                cancel: 0,
                expired: 0,
            }
        }

        acc[task.assignee].total++

        const st = task.status.toLowerCase()
        if (st === "todo") acc[task.assignee].todo++
        else if (st === "in progress") acc[task.assignee].inProgress++
        else if (st === "done") acc[task.assignee].done++
        else if (st === "cancel") acc[task.assignee].cancel++
        else if (st === "expired") acc[task.assignee].expired++

        return acc
    }, {} as Record<string, any>)

    const tasksByUserByDate = mockTasks.reduce((acc, task) => {
        const date = new Date(task.createdAt).toISOString().split("T")[0];
        const user = task.assignee;

        if (!acc[user]) acc[user] = {};
        if (!acc[user][date]) {
            acc[user][date] = {
                date,
                todo: 0,
                inProgress: 0,
                done: 0,
                cancel: 0,
                expired: 0,
            };
        }

        const st = task.status.toLowerCase();
        acc[user][date][st === "in progress" ? "inProgress" : st]++;

        return acc;
    }, {} as Record<string, any>);

    const userStats = Object.values(tasksByUser)
    const { project_name, members } = useProject()
    const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#fb923c", "#f87171"];
    const [selectedUser, setSelectedUser] = React.useState<string>("");
    const [reportUrl, setReportUrl] = React.useState<string>("");

    const handleExportReport = async () => {
        try {
            const res = await axios.post("/reports/export", {
                responseType: "json",
                projectId: Number(project_name)
            });

            setReportUrl(res.data.url);
            alert("Tạo file & upload lên Cloudinary thành công!");
        } catch (err) {
            console.error(err);
            alert("Export thất bại");
        }
    };

    const handleSendReport = async () => {
        if (!reportUrl) return alert("Chưa có file report để gửi!");

        try {
            await axios.post("/reports/send", {
                fileUrl: reportUrl,
                projectId: Number(project_name)
            });

            alert("Gửi email thành công!");
        } catch (err) {
            console.error(err);
            alert("Gửi thất bại");
        }
    };


    useEffect(() => {
        if (userStats.length > 0 && !selectedUser) {
            setSelectedUser(userStats[0].user);
        }
    }, [userStats]);

    return (
        <div id="projectOverview" className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5">
            <div id="taskStatistics" className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Task Statistics by Priority</h2>
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={handleExportReport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Export CSV / Excel
                    </button>

                    <button
                        onClick={handleSendReport}
                        disabled={!reportUrl}
                        className={`px-4 py-2 text-white rounded-lg ${reportUrl ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Send Report
                    </button>
                </div>


                {taskStatistics.map((stat) => {
                    const completionRate = Math.round((stat.done / stat.total) * 100)

                    return (
                        <div key={stat.priority} className="bg-white rounded-lg border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${getPriorityBadge(stat.priority)}`} />
                                    <h3 className="font-semibold text-gray-900">{getPriorityLabel(stat.priority)}</h3>
                                    <span className="text-sm text-gray-500">({stat.total} tasks)</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{completionRate}%</span>
                            </div>

                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                <div className="h-full flex">
                                    {taskStatuses.filter(t => t.key !== 'total').map((status) => (
                                        <div
                                            key={status.key}
                                            className={status.bgColor}
                                            style={{
                                                width: stat[status.key as keyof TaskStats] > 0
                                                    ? `${(stat[status.key as keyof TaskStats] / stat.total) * 100}%`
                                                    : '1px'  // hoặc min-width nhỏ để không lỗi flex
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-3">
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

            <div id="taskSummary" className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
                {taskStatuses.map((status) => {
                    const StatusIcon = status.Icon

                    return (
                        <div
                            key={status.key}
                            onClick={() => status.key !== "total" && handleNavigateWithStatus(status.key)}
                            className={`bg-gradient-to-br rounded-lg p-6 text-white ${status.color} cursor-pointer transition-transform duration-300 hover:scale-105`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`${status.textClass}`}>{formatTaskStatus(status.key)}</span>
                                <StatusIcon size={20} className={status.iconClass} />
                            </div>
                            <div className="text-2xl font-bold">
                                {taskStatistics.reduce((sum, stat) => sum + stat[status.key as keyof TaskStats], 0)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}