"use client"

import React, { useEffect, useState, useMemo } from "react"
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
    BarChart,
    Bar
} from "recharts"
import axios from "@/config/axiosConfig" // Đảm bảo đường dẫn đúng
import { useProject } from "@/app/(context)/ProjectContext"
import { format, parseISO, isValid } from "date-fns"

// --- 1. Interfaces ---

interface BasicTask {
    taskId: number
    projectId: number
    title: string
    status: string
    priority: number
    assigneeId?: string
    assignee?: string
    createdAt: string
    deadline?: string
}

// Interface Team đơn giản hóa (từ API userRole)
interface TeamSimple {
    teamId: string // Guid trả về từ BE thường là string
    teamName: string
    leader: {
        leaderId: string
        leaderName: string
    }
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
// Config mapping để render động
const chartConfig = [
    { key: "done", label: "Done", color: STATUS_COLORS["done"] },
    { key: "inProgress", label: "In Progress", color: STATUS_COLORS["in progress"] },
    { key: "todo", label: "Todo", color: STATUS_COLORS["todo"] },
    { key: "cancel", label: "Cancel", color: STATUS_COLORS["cancel"] },
    { key: "expired", label: "Expired", color: STATUS_COLORS["expired"] },
]
// Config cho Priority (để map ra option)
const PRIORITY_CONFIG = [
    { value: 1, label: "High" },
    { value: 2, label: "Medium" },
    { value: 3, label: "Low" },
]

const normalizeStatus = (status: string) => status ? status.toLowerCase().trim() : "unknown"

// Tooltip Custom cho PieChart
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
    const { project_name, projectRole: contextRole } = useProject()

    // --- State Data ---
    const [loading, setLoading] = useState(false)
    const [allProjectTasks, setAllProjectTasks] = useState<BasicTask[]>([]) // Cache toàn bộ task của Project (cho PM)
    const [tasks, setTasks] = useState<BasicTask[]>([]) // Task đang hiển thị trên UI
    const [teams, setTeams] = useState<TeamSimple[]>([])
    const [apiRole, setApiRole] = useState<string>("") // Role lấy từ API

    // --- State Filter ---
    const [selectedTeamId, setSelectedTeamId] = useState<string>("ALL")
    const [selectedMemberId, setSelectedMemberId] = useState<string>("ALL")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
    const [startDateFilter, setStartDateFilter] = useState<string>("")
    const [endDateFilter, setEndDateFilter] = useState<string>("")

    // Ưu tiên lấy Role từ API trả về, nếu chưa có thì dùng Context
    const currentRole = apiRole || contextRole;
    const isManager = currentRole === "Leader" || currentRole === "Project Manager";

