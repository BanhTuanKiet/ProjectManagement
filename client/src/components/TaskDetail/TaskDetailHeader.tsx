import {
    X,
    Plus,
    Eye,
    Share,
    Lock,
    Unlock,
    MoreHorizontal,
    Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActiveUser } from "@/utils/IUser";
import ColoredAvatar from "../ColoredAvatar";
import { useState } from "react";
import axios from "@/config/axiosConfig";
import { Task } from "@/utils/mapperUtil";

interface TaskDetailHeaderProps {
    taskId: number;
    projectId: number;
    isActive: boolean;
    onClose: () => void;
    activeUsers: ActiveUser[];
    onToggleActive: (newStatus: boolean) => void;
}

export default function TaskDetailHeader({
    taskId,
    projectId,
    isActive,
    onClose,
    activeUsers,
    onToggleActive
}: TaskDetailHeaderProps) {
    const [loading, setLoading] = useState(false);

    const handleToggleLock = async () => {
        try {
            setLoading(true);
            // Gọi API Toggle
            const res = await axios.patch(`/tasks/${projectId}/tasks/${taskId}/toggle-active`);

            // Gọi callback để update state ở component cha (TaskDetailModal)
            onToggleActive(res.data.isActive);
        } catch (error) {
            console.error("Lỗi khi khóa task:", error);
            alert("Không thể thay đổi trạng thái khóa của task.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add epic
                </Button>
                <span className="text-gray-400">/</span>
                {!isActive && (
                    <Badge className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Archived
                    </Badge>
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
                            className="bg-blue-100 text-blue-700"
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
                <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}