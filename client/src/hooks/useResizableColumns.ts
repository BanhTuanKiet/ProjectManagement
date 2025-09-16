"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "@/config/axiosConfig";
import { UserMini } from "@/utils/IUser";
import { mapApiTaskToTask, mapApiUserToUserMini, Task } from "@/utils/mapperUtil";
import { BasicTask } from "@/utils/ITask";
import { Column, initialColumns } from "@/config/columsConfig";

export const useTaskTable = (tasksnomal: BasicTask[]) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserMini[]>([]);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Fetch users + tasks
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/users");
        const mappedUsers = response.data.map(mapApiUserToUserMini);
        const mappedTasks = tasksnomal.map(mapApiTaskToTask);
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
  const toggleTaskSelection = useCallback((taskId: string) => {
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
  const handleCellEdit = useCallback((taskId: string, field: string, value: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)));
    setEditingCell(null);
  }, []);

  // Drag & Drop
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetTaskId: string) => {
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
  };
};
