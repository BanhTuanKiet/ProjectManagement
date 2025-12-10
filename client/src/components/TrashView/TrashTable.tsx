"use client";

import { Checkbox } from "@/components/ui/checkbox";
import ColoredAvatar from "@/components/ColoredAvatar";
import { format } from "date-fns";
import { getPriorityBadge, getTaskStatusBadge } from "@/utils/statusUtils";
import { mapPriorityFromApi } from "@/utils/mapperUtil";

interface DeletedTask {
    taskId: number;
    title: string;
    description: string | null;
    status: string;
    priority: number;
    assigneeId: string | null;
    assigneeName: string | null;
    createdBy: string;
    creatorName: string | null;
    changedAt: string;
}

interface TrashTableProps {
    tasks: DeletedTask[];
    selectedTasks: Set<number>;
    toggleAllTasks: () => void;
    toggleTaskSelection: (taskId: number) => void;
}

const columns = [
    { key: "select", title: "", width: 40 },
    { key: "taskId", title: "ID", width: 85 },
    { key: "title", title: "Title", width: 250 },
    { key: "description", title: "Description", width: 300 },
    { key: "status", title: "Status", width: 120 },
    { key: "priority", title: "Priority", width: 120 },
    { key: "assigneeName", title: "Assignee", width: 180 },
    { key: "creatorName", title: "Deleted By", width: 180 },
    { key: "changedAt", title: "Deleted At", width: 150 },
];

export default function TrashTable({
    tasks,
    selectedTasks,
    toggleAllTasks,
    toggleTaskSelection,
}: TrashTableProps) {

    const renderHeader = () => (
        <div className="sticky top-0 z-10 flex bg-gray-50 border-b min-w-max">
            {columns.map((col) => (
                <div
                    key={col.key}
                    className="flex items-center px-3 py-2 border-r text-sm font-semibold text-gray-700 whitespace-nowrap"
                    style={{ width: col.width, minWidth: col.width }}
                >
                    {col.key === "select" ? (
                        <Checkbox
                            checked={tasks.length > 0 && selectedTasks.size === tasks.length}
                            onCheckedChange={toggleAllTasks}
                        />
                    ) : (
                        <span>{col.title}</span>
                    )}
                </div>
            ))}
        </div>
    );

    const renderCell = (task: DeletedTask, columnKey: string) => {
        switch (columnKey) {
            case "select":
                return (
                    <Checkbox
                        checked={selectedTasks.has(task.taskId)}
                        onCheckedChange={() => toggleTaskSelection(task.taskId)}
                    />
                );

            case "taskId":
                return <span className="text-gray-700">TASK-{task.taskId}</span>;

            case "title":
                return (
                    <span
                        className="font-medium text-gray-800 cursor-pointer hover:underline text-blue-600 truncate max-w-[230px] block"
                        title={task.title}
                    >
                        {task.title.length > 25 ? `${task.title.slice(0, 25)}...` : task.title}
                    </span>
                );

            case "description":
                return (
                    <span className="text-gray-600 truncate max-w-[280px] block" title={task.description || "—"}>
                        {task.description
                            ? task.description.length > 25
                                ? `${task.description.slice(0, 25)}...`
                                : task.description
                            : "—"}
                    </span>
                );

            case "status":
                return <span className={getTaskStatusBadge(task.status)}>{task.status}</span>;

            case "priority":
                const priorityStr = mapPriorityFromApi(task.priority);
                return <span className={getPriorityBadge(priorityStr.toLowerCase())}>{priorityStr}</span>;

            case "assigneeName":
                return task.assigneeName ? (
                    <div className="flex items-center gap-2">
                        <ColoredAvatar id={task.assigneeId || ""} name={task.assigneeName} size="sm" />
                        <span>{task.assigneeName}</span>
                    </div>
                ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                );

            case "creatorName":
                return task.creatorName ? (
                    <div className="flex items-center gap-2">
                        <ColoredAvatar id={task.createdBy || ""} name={task.creatorName} size="sm" />
                        <span>{task.creatorName}</span>
                    </div>
                ) : (
                    <span className="text-gray-400 italic">—</span>
                );

            case "changedAt":
                return (
                    <span className="text-gray-500">
                        {format(new Date(task.changedAt), "dd MMM, yyyy")}
                    </span>
                );

            default:
                return null;
        }
    };


    return (
        <div className="w-full overflow-x-auto border rounded-md">
            <div className="min-w-max">
                {renderHeader()}
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div
                            key={task.taskId}
                            className={`flex border-b hover:bg-gray-100 transition-colors ${selectedTasks.has(task.taskId) ? "bg-blue-50" : ""
                                }`}
                        >
                            {columns.map((col) => (
                                <div
                                    key={col.key}
                                    className="flex items-center px-3 py-2 border-r text-sm text-gray-700 whitespace-nowrap"
                                    style={{ width: col.width, minWidth: col.width }}
                                >
                                    {renderCell(task, col.key)}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        The trash is empty. 🗑️
                    </div>
                )}
            </div>
        </div>
    );
}
