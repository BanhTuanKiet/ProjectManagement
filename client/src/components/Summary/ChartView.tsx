"use client"

import React, { useEffect, useState, useMemo } from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import axios from "@/config/axiosConfig"
import { useProject } from "@/app/(context)/ProjectContext"
import { format } from "date-fns"

interface BasicTask {
    taskId: number
    projectId: number
    title: string
    status: string // "Todo", "In Progress", "Done", "Cancel", "Expired"
    priority: number
    assigneeId?: string
    assignee?: string
    createdAt: string
    deadline?: string
}

interface ApiResponse {
    tasks: BasicTask[]
    role: string // "Member" | "Leader" | "Project Manager" | "Admin"
}

interface ChartViewProps {
    projectId: string;
}

// --- 2. Config & Helpers ---
const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#fb923c", "#f87171"]
const STATUS_COLORS: Record<string, string> = {
    "done": "#4ade80",
    "todo": "#60a5fa",
    "in progress": "#facc15",
    "cancel": "#fb923c",
    "expired": "#f87171"
}

const normalizeStatus = (status: string) => status.toLowerCase().trim()

// Tooltip Custom
const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const d = payload[0]
        return (
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700">
                <p className="font-semibold text-sm">{d.name}</p>
                <p className="text-xs font-bold text-blue-300">{d.value} tasks</p>
            </div>
        )
    }
    return null
}

