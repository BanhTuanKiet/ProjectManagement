"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "@/config/axiosConfig";
import { Member, UserMini } from "@/utils/IUser";
import {
    mapApiTaskToTask,
    Task,
} from "@/utils/mapperUtil";
import { BasicTask } from "@/utils/ITask";
import { Column, initialColumns } from "@/config/columsConfig";
import { useProject } from "@/app/(context)/ProjectContext";
import { useDebounce } from "@/hooks/useDebounce";

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
    const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
    
    const { project_name, members } = useProject();
    const [filters, setFilters] = useState<Record<string, string>>({});
    const debouncedSearch = useDebounce(searchQuery, 400);

    // 1. Đồng bộ Members từ Project Context
    useEffect(() => {
        if (members) {
            setAvailableUsers(members);
        }
    }, [members]);

    // 2. Logic Filter/Search Mode
    const isFiltering = useMemo(() => {
        return Object.keys(filters).length > 0 || debouncedSearch.trim() !== "";
    }, [filters, debouncedSearch]);

    // 3. DUY NHẤT 1 Effect để quản lý việc đồng bộ hóa danh sách Task
    useEffect(() => {
        const syncTasks = async () => {
            if (isFiltering) {
                try {
                    const params = {
                        ...filters,
                        keyword: debouncedSearch.trim() || undefined,
                    };
                    const res = await axios.get(`/tasks/${Number(project_name)}/filter-by`, { params });
                    const mapped = res.data.map(mapApiTaskToTask);
                    setTasks(mapped);
                } catch (err) {
                    console.error("Filter error:", err);
                }
            } else {
                // Khi không filter, lấy trực tiếp từ currentTasks (SignalR/Context)
                setTasks(currentTasks.map(mapApiTaskToTask));
            }
        };

        syncTasks();
    }, [currentTasks, isFiltering, filters, debouncedSearch, project_name]);

    // 4. Cập nhật Resize Columns
    const resizingColumn = useRef<{
        index: number;
        startX: number;
        startWidth: number;
    } | null>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent, columnIndex: number) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = columns[columnIndex].width;
        resizingColumn.current = { index: columnIndex, startX, startWidth };

        const handleMouseMove = (e: MouseEvent) => {
            if (!resizingColumn.current) return;
            const deltaX = e.clientX - resizingColumn.current.startX;
            const newWidth = Math.max(columns[resizingColumn.current.index].minWidth, resizingColumn.current.startWidth + deltaX);
            setColumns((prev) => prev.map((col, i) => i === resizingColumn.current?.index ? { ...col, width: newWidth } : col));
        };

        const handleMouseUp = () => {
            resizingColumn.current = null;
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }, [columns]);

    // 5. Cập nhật Cell Edit với cơ chế Rollback
    const handleCellEdit = useCallback(
        async (taskId: number, field: string, value: EditValue) => {
            const currentTask = tasks.find((t) => t.id === taskId);
            if (!currentTask) return;
            if (currentTask[field as keyof Task] === value) {
                setEditingCell(null);
                return;
            }

            // Backup dữ liệu cũ để rollback nếu API lỗi
            const originalTasks = [...tasks];

            try {
                const payload: Record<string, string | number | null | undefined> = {};
                if (field === "assignee") {
                    payload["assigneeId"] = (value && typeof value === "object" && "userId" in value) ? (value as Member).userId : null;
                } else if (field === "priority") {
                    const priorityMap: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
                    payload["priority"] = typeof value === "string" ? priorityMap[value] : (value as number);
                } else if (field === "dueDate") {
                    payload["deadline"] = value as string;
                } else if (field === "summary") {
                    payload["title"] = value as string;
                } else {
                    payload[field] = value ? String(value) : null;
                }

                setTasks((prev) =>
                    prev.map((t) => t.id === taskId ? { ...t, [field]: value } : t)
                );

                const response = await axios.put(`/tasks/${Number(project_name)}/tasks/${taskId}/update`, payload);

                const serverData = response.data.task.task || response.data.task;
                console.log("Server data:", serverData);
                const updatedTask = mapApiTaskToTask(serverData);
                console.log("Updated task:", updatedTask);

                setTasks((prev) =>
                    prev.map((t) => (t.id === taskId ? updatedTask : t))
                );
            } catch (error) {
                console.error("Update failed:", error);
                setTasks(originalTasks);
            } finally {
                setEditingCell(null);
            }
        },
        [tasks, project_name]
    );

    // 6. Các hàm Drag & Drop và tính năng bổ trợ (Giữ nguyên)
    const toggleTaskSelection = useCallback((taskId: number) => {
        setSelectedTasks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) newSet.delete(taskId);
            else newSet.add(taskId);
            return newSet;
        });
    }, []);

    const toggleAllTasks = useCallback(() => {
        setSelectedTasks((prev) => (prev.size === tasks.length ? new Set() : new Set(tasks.map((t) => t.id))));
    }, [tasks]);

    const handleDragStart = useCallback((e: React.DragEvent, taskId: number) => {
        setDraggedTask(taskId);
        e.dataTransfer.effectAllowed = "move";
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetTaskId: number) => {
        e.preventDefault();
        if (!draggedTask || draggedTask === targetTaskId) return;
        const newTasks = [...tasks];
        const draggedIndex = newTasks.findIndex((t) => t.id === draggedTask);
        const targetIndex = newTasks.findIndex((t) => t.id === targetTaskId);
        const [draggedItem] = newTasks.splice(draggedIndex, 1);
        newTasks.splice(targetIndex, 0, draggedItem);
        setTasks(newTasks);
        setDraggedTask(null);
    }, [draggedTask, tasks]);

    const handleColumnDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedColumnIndex(index);
        e.dataTransfer.effectAllowed = "move";
    }, []);

    const handleColumnDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) return;
        const newColumns = [...columns];
        const [moved] = newColumns.splice(draggedColumnIndex, 1);
        newColumns.splice(targetIndex, 0, moved);
        setColumns(newColumns);
        setDraggedColumnIndex(null);
    }, [draggedColumnIndex, columns]);

    const addTask = useCallback((newTask: Task) => {
        setTasks((prev) => [...prev, newTask]);
    }, []);

    const copySelectedTasks = useCallback(() => {
        const tasksToCopy = tasks.filter((t) => selectedTasks.has(t.id));
        if (tasksToCopy.length === 0) return;
        const clonedTasks = tasksToCopy.map((t) => ({
            ...t,
            id: -Math.floor(Math.random() * 1000000),
            key: `${t.key}-COPY`,
        }));
        setTasks((prev) => [...prev, ...clonedTasks]);
    }, [tasks, selectedTasks]);

    const deleteSelectedTasks = useCallback(async () => {
        const toDelete = Array.from(selectedTasks);
        if (toDelete.length === 0) return;
        try {
            await axios.delete(`/tasks/bulk-delete/${project_name}`, {
                data: { projectId: Number(project_name), ids: toDelete },
            });
            setTasks((prev) => prev.filter((t) => !selectedTasks.has(t.id)));
            setSelectedTasks(new Set());
        } catch (err) {
            console.error("Delete error:", err);
        }
    }, [selectedTasks, project_name]);

    const totalWidth = useMemo(() => columns.reduce((s, c) => s + c.width, 0), [columns]);

    return {
        tasks, availableUsers, columns, selectedTasks, searchQuery, filters, setFilters, setSearchQuery,
        editingCell, totalWidth, setEditingCell, handleMouseDown, toggleTaskSelection, toggleAllTasks,
        handleCellEdit, handleDragStart, handleDragOver, handleDrop, handleColumnDragStart,
        handleColumnDragOver: (e: React.DragEvent) => e.preventDefault(), handleColumnDrop,
        addTask, copySelectedTasks, deleteSelectedTasks,
    };
};