"use client";
import { useEffect, useState, useMemo } from "react";
import { Calendar, AlertTriangle, Clock, Search } from "lucide-react";
import axios from "@/config/axiosConfig";
import { useProject } from "@/app/(context)/ProjectContext";
import type { BasicTask } from "@/utils/ITask";
import TaskSupport from "../TaskSupport";
import { taskStatus, baseTaskStatus } from "@/utils/statusUtils";
import ColoredAvatar from "../ColoredAvatar";
import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


const PAGE_SIZE = 10;

const TaskView = ({ projectId }: { projectId: number }) => {
    const { project_name } = useProject();
    const [tasks, setTasks] = useState<BasicTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterAssignee, setFilterAssignee] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<BasicTask | null>(null);
    const [role, setRole] = useState(true);

    const getStatusColor = (status: string) => {
        const s = baseTaskStatus.find(
            x => x.name.toLowerCase() === status.toLowerCase()
        );
        return s?.color ?? "#6B7280";
    };

    const fetchUserRole = async (projectId: number) => {
        try {
            const response = await axios.get(`/users/role/${projectId}`);
            console.log("User role tải về:", response.data);
            if (response.data == "Member")
                setRole(false);
            else
                setRole(true);
        } catch (err) {
            console.error("Fail to load user role:", err);
        }
    };

    const fetchTasks = async (projectId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`/tasks/near-deadline/${projectId}`);
            console.log("Tasks tải về:", response.data);
            setTasks(response.data);
        } catch (err) {
            console.error("Fail to load tasks:", err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (project_name) {
            const id = Number(project_name);
            if (!isNaN(id)) {
                fetchTasks(id);
                fetchUserRole(id);
            }
        }
    }, [project_name]);

    const now = new Date();
    const detectDeadline = (deadline: string) => {
        if (!deadline) return "N/A";
        const d = new Date(deadline);
        if (d.getTime() < now.getTime()) {
            return "Expired";
        }
        const isToday =
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();
        if (isToday) return "Today";
        const diffHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours <= 24) return "Near Deadline";
        return d.toLocaleString();
    };

    const filteredTasks = useMemo(() => {
        return tasks
            .filter((t) =>
                (t.title + t.description)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
            .filter((t) =>
                filterStatus ? t.status.toLowerCase() === filterStatus.toLowerCase() : true
            )
            .filter((t) =>
                filterAssignee === "all" || filterAssignee === ""
                    ? true
                    : t.assigneeId?.toString() === filterAssignee
            )
    }, [tasks, searchTerm, filterStatus, filterAssignee]);

    const totalPages = Math.ceil(filteredTasks.length / PAGE_SIZE);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleOpenSupport = (task: BasicTask) => {
        setSelectedTask(task);
        setIsSupportOpen(true);
    };

    return (
        <div className=" max-w-7xl mx-auto">
            <div className="bg-white p-4 shadow flex bg-dynamic">

                <div className="flex items-center gap-2 border rounded-lg mr-4">
                    <Search size={13} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search task..."
                        className="w-full outline-none text-base"
                        value={searchTerm}
                        onChange={(e) => {
                            setCurrentPage(1);
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setCurrentPage(1);
                        setFilterStatus(e.target.value);
                    }}
                    className="border rounded-lg px-3 py-2 text-base mr-4"
                >
                    <option value="">All Status</option>
                    <option value="Todo">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Bug">Bug</option>
                </select>

                {
                    role && (
                        <Select
                            value={filterAssignee}
                            onValueChange={(value) => {
                                setFilterAssignee(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Assignees" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All Assignees</SelectItem>

                                {Array.from(
                                    new Map(
                                        tasks.map((t) => [t.assigneeId, t])
                                    ).values()
                                ).map((t) => (
                                    <SelectItem
                                        key={t.assigneeId}
                                        value={t.assigneeId?.toString() || "unknown"}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ColoredAvatar
                                                id={t.assigneeId || "N/A"}
                                                name={t.assignee}
                                                size="sm"
                                            />
                                            {t.assignee}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
            </div>

            <div className=" bg-white rounded-lg shadow overflow-hidden">
                <div className="grid font-semibold p-3 border-b bg-gray-100 text-base" style={{
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr 1fr",
                }}>
                    <div>Name</div>
                    <div className="">Status</div>
                    <div>Assignee</div>
                    <div className="text-center">Deadline</div>
                    <div className="text-center">Created At</div>
                    <div className="text-center">Action</div>
                </div>

                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading tasks...</div>
                ) : paginatedTasks.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No tasks found.</div>
                ) : (
                    paginatedTasks.map((t) => (
                        <div
                            key={t.taskId}
                            className="grid p-3 border-b text-base items-center hover:bg-gray-50 transition min-h-[50px]"
                            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr 1fr" }}
                        >
                            <div className="font-semibold break-words">{t.title}</div>

                            <div className="flex items-left gap-2">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getStatusColor(t.status) }}
                                ></span>
                                <span className="capitalize text-sm">{t.status}</span>
                            </div>

                            <div className="text-sm break-words pr-2 flex">
                                <ColoredAvatar
                                    key={t.assigneeId}
                                    id={t.assigneeId || "N/A"}
                                    name={t.assignee}
                                    size="sm"
                                    src={t.avatarUrl}
                                />
                                <p className="pl-2">{t.assignee || "N/A"}</p>
                            </div>

                            <div className="text-center">
                                <span
                                    className={`text-sm ${detectDeadline(t.deadline) === "Expired"
                                        ? "text-red-600 font-medium"
                                        : detectDeadline(t.deadline) === "Near Deadline"
                                            ? "text-yellow-600 font-medium"
                                            : detectDeadline(t.deadline) === "Today"
                                                ? "text-blue-600 font-semibold"
                                                : "text-gray-700"
                                        }`}
                                >
                                    {detectDeadline(t.deadline)}
                                </span>
                            </div>

                            <div className="text-center text-gray-500 text-sm px-1">
                                {new Date(t.createdAt).toLocaleString()}
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={() => handleOpenSupport(t)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs transition"
                                >
                                    Support
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1 rounded border transition ${currentPage === p
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white hover:bg-gray-100 text-gray-700"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            <TaskSupport
                open={isSupportOpen}
                onClose={() => setIsSupportOpen(false)}
                projectId={project_name ?? ""}
                task={selectedTask}
            />
        </div>
    );
};

export default TaskView;
