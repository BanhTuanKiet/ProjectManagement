// src/components/TrashView.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "@/config/axiosConfig";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Undo2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    getTaskStatusBadge,
    getPriorityBadge,
    getPriorityIcon,
    taskStatus,
} from "@/utils/statusUtils";
import TrashTable from "./TrashTable"; // Component bảng sẽ tạo ở bước 2
import { toast } from "react-toastify";
import { useProject } from "@/app/(context)/ProjectContext";

// Định nghĩa kiểu dữ liệu cho task đã xóa dựa trên response từ backend
interface DeletedTask {
    taskId: number;
    title: string;
    description: string | null;
    status: string;
    priority: number; // Backend trả về number
    assigneeId: string | null;
    assigneeName: string | null;
    createdBy: string;
    creatorName: string | null;
    changedAt: string;
}

interface TrashViewProps {
    projectId: number | string;
}

export default function TrashView({ projectId }: TrashViewProps) {
    const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
    const [filters, setFilters] = useState<Record<string, string>>({});
    const stableFilters = useMemo(() => filters, [filters.Status, filters.Priority, filters.AssigneeId]);

    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { project_name } = useProject();

    const [debouncedSearchQuery] = useDebounce(searchQuery, 500); // Debounce để tránh gọi API liên tục

    // Hàm gọi API để lấy danh sách task đã xóa
    const fetchDeletedTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const isSearchingOrFiltering = debouncedSearchQuery || Object.keys(filters).length > 0;
            let response;

            if (isSearchingOrFiltering) {
                const params = new URLSearchParams();
                if (debouncedSearchQuery) params.append("keyword", debouncedSearchQuery);
                for (const key in filters) {
                    if (filters[key]) params.append(key, filters[key]);
                }
                response = await axios.get(`/tasks/${Number(project_name)}/deleted/search`, { params });
            } else {
                response = await axios.get(`/tasks/${Number(project_name)}/deleted`);
            }

            console.log("Deleted tasks response:", response.data);
            setDeletedTasks(response.data);
        } catch (err) {
            console.error("Error fetching deleted tasks:", err);
        } finally {
            setIsLoading(false); // ✅ QUAN TRỌNG: tắt trạng thái loading để UI render
        }
    }, [projectId, filters, debouncedSearchQuery]);

    // useEffect để gọi API khi filter hoặc search query thay đổi
    useEffect(() => {
        fetchDeletedTasks();
    }, [fetchDeletedTasks]);

    // Hàm xử lý khôi phục các task đã chọn
    const handleRestoreSelectedTasks = async () => {
        if (selectedTasks.size === 0) return;

        const tasksToRestore = Array.from(selectedTasks);
        try {
            // Gọi API restore cho từng task
            await Promise.all(
                tasksToRestore.map((taskId) => axios.post(`/tasks/restore/${Number(project_name)}/${taskId}`))
            );

            toast.success(`${tasksToRestore.length} task(s) restored successfully!`);

            // Xóa các task đã chọn và fetch lại danh sách
            setSelectedTasks(new Set());
            fetchDeletedTasks();
        } catch (error) {
            console.error("Failed to restore tasks:", error);
            toast.error("An error occurred while restoring tasks.");
        }
    };

    const toggleTaskSelection = (taskId: number) => {
        setSelectedTasks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const toggleAllTasks = () => {
        if (selectedTasks.size === deletedTasks.length) {
            setSelectedTasks(new Set());
        } else {
            setSelectedTasks(new Set(deletedTasks.map((task) => task.taskId)));
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden mx-auto w-full">
            {/* Header */}
            <div id="featureTrash" className="flex items-center justify-between p-4 border-b shrink-0 bg-white bg-dynamic">
                <div className="flex items-center gap-4">
                    {/* Ô tìm kiếm */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search in trash..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-48"
                        />
                    </div>

                    {/* --- Bộ lọc theo Status --- */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-transparent">
                                {filters.Status ? (
                                    <span className={`flex items-center gap-2 ${getTaskStatusBadge(filters.Status)}`}>
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    taskStatus.find((s) => s.name === filters.Status)?.color,
                                            }}
                                        />
                                        {filters.Status}
                                    </span>
                                ) : (
                                    "Status"
                                )}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44">
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {taskStatus.map((status) => (
                                <DropdownMenuItem
                                    key={status.id}
                                    onClick={() => setFilters((prev) => ({ ...prev, Status: status.name }))}
                                >
                                    <div className={`flex items-center gap-2 ${getTaskStatusBadge(status.name)}`}>
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: status.color }}
                                        />
                                        <span>{status.name}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* --- Bộ lọc theo Priority --- */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-transparent">
                                {filters.Priority ? (
                                    <div className="flex items-center gap-2">
                                        {getPriorityIcon(filters.Priority)}
                                        <span className={getPriorityBadge(filters.Priority.toLowerCase())}>
                                            {filters.Priority}
                                        </span>
                                    </div>
                                ) : (
                                    "Priority"
                                )}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44">
                            <DropdownMenuLabel>Priority</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {["High", "Medium", "Low"].map((priority) => (
                                <DropdownMenuItem
                                    key={priority}
                                    onClick={() => setFilters((prev) => ({ ...prev, Priority: priority }))}
                                >
                                    <div className="flex items-center gap-2">
                                        {getPriorityIcon(priority)}
                                        <span className={getPriorityBadge(priority.toLowerCase())}>
                                            {priority}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Nút clear filter */}
                    <Button
                        variant="ghost"
                        onClick={() => setFilters({})}
                        className="text-gray-600 hover:text-red-500"
                    >
                        Clear Filters
                    </Button>
                </div>

                {/* Nút Restore */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleRestoreSelectedTasks}
                        disabled={selectedTasks.size === 0}
                        className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Undo2 className="h-4 w-4" />
                        Restore ({selectedTasks.size})
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div id="tableTrash" className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">Loading...</div>
                ) : (
                    <TrashTable
                        tasks={deletedTasks}
                        selectedTasks={selectedTasks}
                        toggleAllTasks={toggleAllTasks}
                        toggleTaskSelection={toggleTaskSelection}
                    />
                )}
            </div>
        </div>
    );
}