    // --- 1. Fetch Initial Data (Khi load trang) ---
    useEffect(() => {
        if (!projectId) return
        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await axios.get(`tasks/userRole/${projectId}`)

                // Lưu dữ liệu gốc
                setAllProjectTasks(res.data.tasks || [])
                setTasks(res.data.tasks || []) // Mặc định hiển thị tất cả

                // Lưu thông tin Teams và Role
                if (res.data.teams) setTeams(res.data.teams)
                if (res.data.projectRole) setApiRole(res.data.projectRole)

            } catch (error) {
                console.error("Error fetching chart data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [projectId, project_name])

    // --- 2. Handle Change Team (Gọi API mới) ---
    useEffect(() => {
        // Chỉ PM mới có quyền chọn Team
        if (currentRole !== "Project Manager") return;

        const handleTeamChange = async () => {
            setLoading(true)
            try {
                if (selectedTeamId === "ALL") {
                    // Nếu chọn All Teams -> Reset về dữ liệu gốc đã cache
                    setTasks(allProjectTasks)
                } else {
                    // Gọi API lấy task theo Team
                    console.log("Fetching tasks for team:", selectedTeamId)
                    const res = await axios.get(`tasks/${projectId}/byTeam`, {
                        params: {
                            leaderId: selectedTeamId
                        }
                    })
                    console.log("API Response:", res.data);
                    setTasks(res.data || [])
                }
                // Reset filter member khi đổi team để tránh conflict
                setSelectedMemberId("ALL")
            } catch (error: any) {
                console.error("Error fetching team tasks:", error)

                // Log chi tiết lỗi để debug
                if (error.response) {
                    console.log("Status:", error.response.status);
                    console.log("Data:", error.response.data);
                }
                setTasks([])
            } finally {
                setLoading(false)
            }
        }

        handleTeamChange()
    }, [selectedTeamId, projectId, currentRole]) // Bỏ allProjectTasks ra để tránh loop không cần thiết

    // --- 3. Filter Logic (Client Side) ---

    // Lấy danh sách Member có trong danh sách tasks hiện tại để hiển thị Dropdown
    const uniqueMembers = useMemo(() => {
        const memberMap = new Map<string, string>()
        tasks.forEach(t => {
            if (t.assigneeId && t.assignee) {
                memberMap.set(t.assigneeId, t.assignee)
            }
        })
        return Array.from(memberMap.entries()).map(([id, name]) => ({ id, name }))
    }, [tasks])

    const filteredTasks = useMemo(() => {
        let result = [...tasks]

        // Filter Member
        if (selectedMemberId !== "ALL") {
            result = result.filter(t => t.assigneeId === selectedMemberId)
        }

        // Filter Status
        if (statusFilter !== "ALL") {
            result = result.filter(t => normalizeStatus(t.status) === normalizeStatus(statusFilter))
        }

        // Filter Priority
        if (priorityFilter !== "ALL") {
            result = result.filter(t => t.priority === Number(priorityFilter))
        }

        // Filter Start Date
        if (startDateFilter) {
            const start = new Date(startDateFilter)
            if (isValid(start)) {
                result = result.filter(t => new Date(t.createdAt) >= start)
            }
        }

        // Filter End Date
        if (endDateFilter) {
            const end = new Date(endDateFilter)
            if (isValid(end)) {
                // Set end date to end of day
                end.setHours(23, 59, 59, 999);
                result = result.filter(t => t.deadline ? new Date(t.deadline) <= end : false)
            }
        }

        return result
    }, [tasks, selectedMemberId, statusFilter, priorityFilter, startDateFilter, endDateFilter])

    // --- 5. Dynamic Filter Options ---

    // Lấy danh sách Status có thật trong tasks hiện tại
    const availableStatuses = useMemo(() => {
        // Nếu chưa có task nào, trả về rỗng hoặc mặc định
        if (!tasks.length) return [];

        const uniqueStatus = new Set(tasks.map(t => normalizeStatus(t.status)));

        // Lọc chartConfig chỉ lấy những status có trong uniqueStatus
        return chartConfig.filter(config => uniqueStatus.has(normalizeStatus(config.label)));
    }, [tasks]);

    // Lấy danh sách Priority có thật trong tasks hiện tại
    const availablePriorities = useMemo(() => {
        if (!tasks.length) return [];

        const uniquePriority = new Set(tasks.map(t => t.priority));

        return PRIORITY_CONFIG.filter(config => uniquePriority.has(config.value));
    }, [tasks]);

    // Pie Chart Data
    const pieData = useMemo(() => {
        const counts: Record<string, number> = {}
        filteredTasks.forEach(t => {
            let displayStatus = t.status || "Unknown"
            // Capitalize first letter for display
            displayStatus = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1).toLowerCase();
            counts[displayStatus] = (counts[displayStatus] || 0) + 1
        })

        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key]
        }))
    }, [filteredTasks])

    // Area Chart Data (Timeline)
    const timelineData = useMemo(() => {
        const timelineMap: Record<string, any> = {}
        const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        sortedTasks.forEach(t => {
            if (!t.createdAt) return;
            const dateKey = format(new Date(t.createdAt), "yyyy-MM-dd")

            if (!timelineMap[dateKey]) {
                timelineMap[dateKey] = { date: dateKey, todo: 0, inProgress: 0, done: 0, cancel: 0, expired: 0 }
            }

            const st = normalizeStatus(t.status)
            if (st.includes("todo")) timelineMap[dateKey].todo += 1
            else if (st.includes("progress")) timelineMap[dateKey].inProgress += 1
            else if (st.includes("done")) timelineMap[dateKey].done += 1
            else if (st.includes("cancel")) timelineMap[dateKey].cancel += 1
            else if (st.includes("expired")) timelineMap[dateKey].expired += 1
        })

        return Object.values(timelineMap)
    }, [filteredTasks])

    // Bar Chart Data (Member Performance)
    // Tính toán dựa trên filteredTasks hiện tại
    const memberPerformanceData = useMemo(() => {
        const memberMap: Record<string, { name: string, done: number, todo: number, inProgress: number, expired: number, total: number }> = {}

        filteredTasks.forEach(t => {
            if (!t.assigneeId || !t.assignee) return; // Bỏ qua task ko có assignee

            if (!memberMap[t.assigneeId]) {
                memberMap[t.assigneeId] = {
                    name: t.assignee,
                    done: 0,
                    todo: 0,
                    inProgress: 0,
                    expired: 0,
                    total: 0
                }
            }

            const stats = memberMap[t.assigneeId];
            stats.total += 1;
            const st = normalizeStatus(t.status);

            if (st.includes("done")) stats.done += 1;
            else if (st.includes("todo")) stats.todo += 1;
            else if (st.includes("progress")) stats.inProgress += 1;
            else if (st.includes("expired")) stats.expired += 1;
        });

        return Object.values(memberMap).map(m => ({
            name: m.name,
            done: m.total ? (m.done / m.total) * 100 : 0,
            todo: m.total ? (m.todo / m.total) * 100 : 0,
            progress: m.total ? (m.inProgress / m.total) * 100 : 0,
            expired: m.total ? (m.expired / m.total) * 100 : 0,
        }));

    }, [filteredTasks])

    const handleNavigateWithStatus = (statusLabel: string) => {
        let query = `status=${encodeURIComponent(statusLabel)}`;

        if (selectedMemberId !== "ALL") {
            query += `&assignee=${encodeURIComponent(selectedMemberId)}`;
        }
        window.location.hash = `list?${query}`;
    }

    // --- Render ---

    if (loading && tasks.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
                <div className="text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
            </div>
        )
    }

    if (!tasks.length && !loading) {
        return (
            <div className="p-6 bg-white rounded-lg border text-center text-gray-500">
                Không tìm thấy task nào trong bộ lọc hiện tại.
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header & Title */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
                <h2 className="text-xl font-bold text-gray-800">
                    {currentRole === "Member" ? "My Performance" : "Project Dashboard"}
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full">
                    {currentRole} View
                </span>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">

                {/* Team Filter (Only PM) */}
                {currentRole === "Project Manager" && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Team</label>
                        <select
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                        >
                            <option value="ALL">All Teams</option>
                            {teams.map(team => (
                                <option value={team.teamId} key={team.teamId}>
                                    {team.teamName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Member Filter (Manager Only) */}
                {isManager && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Member</label>
                        <select
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
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

                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Status</label>
                    <select
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>

                        {/* Render dynamic status */}
                        {availableStatuses.map((status) => (
                            <option key={status.key} value={status.label}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority Filter */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Priority</label>
                    <select
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                    >
                        <option value="ALL">All Priority</option>

                        {/* Render dynamic priority */}
                        {availablePriorities.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Filters */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">From Date</label>
                    <input
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={startDateFilter}
                        onChange={e => setStartDateFilter(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">To Date</label>
                    <input
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={endDateFilter}
                        onChange={e => setEndDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Pie Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-md font-bold text-gray-800 mb-4 text-center">Status Distribution</h3>
                    <div className="flex-1">
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
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    labelLine={true} // Hiển thị đường kẻ dẫn đến label cho rõ ràng
                                    onClick={(data) => {
                                        handleNavigateWithStatus(data.name);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {pieData.map((entry, index) => {
                                        const stKey = normalizeStatus(entry.name)
                                        const color = Object.keys(STATUS_COLORS).find(k => stKey.includes(k))
                                            ? STATUS_COLORS[Object.keys(STATUS_COLORS).find(k => stKey.includes(k))!]
                                            : COLORS[index % COLORS.length]
                                        return <Cell key={`cell-${index}`} fill={color} />
                                    })}
                                </Pie>

                                {/* Thêm wrapperStyle zIndex để Tooltip luôn nổi lên trên cùng */}
                                <Tooltip
                                    content={<CustomPieTooltip />}
                                    wrapperStyle={{ zIndex: 1000 }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Area Chart (Timeline) */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-md font-bold text-gray-800 mb-4 text-center">Task Creation Timeline</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    {/* Render động các Gradient dựa trên config */}
                                    {chartConfig.map((item) => (
                                        <linearGradient key={item.key} id={`color-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={item.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={item.color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
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

                                <Legend verticalAlign="top" height={36} />

                                {/* Render động các Area dựa trên config */}
                                {/* Render động các Area dựa trên config */}
                                {chartConfig.map((item) => (
                                    <Area
                                        key={item.key}
                                        type="monotone"
                                        dataKey={item.key}
                                        name={item.label}
                                        // XÓA DÒNG NÀY ĐI HOẶC ĐỔI THÀNH null
                                        // stackId="1" 
                                        stroke={item.color}
                                        fill={`url(#color-${item.key})`}
                                        fillOpacity={0.3} // Giảm độ đậm để các vùng đè lên nhau vẫn nhìn thấy được
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Bar Chart: Member Performance (Chỉ hiển thị nếu là Manager và có nhiều hơn 1 người) */}
            {isManager && memberPerformanceData.length > 0 && (
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-md font-bold mb-4 text-center text-gray-800">
                        Member Completion Rate (%)
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={memberPerformanceData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" domain={[0, 100]} unit="%" />
                            <YAxis dataKey="name" type="category" width={120} style={{ fontSize: '12px', fontWeight: 500 }} />
                            <Tooltip
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar dataKey="done" name="Done" stackId="a" fill="#4ade80" barSize={20} />
                            <Bar dataKey="progress" name="In Progress" stackId="a" fill="#facc15" barSize={20} />
                            <Bar dataKey="todo" name="Todo" stackId="a" fill="#60a5fa" barSize={20} />
                            <Bar dataKey="expired" name="Expired" stackId="a" fill="#f87171" barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Summary Footer */}
            <div className="text-right text-sm text-gray-500 italic">
                Displaying {filteredTasks.length} tasks based on current filters.
            </div>
        </div>
    )
}

export default React.memo(ChartViewComponent)