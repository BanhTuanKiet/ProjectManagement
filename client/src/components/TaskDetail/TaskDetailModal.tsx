import axios from "@/config/axiosConfig";
import { useEffect, useState } from "react";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import * as signalR from "@microsoft/signalr";
import type { ActiveUser } from "@/utils/IUser";
import { useProject } from "@/app/(context)/ProjectContext";
import { useUser } from "@/app/(context)/UserContext";
import TaskDetailHeader from "./TaskDetailHeader";
import TaskDetailMain from "./TaskDetailMain";
import TaskDetailSidebar from "./TaskDetailSidebar";
import { mapApiTaskToTask, Task } from "@/utils/mapperUtil";
import { Trash2, X } from "lucide-react";
import { BasicTask } from "@/utils/ITask";

export default function TaskDetailModal({
    setActiveTab,
    taskId,
    onClose,
}: {
    setActiveTab: (tab: string) => void;
    taskId: number;
    onClose: () => void;
}) {
    const [task, setTask] = useState<BasicTask | null>(null);
    const [isTaskDeleted, setIsTaskDeleted] = useState(false);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(
        null
    );
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const { user } = useUser();
    const { project_name, projectRole } = useProject();
    const projectId = Number(project_name);

    useEffect(() => {
        const fetchTaskDetail = async () => {
            try {
                const response = await axios.get(
                    `/tasks/detail/${projectId}/${taskId}`
                );
                setTask(response.data);
                setIsTaskDeleted(false);
            } catch (error) {
                console.error("Fetch task detail error:", error);
            }
        };
        fetchTaskDetail();
    }, [project_name, taskId, projectId]);

    useEffect(() => {
        if (!user) return;
        const conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5144/hubs/task", {
                accessTokenFactory: () => user.token,
            })
            .withAutomaticReconnect()
            .build();
        setConnection(conn);
        return () => {
            if (conn && conn.state === signalR.HubConnectionState.Connected) {
                conn.stop().catch(() => { /* ignore */ });
            }
        };
    }, [user]);

    useEffect(() => {
        if (!connection) return;
        let mounted = true;

        connection
            .start()
            .then(async () => {
                if (!mounted) return;
                await connection.invoke("JoinTaskGroup", taskId);

                connection.on("UserJoinedTask", (user: ActiveUser) => {
                    setActiveUsers((prev) => {
                        if (prev.find((p) => p.id === user.id)) return prev;
                        return [...prev, user];
                    });
                });

                connection.on("UserLeftTask", (user: ActiveUser) => {
                    setActiveUsers((prev) => prev.filter((u) => u.id !== user.id));
                });

                connection.on("ActiveUsersInTask", (users: ActiveUser[]) => {
                    setActiveUsers(users);
                });

                connection.on("TaskDeleted", (deletedTaskId: number) => {
                    if (deletedTaskId === taskId) {
                        console.log(deletedTaskId)
                        setIsTaskDeleted(true);
                    }
                })

                await connection.invoke("GetActiveUsers", taskId);
            })
            .catch((err) => console.error("SignalR connection start error:", err));

        return () => {
            connection.off("UserJoinedTask");
            connection.off("UserLeftTask");
            connection.off("ActiveUsersInTask");
            connection.off("DeletedTask");
            connection.stop().catch(() => { });
            mounted = false;
        };
    }, [connection, taskId]);

    if (!task && !isTaskDeleted) return null;

    return (
        <TooltipProvider>
            <div id="TaskDetail Modal" className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30" onClick={onClose} />

                {isTaskDeleted ? (
                    <div id="DeletedTaskView" className="related w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-gray-100 mx-4">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Deleted Task</h2>
                        <p className="text-sm text-gray-500 mb-8 top-relax">
                            TASK <span className="font-mono font-medium text-gray-700 bg-gray-100 px-1 round">#{`${taskId} has been moved to the Recycle Bin`} </span>
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-gray-900 text-white font-medium round-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all Shadow-lg Shadow-gray-200"
                        >
                            Close
                        </button>setActiveTab
                        <button
                            onClick={() => setActiveTab("trash")}
                            className="w-full py-2.5 bg-gray-900 text-white font-medium round-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all Shadow-lg Shadow-gray-200"
                        >
                            Move to Trash
                        </button>
                    </div>
                ) : (
                    <div className="relative bg-white w-[1000px] h-[90vh] rounded-lg shadow-xl flex flex-col">
                        <TaskDetailHeader
                            taskId={taskId}
                            projectRole={projectRole}
                            taskStatus={task!.status}
                            projectId={projectId}
                            isActive={task!.isActive}
                            onToggleActive={(newStatus) => setTask((prev) => prev ? { ...prev, isActive: newStatus } : prev)}
                            onClose={onClose}
                            activeUsers={activeUsers}
                        />

                        <div className="flex-1 flex overflow-hidden">
                            <TaskDetailMain
                                task={task!}
                                taskId={taskId}
                                projectId={projectId}
                                projectRole={projectRole}
                                connection={connection}
                            />
                            <TaskDetailSidebar
                                task={task!}
                                taskId={taskId}
                                projectId={projectId}
                            />
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}