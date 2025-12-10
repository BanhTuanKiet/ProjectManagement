import axios from "@/config/axiosConfig";
import { useEffect, useState } from "react";
import {
    ChevronDown,
    Calendar as CalendarIcon,
    Clock,
    Flag,
    User as UserIcon,
} from "lucide-react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; // Giả sử bạn có component Button
import { Task } from "@/utils/mapperUtil";
import ColoredAvatar from "../ColoredAvatar";
import { cn } from "@/lib/utils"; // Giả sử bạn có cn utility từ shadcn

interface TaskDetailSidebarProps {
    task: Task;
    taskId: number;
    projectId: number;
}

export default function TaskDetailSidebar({
    task,
    taskId,
    projectId,
}: TaskDetailSidebarProps) {
    const [startDate, setStartDate] = useState(task?.createdAt || "");
    const [dueDate, setDueDate] = useState(task?.deadline || "");
    const [priority, setPriority] = useState<number | string | undefined>(task?.priority);

    const [editStartDate, setEditStartDate] = useState(false);
    const [editDueDate, setEditDueDate] = useState(false);

    type PriorityLevel = "Low" | "Medium" | "High";

    // Cập nhật màu sắc tinh tế hơn (Soft pastel colors)
    const priorityColorMap: Record<PriorityLevel, string> = {
        Low: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
        Medium: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
        High: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
    };

    const getPriorityLabel = (p: number | string | undefined): PriorityLevel => {
        if (p === undefined || p === null) return "Low";
        if (typeof p === "number") {
            if (p === 1) return "High";
            if (p === 2) return "Medium";
            return "Low";
        }
        const strP = String(p);
        if (["High", "Medium", "Low"].includes(strP)) return strP as PriorityLevel;
        return "Low";
    };

    const currentPriorityLabel = getPriorityLabel(priority);

    const formatForInput = (dateStr: string) => {
        if (!dateStr) return "";
        try { return new Date(dateStr).toISOString().slice(0, 16); } catch (e) { return ""; }
    };

    // Hàm format hiển thị ngày đẹp hơn
    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return "Not set";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        });
    };

    useEffect(() => {
        setStartDate(task.createdAt || "");
        setDueDate(task.deadline || "");
        setPriority(task.priority);
    }, [task.createdAt, task.deadline, task.priority]);

    const updateTaskField = async (key: string, value: number | string) => {
        try {
            await axios.put(`/tasks/${projectId}/tasks/${taskId}/update`, {
                [key]: value
            });
            switch (key) {
                case 'priority': setPriority(value); break;
                case 'deadline': setDueDate(value); break;
                case 'createdAt': setStartDate(value); break;
            }
        } catch (error) {
            console.error(`Failed to update ${key}:`, error);
        }
    };

    return (
        <div className="w-80 h-full border-l bg-white flex flex-col shadow-sm">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Accordion type="single" collapsible className="w-full" defaultValue="details">
                    <AccordionItem value="details" className="border-b-0">
                        <AccordionTrigger className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm font-semibold text-gray-800 hover:no-underline border-b">
                            Details
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                            <div className="p-4 space-y-6">
                                
                                {/* --- ASSIGNEE --- */}
                                <div className="group">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            <span>Assignee</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                                        <ColoredAvatar
                                            id={task.assignee?.id ?? ""}
                                            name={task.assignee?.name}
                                            size="sm"
                                            src={task.assignee?.avatar}
                                        />
                                        <span className="text-sm text-gray-700 font-medium truncate">
                                            {typeof task.assignee === "string"
                                                ? task.assignee
                                                : task.assignee?.name || "Unassigned"}
                                        </span>
                                    </div>
                                </div>

                                {/* --- PRIORITY --- */}
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                                        <Flag className="w-3.5 h-3.5" />
                                        <span>Priority</span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="h-8 px-2 -ml-2 w-full justify-start font-normal hover:bg-gray-100"
                                            >
                                                <Badge variant="outline" className={`${priorityColorMap[currentPriorityLabel]} mr-2 px-2 py-0.5 rounded-md border`}>
                                                    {currentPriorityLabel}
                                                </Badge>
                                                <ChevronDown className="h-3 w-3 text-gray-400 ml-auto opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-48">
                                            {(["High", "Medium", "Low"] as const).map((p) => (
                                                <DropdownMenuItem
                                                    key={p}
                                                    onClick={() => {
                                                        const mapVal = { "High": 1, "Medium": 2, "Low": 3 };
                                                        updateTaskField("priority", mapVal[p]);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Badge className={`${priorityColorMap[p]} border-none mr-2`}>
                                                        {p}
                                                    </Badge>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* --- DATES SECTION --- */}
                                <div className="space-y-4 pt-2 border-t border-gray-100">
                                    
                                    {/* Start Date */}
                                    <div className="relative">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Start date</span>
                                        </div>
                                        {!editStartDate ? (
                                            <div
                                                className="group flex items-center justify-between p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                                                onClick={() => setEditStartDate(true)}
                                            >
                                                <span className={cn("text-sm", !startDate ? "text-gray-400 italic" : "text-gray-700")}>
                                                    {formatDisplayDate(startDate)}
                                                </span>
                                            </div>
                                        ) : (
                                            <input
                                                type="datetime-local"
                                                autoFocus
                                                value={formatForInput(startDate)}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                onBlur={(e) => {
                                                    setEditStartDate(false);
                                                    updateTaskField("createdAt", e.target.value);
                                                }}
                                                className="w-full text-sm p-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                            />
                                        )}
                                    </div>

                                    {/* Due Date */}
                                    <div className="relative">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                            <span>Due date</span>
                                        </div>
                                        {!editDueDate ? (
                                            <div
                                                className="group flex items-center justify-between p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                                                onClick={() => setEditDueDate(true)}
                                            >
                                                <span className={cn("text-sm", !dueDate ? "text-gray-400 italic" : "text-gray-700")}>
                                                    {formatDisplayDate(dueDate)}
                                                </span>
                                            </div>
                                        ) : (
                                            <input
                                                type="datetime-local"
                                                autoFocus
                                                value={formatForInput(dueDate)}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                onBlur={(e) => {
                                                    setEditDueDate(false);
                                                    updateTaskField("deadline", e.target.value);
                                                }}
                                                className="w-full text-sm p-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                            />
                                        )}
                                    </div>
                                </div>
                                
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}