"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "@/config/axiosConfig";
import { UserMini } from "@/utils/IUser";
import { mapApiTaskToTask, mapApiUserToUserMini, Task, mapTaskToApiUpdatePayload } from "@/utils/mapperUtil";
import { BasicTask } from "@/utils/ITask";
import { Column, initialColumns } from "@/config/columsConfig";
import { useProject } from "@/app/(context)/ProjectContext";

export const useTaskTable = (tasksnomal: BasicTask[]) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [availableUsers, setAvailableUsers] = useState<UserMini[]>([]);
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCell, setEditingCell] = useState<{ taskId: number; field: string } | null>(null);
    const [draggedTask, setDraggedTask] = useState<number | null>(null);
    const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
    const { project_name } = useProject()
    // Fetch users + tasks
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("/users");
                //console.log("Fetched users:", response.data);
                const mappedUsers = response.data.map(mapApiUserToUserMini);
                //console.log("Mapped users:", mappedUsers);
                const mappedTasks = tasksnomal.map(mapApiTaskToTask);
                //console.log("Mapped tasks:", mappedTasks);
                setTasks(mappedTasks);
                setAvailableUsers(mappedUsers);
            } catch (error) {
                console.log("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, [tasksnomal]);

    // Resize columns
    const resizingColumn = useRef<{ index: number; startX: number; startWidth: number } | null>(null);

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
                    prev.map((col, i) => (i === index ? { ...col, width: newWidth } : col))
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
        async (taskId: number, field: string, value: string) => {
            try {
                // Lấy task hiện tại trong state
                const currentTask = tasks.find((t) => t.id === taskId)
                if (!currentTask) return

                const updatedTask = { ...currentTask, [field]: value }
                const payload = mapTaskToApiUpdatePayload(updatedTask)

                await axios.put(`/tasks/${Number(project_name)}/tasks/${taskId}/update`, payload);
                setTasks((prev) =>
                    prev.map((t) => (t.id === taskId ? updatedTask : t))
                );
            } catch (error) {
                console.error("Error updating task:", error);
            } finally {
                setEditingCell(null)
            }
        },
        [tasks, project_name] // cần depend vào tasks để lấy task hiện tại
    )

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
    const handleColumnDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedColumnIndex(index);
        e.dataTransfer.effectAllowed = "move";
    }, []);

    const handleColumnDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleColumnDrop = useCallback(
        (e: React.DragEvent, targetIndex: number) => {
            e.preventDefault();
            if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) return;

            const newColumns = [...columns];
            const [moved] = newColumns.splice(draggedColumnIndex, 1);
            newColumns.splice(targetIndex, 0, moved);

            setColumns(newColumns);
            setDraggedColumnIndex(null);
        },
        [draggedColumnIndex, columns]
    );

    // Filter
    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            const summary = t.summary?.toLowerCase() || "";
            const key = t.key?.toLowerCase() || "";
            return (
                summary.includes(searchQuery.toLowerCase()) ||
                key.includes(searchQuery.toLowerCase())
            );
        });
    }, [tasks, searchQuery]);

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
            key: `${t.key}-COPY`
        }));

        setTasks((prev) => [...prev, ...clonedTasks]);
    }, [tasks, selectedTasks]);

    // Delete các task được chọn
    const deleteSelectedTasks = useCallback(async () => {
        const toDelete = Array.from(selectedTasks);
        if (toDelete.length === 0) return;

        try {
            // Gọi API BE xóa nhiều task (nếu có)
            await axios.delete("/tasks/bulk-delete", { data: { projectId: 1, ids: toDelete } });

            // Xóa trên FE
            setTasks((prev) => prev.filter((t) => !selectedTasks.has(t.id)));
            setSelectedTasks(new Set()); // clear selection
        } catch (err) {
            console.error("Delete error:", err);
        }
    }, [selectedTasks, tasks]);



    const totalWidth = useMemo(() => columns.reduce((s, c) => s + c.width, 0), [columns]);

    return {
        tasks,
        availableUsers,
        columns,
        selectedTasks,
        searchQuery,
        editingCell,
        filteredTasks,
        totalWidth,
        setSearchQuery,
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
