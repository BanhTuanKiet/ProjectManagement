import axios from "@/config/axiosConfig";
import { useEffect, useState } from "react";
import {
    ChevronDown,
    User,
    Calendar,
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
import { Task } from "@/utils/mapperUtil";

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

    const priorityColorMap: Record<PriorityLevel, string> = {
        Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200",
        Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200",
        High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200",
    };

    // Helper logic
    const getPriorityLabel = (p: number | string | undefined): PriorityLevel => {
        if (p === undefined || p === null) return "Low";
        if (typeof p === "number") {
            if (p === 1) return "High";
            if (p === 2) return "Medium";
            if (p === 3) return "Low";
            return "Low";
        }
        const strP = String(p);
        if (["High", "Medium", "Low"].includes(strP)) return strP as PriorityLevel;
        return "Low";
    };

    const currentPriorityLabel = getPriorityLabel(priority);

    // Format date
    const formatForInput = (dateStr: string) => {
        if (!dateStr) return "";
        try { return new Date(dateStr).toISOString().slice(0, 16); } catch (e) { return ""; }
    };

    useEffect(() => {
        setStartDate(task.createdAt || "");
        setDueDate(task.deadline || "");
        setPriority(task.priority);
    }, [task.createdAt, task.deadline, task.priority]);

    const updateTaskField = async (key: string, value: any) => {
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
        <div className="w-80 border-l bg-gray-50 overflow-auto">
            <div className="p-4">
                <Accordion type="single" collapsible className="w-full" defaultValue="details">
                    <AccordionItem value="details">
                        <AccordionTrigger className="text-sm font-medium">
                            Details
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 mt-2">

                                {/* Assignee (Chỉ hiển thị) */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        {task.assignee ? "Assignee" : "Unassigned"}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {typeof task.assignee === "string"
                                                ? task.assignee
                                                : task.assignee?.name || "Unassigned"}
                                        </span>
                                    </div>
                                    <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                                        Assign to me
                                    </button>
                                </div>

                                {/* 2. PRIORITY (Sử dụng updateTaskField) */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">Priority</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 p-2 rounded-md hover:bg-gray-100 transition w-fit">
                                                <Badge className={`${priorityColorMap[currentPriorityLabel]} border-none`}>
                                                    {currentPriorityLabel}
                                                </Badge>
                                                <ChevronDown className="h-3 w-3 text-gray-400" />
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            {(["High", "Medium", "Low"] as const).map((p) => (
                                                <DropdownMenuItem
                                                    key={p}
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        const mapVal = { "High": 1, "Medium": 2, "Low": 3 };
                                                        updateTaskField("priority", mapVal[p]);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Badge className={`${priorityColorMap[p]} border-none`}>{p}</Badge>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Parent */}
                                {/* <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Parent
                                    </label>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        Add parent
                                    </button>
                                </div> */}

                                {/* 4. DUE DATE (Sử dụng updateTaskField) */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">Due date</label>
                                    {!editDueDate ? (
                                        <button
                                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                                            onClick={() => setEditDueDate(true)}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            {task.raw.deadline ? new Date(task.raw.deadline).toLocaleString() : "Add due date"}
                                        </button>
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
                                            className="text-sm text-gray-700 border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-200"
                                        />
                                    )}
                                </div>

                                {/* 5. START DATE (Sử dụng updateTaskField) */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">Start date</label>
                                    {!editStartDate ? (
                                        <button
                                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                                            onClick={() => setEditStartDate(true)}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            {task.raw.createdAt ? new Date(task.raw.createdAt).toLocaleString() : "Add start date"}
                                        </button>
                                    ) : (
                                        <input
                                            type="datetime-local"
                                            autoFocus
                                            value={formatForInput(startDate)}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            onBlur={(e) => {
                                                setEditStartDate(false);
                                                // Key là 'createdAt' để khớp logic backend cũ của bạn
                                                updateTaskField("createdAt", e.target.value);
                                            }}
                                            className="text-sm text-gray-700 border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-200"
                                        />
                                    )}
                                </div>

                                {/* Labels */}
                                {/* <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Labels
                                    </label>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        Add labels
                                    </button>
                                </div> */}

                                {/* Sprint */}
                                {/* <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Sprint
                                    </label>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        Add to sprint
                                    </button>
                                </div> */}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Các AccordionItem khác từ file gốc */}
                    {/* <AccordionItem value="more-fields">
                        <AccordionTrigger className="text-sm font-medium">
                            More fields
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="mt-2 text-sm text-gray-600">
                                <div className="mb-2">
                                    <span className="block text-xs font-medium text-gray-700 mb-1">
                                        Reporter
                                    </span>
                                    {task.reporter?.name || task.assignee?.name || "Unknown"}                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="automation">
                        <AccordionTrigger className="text-sm font-medium">
                            Automation
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="mt-2 text-sm text-gray-600">
                                <p className="mb-2">Recent rule runs</p>
                                <button className="text-xs text-blue-600 hover:text-blue-800">
                                    Refresh to see recent runs
                                </button>
                                <div className="text-xs text-gray-500 mt-2">
                                    Created September 7, 2025 at 1:34 PM <br />
                                    Updated September 13, 2025 at 3:36 PM
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem> */}
                </Accordion>
            </div>
        </div>
    );
}