import {
    X,
    Eye,
    Lock,
    Unlock,
    Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActiveUser } from "@/utils/IUser";
import ColoredAvatar from "../ColoredAvatar";
import { useEffect, useMemo, useState } from "react";
import axios from "@/config/axiosConfig";
import { getTaskStatusBadge } from "@/utils/statusUtils";
import { Badge } from "../ui/badge";

interface TaskDetailHeaderProps {
    taskId: number;
    projectRole: string; // Đảm bảo role được truyền vào đây
    taskStatus: string
    projectId: number;
    isActive: boolean;
    onClose: () => void;
    activeUsers: ActiveUser[];
    onToggleActive: (newStatus: boolean) => void;
}

// 1. Định nghĩa danh sách các status và màu sắc tương ứng
const STATUS_OPTIONS = [
    { value: "Todo", label: "To do", color: "bg-blue-800" },
    { value: "In Progress", label: "In Progress", color: "bg-yellow-600" },
    { value: "Done", label: "Done", color: "bg-green-600" },
    { value: "Cancel", label: "Cancel", color: "bg-orange-600" },
    { value: "Bug", label: "Bug", color: "bg-rose-600" },
    { value: "Expired", label: "Expired", color: "bg-red-600" },
];

export default function TaskDetailHeader({
    taskId,
    projectRole,
    taskStatus,
    projectId,
    isActive,
    onClose,
    activeUsers,
    onToggleActive
}: TaskDetailHeaderProps) {
    const [loading, setLoading] = useState(false);
    const [currentLabel, setCurrentLabel] = useState<string | null>(null);

    useEffect(() => {
        if (taskStatus) setCurrentLabel(taskStatus)
        console.log("Task status updated:", taskStatus);
        console.log(projectRole)
    }, [taskStatus])

    // 2. Logic kiểm tra quyền hạn
    const canChangeStatus = projectRole !== "Member"; // Member không được đổi

    // 3. Logic lọc status hiển thị trong menu
    const filteredStatuses = useMemo(() => {
        if (projectRole === "Tester") {
            // Tester chỉ thấy: In Progress, Bug, Done
            return STATUS_OPTIONS.filter(s => ["In Progress", "Bug", "Done"].includes(s.value));
        }
        if (["Project Manager", "Leader"].includes(projectRole)) {
            // PM và Leader thấy tất cả
            return STATUS_OPTIONS;
        }
        // Trường hợp khác (ví dụ Member) trả về rỗng hoặc mặc định
        return [];
    }, [projectRole]);

    const handleToggleLock = async () => {
        try {
            setLoading(true);
            const res = await axios.patch(`/tasks/${projectId}/tasks/${taskId}/toggle-active`);
            onToggleActive(res.data.isActive);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTag = async (newTag: string | null) => {
        try {
            const payload = { status: newTag };
            console.log(newTag)
            await axios.put(`/tasks/${projectId}/tasks/${taskId}/update`, payload);
            setCurrentLabel(newTag);
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
                <span className="text-blue-600 hover:bg-blue-50 size-sm cursor-pointer font-medium">
                    TASK-{taskId}
                </span>
                <span className="text-gray-400">/</span>

                <div className="flex items-center justify-between gap-2">
                    <DropdownMenu>
                        {/* 4. Disable trigger nếu là Member */}
                        <DropdownMenuTrigger asChild disabled={!canChangeStatus}>
                            <div
                                className={`transition ${canChangeStatus
                                    ? "cursor-pointer hover:opacity-80"
                                    : "cursor-not-allowed opacity-50"
                                    }`}
                            >
                                <Badge
                                    className={`${getTaskStatusBadge(currentLabel ?? "")} border`}
                                >
                                    <Tag className="h-3 w-3" />
                                    {currentLabel ?? "Set status"}
                                </Badge>
                            </div>
                        </DropdownMenuTrigger>

                        {/* Chỉ hiển thị nội dung nếu có quyền (phòng hờ) */}
                        {canChangeStatus && (
                            <DropdownMenuContent align="start" className="w-44">
                                {filteredStatuses.map((status) => (
                                    <DropdownMenuItem
                                        key={status.value}
                                        onClick={() => handleUpdateTag(status.value)}
                                    >
                                        <div className={`h-2 w-2 rounded-full ${status.color} mr-2`} />
                                        {status.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                </div>

                {!isActive && (
                    <>
                        <span className="text-gray-400">/</span>
                        <Badge className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200">
                            <Lock className="h-3 w-3" /> Locked
                        </Badge>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleLock}
                            disabled={loading}
                            className={!isActive ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-gray-500"}
                        >
                            {isActive ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isActive ? "Lock task (Archive)" : "Unlock task (Restore)"}</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            {activeUsers.length}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="p-3">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Active Users ({activeUsers.length})
                            </p>
                            {activeUsers.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {activeUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-2"
                                        >
                                            <ColoredAvatar
                                                id={user.id}
                                                name={user.name}
                                                size="sm"
                                                src={user.avatarUrl}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">No active users</p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}