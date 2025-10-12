'use client'

import React, { useEffect, useRef, useState } from 'react'
import axios from '@/config/axiosConfig'
import { useParams } from 'next/navigation'
import type { ParamValue } from 'next/dist/server/request/params'
import TaskDetailModal from '../TaskDetailModal'
import BacklogContent from './BacklogSections'

interface WorkItem { id: number; key: string; title: string; status: 'TO DO' | 'IN PROGRESS' | 'DONE'; assignee?: string; assigneeColor?: string; sprintId?: number | null }
interface Sprint { sprintId: number; name: string; projectId: number; status?: 'active' | 'planned' | 'completed'; workItems: WorkItem[] }

export default function BacklogView({ projectId }: { projectId: ParamValue }) {
    const [sprints, setSprints] = useState<Sprint[]>([])
    const [backlogItems, setBacklogItems] = useState<WorkItem[]>([])
    const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set(['backlog']))
    const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
    const [editingTitle, setEditingTitle] = useState('')
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
    const [isCreating, setIsCreating] = useState<false | number | 'backlog'>(false)
    const [newTaskTitles, setNewTaskTitles] = useState<{ [key: string]: string }>({})
    const { project_name } = useParams<{ project_name: string }>()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const scrollSpeed = useRef(0)
    const scrollFrame = useRef<number | null>(null)
    const footerRef = useRef<HTMLDivElement>(null);


    useEffect(() => { if (projectId) fetchData() }, [projectId])

    const fetchData = async () => {
        const [sprintRes, backlogRes, taskRes] = await Promise.all([
            axios.get(`/sprints/${projectId}`),
            axios.get(`/backlogs/${projectId}`),
            axios.get(`/tasks/${projectId}/list`)
        ])
        const allTasks: WorkItem[] = taskRes.data.map((t: any) => ({
            id: t.taskId, key: t.key || `TASK-${t.taskId}`, title: t.title, status: (t.status || 'TO DO').toUpperCase(), sprintId: t.sprintId
        }))
        const sprintData: Sprint[] = sprintRes.data.map((s: any) => ({
            ...s, workItems: allTasks.filter(t => t.sprintId === s.sprintId && t.sprintId !== -1)
        }))
        setSprints(sprintData)
        setBacklogItems(allTasks.filter(t => !t.sprintId || t.sprintId === -1))
    }

    const createTask = async (sprintId?: number) => {
        const key = sprintId ? sprintId.toString() : "backlog";
        const title = newTaskTitles[key];
        if (!title?.trim()) return;

        try {
            // 1️⃣ Gửi yêu cầu tạo task
            const body: any = {
                title,
                status: "TO DO",
            };
            if (sprintId) body.sprintId = sprintId;

            const res = await axios.post(`/tasks/list/${projectId}`, body);
            const taskId = res.data.taskId;

            // 2️⃣ Gọi API lấy chi tiết task vừa tạo
            const detailRes = await axios.get(`/tasks/detail/${projectId}/${taskId}`);
            const data = detailRes.data;

            // 3️⃣ Chuẩn hóa dữ liệu để thêm vào UI
            const newTask: WorkItem = {
                id: data.taskId,
                key: data.key || `TASK-${data.taskId}`,
                title: data.title,
                status: (data.status || "TO DO").toUpperCase(),
                sprintId: data.sprintId || null,
                assignee: data.assigneeName || "",
                assigneeColor: "#6366F1",
            };

            // 4️⃣ Cập nhật UI (Sprint hoặc Backlog)
            if (sprintId) {
                setSprints((prev) =>
                    prev.map((s) =>
                        s.sprintId === sprintId
                            ? { ...s, workItems: [...s.workItems, newTask] }
                            : s
                    )
                );
            } else {
                setBacklogItems((prev) => [...prev, newTask]);
            }

            // 5️⃣ Reset form
            setNewTaskTitles((prev) => ({ ...prev, [key]: "" }));
            setIsCreating(false);

        } catch (err) {
            console.error("❌ Error creating task:", err);
        }
    };

    const handleUpdateTask = async (taskId: number) => {
        try {
            await axios.patch(`/tasks/${projectId}/tasks/${taskId}/update`, {
                title: editingTitle,
            });

            setSprints((prev) =>
                prev.map((s) => ({
                    ...s,
                    workItems: s.workItems.map((t) =>
                        t.id === taskId ? { ...t, title: editingTitle } : t
                    ),
                }))
            );

            setBacklogItems((prev) =>
                prev.map((t) =>
                    t.id === taskId ? { ...t, title: editingTitle } : t
                )
            );
        } catch (error) {
            console.error('❌ Update task failed:', error);
        } finally {
            setEditingTaskId(null);
        }
    };

    // Cho phép thả
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    };

    // Khi thả vào Sprint
    const handleDropToSprint = async (e: React.DragEvent, sprintId: number) => {
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        if (!taskId) return;
        const movedTask =
            backlogItems.find(t => t.id === taskId) ||
            sprints.flatMap(s => s.workItems).find(t => t.id === taskId);
        if (!movedTask) return;

        if (movedTask.sprintId === sprintId) return;

        try {
            await axios.patch(`/tasks/${projectId}/tasks/${taskId}/update`, { sprintId });

            // Xác định task đang nằm ở đâu (Backlog hay Sprint khác)
            setSprints(prev =>
                prev.map(s => {
                    // Xóa khỏi sprint cũ
                    if (s.sprintId === movedTask.sprintId)
                        return { ...s, workItems: s.workItems.filter(t => t.id !== taskId) };

                    // Thêm vào sprint mới
                    if (s.sprintId === sprintId)
                        return { ...s, workItems: [...s.workItems, { ...movedTask, sprintId }] };

                    return s;
                })
            );

            // Nếu task nằm trong backlog → xóa khỏi backlog
            setBacklogItems(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("❌ Lỗi cập nhật sprintId:", err);
        }
    };

    // Khi thả lại vào Backlog
    const handleDropToBacklog = async (e: React.DragEvent) => {
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        if (!taskId) return;

        try {
            console.log("🔹PATCH sending:", { sprintId: -1 });
            await axios.patch(`/tasks/${projectId}/tasks/${taskId}/update`, { sprintId: -1 });

            // Cập nhật UI tại client
            setSprints(prev =>
                prev.map(s => ({
                    ...s,
                    workItems: s.workItems.filter(t => t.id !== taskId),
                }))
            );
            const movedTask = sprints.flatMap(s => s.workItems).find(t => t.id === taskId);
            if (movedTask) setBacklogItems(prev => [...prev, { ...movedTask, sprintId: null }]);
        } catch (err) {
            console.error("❌ Lỗi move về backlog:", err);
        }
    }

    const startAutoScroll = (direction: "up" | "down") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const speed = 12; // tốc độ cuộn px/frame
        const step = () => {
            if (direction === "up") {
                container.scrollTop = Math.max(0, container.scrollTop - speed);
            } else {
                container.scrollTop = Math.min(
                    container.scrollHeight,
                    container.scrollTop + speed
                );
            }
            scrollFrame.current = requestAnimationFrame(step);
        };

        if (!scrollFrame.current) {
            scrollFrame.current = requestAnimationFrame(step);
        }
    };

    const stopAutoScroll = () => {
        if (scrollFrame.current) {
            cancelAnimationFrame(scrollFrame.current);
            scrollFrame.current = null;
        }
    };

    const handleAutoScroll = (e: DragEvent) => {
        const container = scrollContainerRef.current;
        const footer = footerRef.current;
        if (!container || !footer) return;

        const rect = container.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();

        const y = e.clientY;
        const edgeThreshold = 80; // px vùng kích hoạt scroll

        const isAboveTop = y < rect.top + edgeThreshold;
        const isBelowBottom = y > rect.bottom - edgeThreshold;
        const isOverFooter = y >= footerRect.top; // con trỏ đang ở trên footer hoặc thấp hơn

        if (isAboveTop) {
            startAutoScroll("up");
        } else if (isBelowBottom || isOverFooter) {
            startAutoScroll("down");
        } else {
            stopAutoScroll();
        }
    };

    // Lắng nghe global dragover
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const onDragOver = (e: DragEvent) => handleAutoScroll(e);
        const stop = () => stopAutoScroll();

        container.addEventListener("dragover", onDragOver);
        container.addEventListener("dragend", stop);
        container.addEventListener("drop", stop);

        return () => {
            container.removeEventListener("dragover", onDragOver);
            container.removeEventListener("dragend", stop);
            container.removeEventListener("drop", stop);
        };
    }, []);

    const toggleSprint = (id: string) => setExpandedSprints(prev => {
        const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
    })

    return (
        <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm overflow-hidden">
            <div
                ref={scrollContainerRef}
                className="flex flex-col overflow-y-auto bg-white border rounded-lg shadow-sm"
                onDragOver={(e) => e.preventDefault()} // để nhận drag event toàn vùng
            >
                <BacklogContent
                    {...{
                        sprints, backlogItems, expandedSprints, selectedTasks, editingTaskId, editingTitle, isCreating, newTaskTitles,
                        toggleSprint, handleDragOver, handleDropToSprint, handleDropToBacklog, handleUpdateTask, createTask,
                        setEditingTaskId, setEditingTitle, setSelectedTaskId, setSelectedTasks, setIsCreating, setNewTaskTitles
                    }}
                />
            </div>
            {/* Footer cố định */}
            <div className="h-[60px] border-t bg-gray-50 flex items-center justify-between px-4">
                <span className="text-sm text-gray-500">+ Create new work item</span>
                <button
                    onClick={() => setIsCreating('backlog')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                    Create Task
                </button>
            </div>

            {selectedTaskId && (
                <TaskDetailModal
                    projectId={Number(projectId)}
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}

        </div>
    )
}
