import axios from "@/config/axiosConfig";
import { useEffect, useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TaskDetail } from "@/utils/ITask";
import * as signalR from "@microsoft/signalr";
import type { ActiveUser } from "@/utils/IUser";
import { useProject } from "@/app/(context)/ProjectContext";
import { useUser } from "@/app/(context)/UserContext";

import TaskDetailHeader from "./TaskDetailHeader";
import TaskDetailMain from "./TaskDetailMain";
import TaskDetailSidebar from "./TaskDetailSidebar";
import { mapApiTaskToTask, Task } from "@/utils/mapperUtil";

export default function TaskDetailModal({
    taskId,
    onClose,
}: {
    taskId: number;
    onClose: () => void;
}) {
    const [task, setTask] = useState<Task | null>(null);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(
        null
    );
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const { user } = useUser();
    const { project_name } = useProject();
    const projectId = Number(project_name);

    // 1. Fetch dữ liệu task chính
    useEffect(() => {
        const fetchTaskDetail = async () => {
            try {
                const response = await axios.get(
                    `/tasks/detail/${projectId}/${taskId}`
                );
                setTask(mapApiTaskToTask(response.data));
            } catch (error) {
                console.error("Fetch task detail error:", error);
            }
        };
        fetchTaskDetail();
    }, [project_name, taskId]);

    // 2. Thiết lập kết nối SignalR
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

    // 3. Lắng nghe sự kiện SignalR (chỉ các sự kiện global)
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

                // connection.on("NewComment") sẽ được chuyển vào TaskDetailMain

                await connection.invoke("GetActiveUsers", taskId);
            })
            .catch((err) => console.error("SignalR connection start error:", err));

        return () => {
            connection.off("UserJoinedTask");
            connection.off("UserLeftTask");
            connection.off("ActiveUsersInTask");
            connection.stop().catch(() => { });
            mounted = false;
        };
    }, [connection, taskId]);

    if (!task) return null;

    return (
        <TooltipProvider>
            <div id="TaskDetail Modal" className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30" onClick={onClose} />

                <div className="relative bg-white w-[1000px] h-[90vh] rounded-lg shadow-xl flex flex-col">
                    <TaskDetailHeader
                        taskId={taskId}
                        projectId={projectId}
                        isActive={task.isActive}
                        onToggleActive={(newStatus) => setTask((prev) => prev ? { ...prev, isActive: newStatus } : prev)}
                        onClose={onClose}
                        activeUsers={activeUsers}
                    />

                    <div className="flex-1 flex overflow-hidden">
                        <TaskDetailMain
                            task={task}
                            taskId={taskId}
                            projectId={projectId}
                            connection={connection}
                        />
                        <TaskDetailSidebar
                            task={task}
                            taskId={taskId}
                            projectId={projectId}
                        />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}