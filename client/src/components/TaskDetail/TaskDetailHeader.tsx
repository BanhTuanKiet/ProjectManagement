import {
    X,
    Eye,
    Share,
    Lock,
    Unlock,
    MoreHorizontal,
    Tag, // Import icon Tag
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
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu
import type { ActiveUser } from "@/utils/IUser";
import ColoredAvatar from "../ColoredAvatar";
import { useEffect, useState } from "react";
import axios from "@/config/axiosConfig";
import { WarningNotify, SuccessNotify } from "@/utils/toastUtils"; // Import SuccessNotify nếu có
import { getTaskStatusBadge } from "@/utils/statusUtils";
import { Badge } from "../ui/badge";

interface TaskDetailHeaderProps {
    taskId: number;
    taskStatus: string
    taskTag: string | null
    projectId: number;
    isActive: boolean;
    onClose: () => void;
    activeUsers: ActiveUser[];
    onToggleActive: (newStatus: boolean) => void;
    // Props mới cho label sẽ được bạn thêm sau, hiện tại tôi dùng local state
}

export default function TaskDetailHeader({
    taskId,
    taskStatus,
    taskTag,
    projectId,
    isActive,
    onClose,
    activeUsers,
    onToggleActive
}: TaskDetailHeaderProps) {
    const [loading, setLoading] = useState(false);
    const [currentLabel, setCurrentLabel] = useState<string | null>(null);

    useEffect(() => {
        if(taskTag) setCurrentLabel(taskTag)
    }, [taskTag])

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

    // Logic cập nhật Label
    const handleUpdateTag = async (newTag: string | null) => {
        try {
            await axios.patch(`/tasks/${projectId}/${taskId}/tag/${newTag}`)

            setCurrentLabel(newTag);
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
                <span
                    className="text-blue-600 hover:bg-blue-50 size-sm cursor-pointer font-medium"
                >
                    TASK-{taskId}
                </span>
                <span className="text-gray-400">/</span>

                <div className="flex items-center justify-between gap-2">
                    {/* Status Badge */}
                    <Badge
                        className={`${getTaskStatusBadge(taskStatus)} border`}
                    >
                        {taskStatus}
                    </Badge>

                    {/* --- LABEL SECTION START --- */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer hover:opacity-80 transition-opacity">
                                {currentLabel === 'bug' ? (
                                    <Badge variant="destructive" className="flex items-center gap-1 bg-red-500 hover:bg-red-600">
                                        <Tag className="h-3 w-3" /> Bug
                                    </Badge>
                                ) : currentLabel ? (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Tag className="h-3 w-3" /> {currentLabel}
                                    </Badge>
                                ) : (
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-500 hover:text-gray-900">
                                        <Tag className="h-4 w-4 mr-1" />
                                        <span className="text-xs">Add Label</span>
                                    </Button>
                                )}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleUpdateTag('bug')}>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <span>Bug</span>
                                </div>
                            </DropdownMenuItem>
                            {/* Thêm các loại label khác ở đây nếu cần */}
                            {currentLabel && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleUpdateTag(null)}
                                        className="text-gray-500 focus:text-gray-700"
                                    >
                                        <X className="h-4 w-4 mr-2" /> Clear label
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* --- LABEL SECTION END --- */}

                </div>

                {!isActive && (
                    <>
                        <span className="text-gray-400">/</span>
                        <Badge className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200">
                            <Lock className="h-3 w-3" /> Archived
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

                {/* Active Users Section - Giữ nguyên */}
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