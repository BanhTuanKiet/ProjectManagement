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
import type { TaskDetail } from "@/utils/ITask";
import { getPriorityIcon } from "@/utils/statusUtils";

interface TaskDetailSidebarProps {
    task: TaskDetail;
    taskId: number;
    projectId: number;
}

export default function TaskDetailSidebar({
    task,
    taskId,
    projectId,
}: TaskDetailSidebarProps) {
    // State cho Dates
    const [startDate, setStartDate] = useState(task?.createdAt || "");
    const [editStartDate, setEditStartDate] = useState(false);
    const [dueDate, setDueDate] = useState(task?.deadline || "");
    const [editDueDate, setEditDueDate] = useState(false);

    // State cho Priority
    const [priority, setPriority] = useState(task?.priority);
    const [open, setOpen] = useState(false);
    const priorities = [
        { label: "High", value: 1 },
        { label: "Medium", value: 2 },
        { label: "Low", value: 3 },
    ];

    // Đồng bộ state từ props
    useEffect(() => {
        setStartDate(task.createdAt || "");
        setDueDate(task.deadline || "");
        setPriority(task.priority);
    }, [task.createdAt, task.deadline, task.priority]);

    // --- Handlers cho Dates ---
    const handleStartDate = async (newStartDate: string) => {
        try {
            await axios.put(`/tasks/updateStartDate/${projectId}/${taskId}`, {
                createdAt: newStartDate,
            });
            setEditStartDate(false);
            setStartDate(newStartDate);
        } catch (error) {
            console.log(error);
        }
    };

    const handleDueDate = async (newDueDate: string) => {
        try {
            await axios.put(`/tasks/updateDueDate/${projectId}/${taskId}`, {
                deadline: newDueDate,
            });
            setEditDueDate(false);
            setDueDate(newDueDate);
        } catch (error) {
            console.log(error);
        }
    };

    // --- Handlers cho Priority ---
    const handleSelect = async (value: number) => {
        if (value === priority) {
            setOpen(false);
            return;
        }
        try {
            await axios.put(`/tasks/updatePriority/${projectId}/${taskId}`, {
                priority: value,
            });
            setPriority(value);
        } catch (error) {
            console.error(error);
        } finally {
            setOpen(false);
        }
    };

    // Helper format ngày cho input
    const formatForInput = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            // Cần format sang YYYY-MM-DDTHH:mm
            return new Date(dateStr).toISOString().slice(0, 16);
        } catch (e) { return ""; }
    }

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
                                        Assignee
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

                                {/* Priority (Tự quản lý) */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Priority
                                    </label>
                                    <div
                                        className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition"
                                        onClick={() => setOpen(!open)}
                                    >
                                        {getPriorityIcon(priority || task.priority)}
                                        <span className="text-sm text-gray-600">{priorities.find(p => p.value === priority)?.label || priorities.find(p => p.value === task.priority)?.label}</span>
                                    </div>
                                    {open && (
                                        <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-md w-32">
                                            {priorities.map((p) => (
                                                <div
                                                    key={p.value}
                                                    onClick={() => handleSelect(p.value)}
                                                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${p.value === priority ? "bg-gray-50" : ""}`}
                                                >
                                                    {getPriorityIcon(p.label)}
                                                    <span className="text-sm">{p.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Parent */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Parent
                                    </label>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        Add parent
                                    </button>
                                </div>

                                {/* Due Date (Tự quản lý) */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Due date
                                    </label>
                                    {!editDueDate ? (
                                        <button
                                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                                            onClick={() => setEditDueDate(true)}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            {dueDate ? new Date(dueDate).toLocaleString() : "Add due date"}
                                        </button>
                                    ) : (
                                        <input
                                            type="datetime-local"
                                            autoFocus
                                            value={formatForInput(dueDate)}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            onBlur={(e) => handleDueDate(e.target.value)}
                                            className="text-sm text-gray-700 border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-200"
                                        />
                                    )}
                                </div>

                                {/* Start Date (Tự quản lý) */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Start date
                                    </label>
                                    {!editStartDate ? (
                                        <button
                                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                                            onClick={() => setEditStartDate(true)}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            {startDate ? new Date(startDate).toLocaleString() : "Add start date"}
                                        </button>
                                    ) : (
                                        <input
                                            type="datetime-local"
                                            autoFocus
                                            value={formatForInput(startDate)}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            onBlur={(e) => handleStartDate(e.target.value)}
                                            className="text-sm text-gray-700 border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-200"
                                        />
                                    )}
                                </div>

                                {/* Labels */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Labels
                                    </label>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        Add labels
                                    </button>
                                </div>

                                {/* Sprint */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-2">
                                        Sprint
                                    </label>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        Add to sprint
                                    </button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Các AccordionItem khác từ file gốc */}
                    <AccordionItem value="more-fields">
                        <AccordionTrigger className="text-sm font-medium">
                            More fields
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="mt-2 text-sm text-gray-600">
                                <div className="mb-2">
                                    <span className="block text-xs font-medium text-gray-700 mb-1">
                                        Reporter
                                    </span>
                                    Anonymous
                                </div>
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
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}