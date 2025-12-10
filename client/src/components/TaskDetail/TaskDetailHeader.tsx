import {
    X,
    Eye,
    Share,
    Lock,
    Unlock,
    MoreHorizontal,
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
import { useEffect, useState } from "react";
import axios from "@/config/axiosConfig";
import { getTaskStatusBadge } from "@/utils/statusUtils";
import { Badge } from "../ui/badge";

interface TaskDetailHeaderProps {
    taskId: number;
    taskStatus: string
    projectId: number;
    isActive: boolean;
    onClose: () => void;
    activeUsers: ActiveUser[];
    onToggleActive: (newStatus: boolean) => void;
}

export default function TaskDetailHeader({
    taskId,
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
    }, [taskStatus])

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
            console.log(newTag)
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer hover:opacity-80 transition">
                                <Badge
                                    className={`${getTaskStatusBadge(currentLabel ?? "")} border`}
                                >
                                    <Tag className="h-3 w-3" />
                                    {currentLabel ?? "Set status"}
                                </Badge>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="w-44">
                            <DropdownMenuItem onClick={() => handleUpdateTag("Todo")}>
                                <div className="h-2 w-2 rounded-full bg-blue-800 mr-2" /> To do
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleUpdateTag("In Progress")}>
                                <div className="h-2 w-2 rounded-full bg-yellow-600 mr-2" /> In Progress
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleUpdateTag("Done")}>
                                <div className="h-2 w-2 rounded-full bg-green-600 mr-2" /> Done
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleUpdateTag("Cancel")}>
                                <div className="h-2 w-2 rounded-full bg-orange-600 mr-2" /> Cancel
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleUpdateTag("Bug")}>
                                <div className="h-2 w-2 rounded-full bg-rose-600 mr-2" /> Bug
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleUpdateTag("Expired")}>
                                <div className="h-2 w-2 rounded-full bg-red-600 mr-2" /> Expired
                            </DropdownMenuItem>
                        </DropdownMenuContent>

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