function ChartViewComponent({ projectId }: ChartViewProps) {
    const { project_name } = useProject()
    const [loading, setLoading] = useState(false)
    const [tasks, setTasks] = useState<BasicTask[]>([])
    const [role, setRole] = useState<string>("")
    const [selectedMemberId, setSelectedMemberId] = useState<string>("ALL")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
    const [startDateFilter, setStartDateFilter] = useState<string>("")
    const [endDateFilter, setEndDateFilter] = useState<string>("")


    useEffect(() => {
        if (!project_name) return
        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await axios.get(`tasks/userRole/${projectId}`)
                console.log("Chart Data Response:", res.data)
                setTasks(res.data.tasks || [])
                setRole(res.data.role)
            } catch (error) {
                console.error("Error fetching chart data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [project_name])


    // Lấy danh sách Unique Users cho Dropdown (Chỉ dành cho Leader/PM)
    const uniqueMembers = useMemo(() => {
        const members = new Map<string, string>()
        tasks.forEach(t => {
            if (t.assigneeId && t.assignee) {
                members.set(t.assigneeId, t.assignee)
            }
        })
        return Array.from(members.entries()).map(([id, name]) => ({ id, name }))
    }, [tasks])

    // Lọc task dựa trên User đang chọn (hoặc lấy hết nếu role là Member hoặc chọn ALL)
    const filteredTasks = useMemo(() => {
        let result = [...tasks]

        // Filter theo member
        if (role !== "Member" && selectedMemberId !== "ALL") {
            result = result.filter(t => t.assigneeId === selectedMemberId)
        }

        // Filter theo status
        if (statusFilter !== "ALL") {
            result = result.filter(t => normalizeStatus(t.status) === statusFilter.toLowerCase())
        }

        // Filter theo priority
        if (priorityFilter !== "ALL") {
            result = result.filter(t => t.priority === Number(priorityFilter))
        }

        // Filter theo startDate
        if (startDateFilter) {
            const start = new Date(startDateFilter)
            result = result.filter(t => new Date(t.createdAt) >= start)
        }

        // Filter theo endDate
        if (endDateFilter) {
            const end = new Date(endDateFilter)
            result = result.filter(t => t.deadline ? new Date(t.deadline) <= end : false)
        }

        return result
    }, [tasks, role, selectedMemberId, statusFilter, priorityFilter, startDateFilter, endDateFilter])

    // Tính toán dữ liệu cho Pie Chart (Thống kê theo Status)
    const pieData = useMemo(() => {
        const counts: Record<string, number> = {}
        filteredTasks.forEach(t => {
            // Chuẩn hóa status để tránh lỗi case sensitive (Todo vs todo)
            // ánh xạ status BE trả về thành key hiển thị
            let displayStatus = t.status || "Unknown"
            counts[displayStatus] = (counts[displayStatus] || 0) + 1
        })

        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key]
        }))
    }, [filteredTasks])

    const timelineData = useMemo(() => {
        const timelineMap: Record<string, any> = {}

        // Sắp xếp task theo ngày tạo tăng dần
        const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        sortedTasks.forEach(t => {
            const dateKey = format(new Date(t.createdAt), "yyyy-MM-dd")
            if (!timelineMap[dateKey]) {
                timelineMap[dateKey] = { date: dateKey, todo: 0, inProgress: 0, done: 0, cancel: 0, expired: 0 }
            }

            // Mapping status BE sang key của chart area
            const st = normalizeStatus(t.status)
            if (st.includes("todo")) timelineMap[dateKey].todo += 1
            else if (st.includes("progress")) timelineMap[dateKey].inProgress += 1
            else if (st.includes("done")) timelineMap[dateKey].done += 1
            else if (st.includes("cancel")) timelineMap[dateKey].cancel += 1
            else if (st.includes("expired")) timelineMap[dateKey].expired += 1
        })

        return Object.values(timelineMap)
    }, [filteredTasks])



    if (loading) return <div className="p-6 bg-white rounded-lg border">Đang tải dữ liệu...</div>
    if (!tasks.length && !loading) return <div className="p-6 bg-white rounded-lg border">Chưa có task nào trong dự án.</div>

    const isManager = role === "Leader" || role === "Project Manager"

    return (
        <div className="space-y-6 p-6">
            {/* Header & Filter Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex-1 flex justify-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {role === "Member" ? "Your Performance" : "Team Overview"}
                    </h2>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {/* Dropdown chỉ hiện nếu là Leader/PM và có thành viên */}
                {isManager && uniqueMembers.length > 0 && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 font-medium">Member:</label>
                        <select
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                        >
                            <option value="ALL">All Members</option>
                            {uniqueMembers.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                {/* Status */}
                <label className="text-sm text-gray-600 font-medium">Status:</label>
                <select
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All</option>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Cancel">Cancel</option>
                    <option value="Expired">Expired</option>
                </select>

                {/* Priority */}
                <label className="text-sm text-gray-600 font-medium">Priority:</label>
                <select
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                >
                    <option value="ALL">All</option>
                    <option value="1">high</option>
                    <option value="2">medium</option>
                    <option value="3">low</option>

                </select>

                {/* Start Date */}
                <label className="text-sm text-gray-600 font-medium">Start:</label>
                <input
                    type="date"
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    value={startDateFilter}
                    onChange={e => setStartDateFilter(e.target.value)}
                />

                {/* End Date */}
                <label className="text-sm text-gray-600 font-medium">End:</label>
                <input
                    type="date"
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    value={endDateFilter}
                    onChange={e => setEndDateFilter(e.target.value)}
                />
            </div>

            {/* Charts Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Pie Chart: Status Distribution */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">Status Distribution</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={60}
                                    paddingAngle={2}
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}                                >
                                    {pieData.map((entry, index) => {
                                        const stKey = normalizeStatus(entry.name)
                                        // Tìm màu tương ứng, nếu không có dùng màu mặc định trong mảng COLORS
                                        const color = Object.keys(STATUS_COLORS).find(k => stKey.includes(k))
                                            ? STATUS_COLORS[Object.keys(STATUS_COLORS).find(k => stKey.includes(k))!]
                                            : COLORS[index % COLORS.length]
                                        return <Cell key={`cell-${index}`} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Area Chart: Tasks Created Over Time */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">Tasks Created Timeline</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTodo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                                />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

                                <Area type="monotone" dataKey="done" name="Done" stackId="1" stroke="#4ade80" fill="url(#colorDone)" />
                                <Area type="monotone" dataKey="inProgress" name="In Progress" stackId="1" stroke="#facc15" fill="url(#colorInProgress)" />
                                <Area type="monotone" dataKey="todo" name="Todo" stackId="1" stroke="#60a5fa" fill="url(#colorTodo)" />
                                {/* Có thể thêm Cancel/Expired nếu muốn */}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* (Optional) Table view chi tiết nếu cần */}
            {isManager && (
                <div className="mt-4 text-sm text-gray-500 text-right">
                    * Showing {filteredTasks.length} tasks for {selectedMemberId === "ALL" ? "all members" : "selected member"}.
                </div>
            )}
        </div>
    )
}

export default React.memo(ChartViewComponent)