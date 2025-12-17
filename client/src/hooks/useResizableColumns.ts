"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "@/config/axiosConfig";
import { Member, UserMini } from "@/utils/IUser";
import {
    mapApiTaskToTask,
    mapApiUserToUserMini,
    Task,
    mapTaskToApiUpdatePayload,
} from "@/utils/mapperUtil";
import { BasicTask } from "@/utils/ITask";
import { Column, initialColumns } from "@/config/columsConfig";
import { useProject } from "@/app/(context)/ProjectContext";
import { useDebounce } from "@/hooks/useDebounce";

type UpdatePayload = {
    [key: string]: string | number | null | undefined;
};
type EditValue = string | number | Member | UserMini | null;

export const useTaskTable = (currentTasks: BasicTask[]) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [availableUsers, setAvailableUsers] = useState<Member[]>([]);
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCell, setEditingCell] = useState<{
        taskId: number;
        field: string;
    } | null>(null);
    const [draggedTask, setDraggedTask] = useState<number | null>(null);
    const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
        null
    );
    const { project_name, members } = useProject();
    const [filters, setFilters] = useState<Record<string, string>>({});
    const debouncedSearch = useDebounce(searchQuery, 400);
    // Fetch users + tasks
    useEffect(() => {
        if (members) {
            // const mappedUsers = members.map(mapApiUserToUserMini);
            // console.log("Mapped users:", mappedUsers);
            setAvailableUsers(members);
        }
    }, [members]);

    useEffect(() => {
        setTasks(prev => {
            const map = new Map(prev.map(t => [t.id, t]));

            currentTasks.forEach(apiTask => {
                const mapped = mapApiTaskToTask(apiTask);
                map.set(mapped.id, {
                    ...map.get(mapped.id),
                    ...mapped,
                });
            });

            return Array.from(map.values());
        });
    }, [currentTasks]);


    // Resize columns
    const resizingColumn = useRef<{
        index: number;
        startX: number;
        startWidth: number;
    } | null>(null);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent, columnIndex: number) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = columns[columnIndex].width;

            resizingColumn.current = { index: columnIndex, startX, startWidth };

            const handleMouseMove = (e: MouseEvent) => {
                if (!resizingColumn.current) return;
                const { index, startX, startWidth } = resizingColumn.current;
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(columns[index].minWidth, startWidth + deltaX);

                setColumns((prev) =>
                    prev.map((col, i) =>
                        i === index ? { ...col, width: newWidth } : col
                    )
                );
            };

            const handleMouseUp = () => {
                resizingColumn.current = null;
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        },
        [columns]
    );

    // Select tasks
    const toggleTaskSelection = useCallback((taskId: number) => {
        setSelectedTasks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) newSet.delete(taskId);
            else newSet.add(taskId);
            return newSet;
        });
    }, []);

    const toggleAllTasks = useCallback(() => {
        setSelectedTasks((prev) => {
            if (prev.size === tasks.length) return new Set();
            return new Set(tasks.map((t) => t.id));
        });
    }, [tasks]);

    // Edit cell
    const handleCellEdit = useCallback(
        async (taskId: number, field: string, value: EditValue) => {
            // 1. Backup dữ liệu cũ để revert nếu lỗi
            const currentTask = tasks.find((t) => t.id === taskId);
            if (!currentTask) return;

            try {
                // Tạo payload an toàn kiểu dữ liệu
                const payload: Record<string, string | number | null | undefined> = {};

                if (field === "assignee") {
                    if (value && typeof value === "object" && "userId" in value) {
                        payload["assigneeId"] = (value as Member).userId;
                    } else {
                        payload["assigneeId"] = null;
                    }
                } else if (field === "priority") {
                    const priorityMap: Record<string, number> = {
                        High: 1,
                        Medium: 2,
                        Low: 3,
                    };
                    if (typeof value === "string" && value in priorityMap) {
                        payload["priority"] = priorityMap[value];
                    } else if (typeof value === "number") {
                        payload["priority"] = value;
                    }
                } else if (field === "dueDate") {
                    payload["deadline"] = value as string;
                } else if (field === "summary") {
                    payload["title"] = value as string;
                } else {
                    if (value !== undefined && value !== null) {
                        payload[field] = String(value);
                    }
                }

                console.log(`Payload [Task ${taskId}]:`, payload);

                // 2. Optimistic Update: Cập nhật UI ngay để tạo cảm giác mượt
                // @ts-ignore: Ignore type check tạm thời để spread object nhanh
                const optimisticTask = { ...currentTask, [field]: value };
                setTasks((prev) =>
                    prev.map((t) => (t.id === taskId ? optimisticTask : t))
                );

                // 3. Gọi API
                const response = await axios.put(
                    `/tasks/${Number(project_name)}/tasks/${taskId}/update`,
                    payload
                );

                // 4. Sync dữ liệu chuẩn từ Server (nếu thành công)
                const serverData = response.data.task || response.data;
                let updatedFromServer = mapApiTaskToTask(serverData);

                // Fix UI: Giữ object assignee vừa chọn nếu server trả về null (tránh nháy UI)
                if (field === "assignee") {
                    if (
                        value &&
                        typeof value === "object" &&
                        !updatedFromServer.assignee
                    ) {
                        updatedFromServer = {
                            ...updatedFromServer,
                            assignee: value as UserMini,
                        };
                    }
                    if (value === null) {
                        updatedFromServer = { ...updatedFromServer, assignee: undefined };
                    }
                }

                setTasks((prev) =>
                    prev.map((t) => (t.id === taskId ? updatedFromServer : t))
                );
            } catch (error) {
                console.error("Update failed:", error);
                setTasks((prev) =>
                    prev.map((t) => (t.id === taskId ? currentTask : t))
                );
            } finally {
                setEditingCell(null);
            }
        },
        [tasks, project_name]
    );

    // Drag & Drop
    const handleDragStart = useCallback((e: React.DragEvent, taskId: number) => {
        setDraggedTask(taskId);
        e.dataTransfer.effectAllowed = "move";
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetTaskId: number) => {
            e.preventDefault();
            if (!draggedTask || draggedTask === targetTaskId) return;

            const draggedIndex = tasks.findIndex((t) => t.id === draggedTask);
            const targetIndex = tasks.findIndex((t) => t.id === targetTaskId);

            const newTasks = [...tasks];
            const [draggedItem] = newTasks.splice(draggedIndex, 1);
            newTasks.splice(targetIndex, 0, draggedItem);

            setTasks(newTasks);
            setDraggedTask(null);
        },
        [draggedTask, tasks]
    );

    // Column Drag & Drop
    const handleColumnDragStart = useCallback(
        (e: React.DragEvent, index: number) => {
            setDraggedColumnIndex(index);
            e.dataTransfer.effectAllowed = "move";
        },
        []
    );

    const handleColumnDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleColumnDrop = useCallback(
        (e: React.DragEvent, targetIndex: number) => {
            e.preventDefault();
            if (draggedColumnIndex === null || draggedColumnIndex === targetIndex)
                return;

            const newColumns = [...columns];
            const [moved] = newColumns.splice(draggedColumnIndex, 1);
            newColumns.splice(targetIndex, 0, moved);

            setColumns(newColumns);
            setDraggedColumnIndex(null);
        },
        [draggedColumnIndex, columns]
    );

    useEffect(() => {
        const fetchFilteredAndSearchedTasks = async () => {
            try {
                // Nếu không có lọc và không có search → trả lại danh sách gốc
                if (
                    Object.keys(filters).length === 0 &&
                    debouncedSearch.trim() === ""
                ) {
                    return; // giữ state hiện tại
                }

                // 🔸 Tạo params gửi lên API
                const params = {
                    ...filters,
                    keyword: debouncedSearch.trim() || undefined,
                };

                console.log("🧭 Gửi request filter/search với params:", params);

                // 🔸 Gọi API duy nhất
                const res = await axios.get(
                    `/tasks/${Number(project_name)}/filter-by`,
                    { params }
                );

                console.log("✅ API response:", res.data);

                // 🔸 Map dữ liệu sang format hiển thị FE
                const mapped = res.data.map(mapApiTaskToTask);
                setTasks(mapped);
            } catch (err) {
                console.error("❌ Lỗi khi filter/search tasks:", err);
            }
        };

        fetchFilteredAndSearchedTasks();
    }, [debouncedSearch, filters, project_name, currentTasks]);

    const addTask = useCallback((newTask: Task) => {
        setTasks((prev) => [...prev, newTask]);
    }, []);

    // Copy các task được chọn
    const copySelectedTasks = useCallback(() => {
        const tasksToCopy = tasks.filter((t) => selectedTasks.has(t.id));
        if (tasksToCopy.length === 0) return;

        // Clone task với id mới (FE giả lập hoặc gọi BE tạo task mới)
        const clonedTasks = tasksToCopy.map((t) => ({
            ...t,
            id: -Math.floor(Math.random() * 1000000), // tạo id tạm, hoặc gọi API BE để add mới
            key: `${t.key}-COPY`,
        }));

        setTasks((prev) => [...prev, ...clonedTasks]);
    }, [tasks, selectedTasks]);

    // Delete các task được chọn
    const deleteSelectedTasks = useCallback(async () => {
        const toDelete = Array.from(selectedTasks);
        if (toDelete.length === 0) return;

        try {
            // Gọi API BE xóa nhiều task (nếu có)
            await axios.delete(`/tasks/bulk-delete/${project_name}`, {
                data: { projectId: Number(project_name), ids: toDelete },
            });

            // Xóa trên FE
            setTasks((prev) => prev.filter((t) => !selectedTasks.has(t.id)));
            setSelectedTasks(new Set()); // clear selection
        } catch (err) {
            console.error("Delete error:", err);
        }
    }, [selectedTasks, tasks]);

    const totalWidth = useMemo(
        () => columns.reduce((s, c) => s + c.width, 0),
        [columns]
    );

    return {
        tasks,
        availableUsers,
        columns,
        selectedTasks,
        searchQuery,
        filters,
        setFilters,
        setSearchQuery,
        editingCell,
        totalWidth,
        setEditingCell,
        handleMouseDown,
        toggleTaskSelection,
        toggleAllTasks,
        handleCellEdit,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleColumnDragStart,
        handleColumnDragOver,
        handleColumnDrop,
        addTask,
        copySelectedTasks,
        deleteSelectedTasks,
    };
};
