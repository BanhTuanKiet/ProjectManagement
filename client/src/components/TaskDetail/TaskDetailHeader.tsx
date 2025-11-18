import {
    X,
    Plus,
    Eye,
    Share,
    Lock,
    MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActiveUser } from "@/utils/IUser";
import ColoredAvatar from "../ColoredAvatar";

interface TaskDetailHeaderProps {
    onClose: () => void;
    activeUsers: ActiveUser[];
}

export default function TaskDetailHeader({
    onClose,
    activeUsers,
}: TaskDetailHeaderProps) {
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
                <div className="flex items-center gap-2">
                    {/* {("key" in task && (task as any).key) ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {(task as any).key}
                        </Badge>
                    ) : null} */}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                    <Lock className="h-4 w-4" />
                </Button>
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