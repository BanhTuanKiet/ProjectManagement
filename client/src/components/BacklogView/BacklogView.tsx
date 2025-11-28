'use client'

import React, { useEffect, useRef, useState } from 'react'
import axios from '@/config/axiosConfig'
import { useParams } from 'next/navigation'
import type { ParamValue } from 'next/dist/server/request/params'
import TaskDetailModal from '../TaskDetailModal'
import BacklogContent from './BacklogSections'
import { useProject } from '@/app/(context)/ProjectContext'
import SprintCard from '../SprintCard'
import { Plus, Trash2 } from 'lucide-react'
import { useTask } from '@/app/(context)/TaskContext'
import { Console } from 'console'
import { Toaster } from 'react-hot-toast'


interface WorkItem { id: number; key: string; title: string; status: 'TO DO' | 'IN PROGRESS' | 'DONE'; assignee?: string; assigneeColor?: string; sprintId?: number | null, deadline?: string; }
interface Sprint { sprintId: number; name: string; projectId: number; status?: 'active' | 'planned' | 'completed'; workItems: WorkItem[], startDate: string; endDate: string }

export default function BacklogView() {
    const [sprints, setSprints] = useState<Sprint[]>([])
    const [backlogItems, setBacklogItems] = useState<WorkItem[]>([])
    const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set(['backlog']))
    const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
    const [editingTitle, setEditingTitle] = useState('')
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
    const [isCreating, setIsCreating] = useState<false | number | 'backlog'>(false)
    const [newTaskTitles, setNewTaskTitles] = useState<{ [key: string]: string }>({})
    const { project_name } = useProject()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const scrollSpeed = useRef(0)
    const scrollFrame = useRef<number | null>(null)
    const footerRef = useRef<HTMLDivElement>(null);
    const [showSprintForm, setShowSprintForm] = useState(false)
    const ProjectId = Number(project_name);
    const { tasks, connection } = useTask()
    const [selectedSprints, setSelectedSprints] = useState<Set<number>>(new Set());

    console.log("task in backlog view:", tasks);
    useEffect(() => {
        if (!project_name) return
        fetchData()
    }, [project_name, tasks])

    const fetchData = async () => {
        const [sprintRes] = await Promise.all([
            axios.get(`/sprints/${ProjectId}`)
        ])
        const kkk = sprintRes.data;
        console.log(kkk);
        const normalizeStatus = (status: string): 'TO DO' | 'IN PROGRESS' | 'DONE' => {
            const upper = status?.toUpperCase();
            if (['TO DO', 'IN PROGRESS', 'DONE'].includes(upper)) {
                return upper as 'TO DO' | 'IN PROGRESS' | 'DONE';
            }
            return 'TO DO';
        };

        const allTasks: WorkItem[] = tasks.map((t: any) => ({
            id: t.taskId,
            key: t.key || `TASK-${t.taskId}`,
            title: t.title,
            status: normalizeStatus(t.status),
            sprintId: t.sprintId,
            deadline: t.deadline
        }));


        const sprintData: Sprint[] = sprintRes.data.map((s: any) => ({
            ...s,
            workItems: allTasks.filter(t => t.sprintId === s.sprintId && t.sprintId !== -1)
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
            const payload = {
                title: title,
                sprintId: sprintId && sprintId !== -1 ? sprintId : null,
            };

            await axios.post(`/tasks/quick-create/${ProjectId}`, payload);
            setNewTaskTitles(prev => ({ ...prev, [key]: "" }));
            setIsCreating(false);

            setNewTaskTitles(prev => ({ ...prev, [key]: "" }));
            setIsCreating(false);
        } catch (err) {
            console.error("❌ Error creating task:", err);
        }
    };

    const handleUpdateTask = async (taskId: number) => {
        try {
            await axios.patch(`/tasks/${ProjectId}/tasks/${taskId}/update`, {
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
        e.preventDefault();
        e.stopPropagation();
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

        // 🔹 Lấy sprint mục tiêu
        const targetSprint = sprints.find(s => s.sprintId === sprintId);
        if (!targetSprint) return;

        const hasValidDeadline =
            movedTask.deadline &&
            movedTask.deadline !== "" &&
            movedTask.deadline !== "0001-01-01T00:00:00" &&
            !isNaN(new Date(movedTask.deadline).getTime());

        // 🔹 Kiểm tra hạn task có nằm trong khoảng sprint hay không
        if (hasValidDeadline) {
            const deadline = new Date(movedTask.deadline as string);
            const start = new Date(targetSprint.startDate!);
            const end = new Date(targetSprint.endDate!);

            if (deadline < start || deadline > end) {
                alert(
                    `⚠️ Deadline của task (${deadline.toLocaleDateString()}) không nằm trong thời gian sprint (${start.toLocaleDateString()} → ${end.toLocaleDateString()})`
                );
                return;
            }
        }

        // ✅ Nếu hợp lệ thì cập nhật sprintId
        try {
            await axios.put(`/tasks/${ProjectId}/tasks/${taskId}/update`, { sprintId });
            setSprints(prev => {
                const updated = prev.map(s => {
                    if (s.sprintId === movedTask.sprintId)
                        return { ...s, workItems: s.workItems.filter(t => t.id !== taskId) };
                    if (s.sprintId === sprintId)
                        return { ...s, workItems: [...s.workItems, { ...movedTask, sprintId }] };
                    return s;
                });
                return updated;
            });

            setBacklogItems(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("❌ Lỗi cập nhật sprintId:", err);
        }
    };


    // Khi thả lại vào Backlog
    const handleDropToBacklog = async (e: React.DragEvent) => {
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        if (!taskId) return;

        const movedTask =
            backlogItems.find(t => t.id === taskId) ||
            sprints.flatMap(s => s.workItems).find(t => t.id === taskId);

        if (!movedTask) return;

        try {
            console.log("🔹PATCH sending:", { sprintId: -1 });
            await axios.put(`/tasks/${ProjectId}/tasks/${taskId}/update`, { sprintId: -1 });

            // Cập nhật UI tại client
            setSprints(prev =>
                prev.map(s => ({
                    ...s,
                    workItems: s.workItems.filter(t => t.id !== taskId),
                }))
            );

            // 🔸 Thêm vào backlog
            setBacklogItems(prev => [...prev, { ...movedTask, sprintId: null }]);
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

    const handleCreateSprint = async (name: string, startDate: string, endDate: string) => {
        try {
            const res = await axios.post(`/sprints/${ProjectId}`, {
                projectId: ProjectId,
                name,
                startDate,
                endDate,
            })

            // Giả sử API trả về object sprint vừa tạo (quan trọng!)
            const newSprint = res.data

            // CẬP NHẬT STATE LOCAL. Đây là chìa khóa!
            setSprints(prevSprints => [
                ...prevSprints,
                { ...newSprint, workItems: [] } // Thêm sprint mới vào state
            ])

            alert("✅ Sprint created successfully")
            setShowSprintForm(false) // Đóng form

        } catch (err) {
            console.error("❌ Create sprint failed:", err)
            alert("❌ Lỗi tạo sprint")
        }
        // KHÔNG RELOAD TRANG
    }

    const handleDeleteSelectedSprints = async () => {
        if (selectedSprints.size === 0) return;
        if (!confirm(`Delete ${selectedSprints.size} selected sprint(s)?`)) return;

        try {
            await axios.delete(`sprints/${ProjectId}/bulk`, {
                data: Array.from(selectedSprints),
            });

            setSprints((prev) => prev.filter((s) => !selectedSprints.has(s.sprintId)));
            setSelectedSprints(new Set());
            alert("✅ Deleted successfully");
        } catch (err) {
            console.error("❌ Bulk delete failed:", err);
            alert("❌ Failed to delete selected sprints");
        }
    };

    const handleUpdateSprintDate = async (sprintId: number, field: 'startDate' | 'endDate', value: string) => {
        try {
            if (field === 'startDate') {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    alert("⚠️ Ngày bắt đầu Sprint không được nhỏ hơn ngày hiện tại.");
                    return;
                }
                if (selectedDate > new Date(sprints.find(s => s.sprintId === sprintId)?.endDate || '')) {
                    alert("⚠️ Ngày bắt đầu Sprint không được lớn hơn ngày kết thúc.");
                    return;
                }
            }

            if (field === 'endDate') {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    alert("⚠️ Ngày kết thúc Sprint không được nhỏ hơn ngày hiện tại.");
                    return;
                }
                if (selectedDate < new Date(sprints.find(s => s.sprintId === sprintId)?.startDate || '')) {
                    alert("⚠️ Ngày kết thúc Sprint không được nhỏ hơn ngày bắt đầu.");
                    return;
                }
            }

            setSprints((prev) =>
                prev.map((s) =>
                    s.sprintId === sprintId ? { ...s, [field]: value } : s
                )
            );

            await axios.put(`/sprints/${sprintId}`, { [field]: value });
            console.log(`✅ Updated ${field} of sprint ${sprintId} to ${value}`);
        } catch (err) {
            console.error("❌ Failed to update sprint date:", err);
            alert("Lỗi khi cập nhật ngày sprint");
        }
    };

    const handleDeleteSelectedTasks = async () => {
        if (selectedTasks.size === 0) return;
        if (!confirm(`Delete ${selectedTasks.size} selected task(s)?`)) return;

        const toDelete = Array.from(selectedTasks);

        try {
            await axios.delete(`/tasks/${ProjectId}/bulk`, {
                data: toDelete
            });

            setSprints(prev => prev.map(s => ({
                ...s,
                workItems: s.workItems.filter(t => !selectedTasks.has(t.id))
            })));
            setBacklogItems(prev => prev.filter(t => !selectedTasks.has(t.id)));
            setSelectedTasks(new Set());

        } catch (err) {
            console.error("❌ Failed to delete tasks:", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="border-b bg-gray-50 px-4 py-3 flex justify-between items-center">
                <h1 className="font-semibold text-gray-700">Sprints</h1>
                <button
                    onClick={() => setShowSprintForm(true)} // Mở form
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                    <Plus className="w-4 h-4" />
                    Add Sprint
                </button>
            </div>
            <Toaster position="top-right" />
            <SprintCard
                showForm={showSprintForm}
                onClose={() => setShowSprintForm(false)}
                onCreate={handleCreateSprint}
            />
            <div
                ref={scrollContainerRef}
                className="flex flex-col overflow-y-auto bg-white border rounded-lg shadow-sm"
                onDragOver={(e) => e.preventDefault()} // để nhận drag event toàn vùng
            >
                <BacklogContent
                    {...{
                        ProjectId, sprints, backlogItems, expandedSprints, selectedTasks, editingTaskId, editingTitle, isCreating, newTaskTitles,
                        toggleSprint, handleDragOver, handleDropToSprint, handleDropToBacklog, handleUpdateTask, createTask,
                        setEditingTaskId, setEditingTitle, setSelectedTaskId, setSelectedTasks, setIsCreating, setNewTaskTitles, selectedSprints, setSelectedSprints, handleUpdateSprintDate
                    }}
                />
            </div>
            {(selectedSprints.size > 0 || selectedTasks.size > 0) && (
                <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-gray-200 rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">

                    {selectedSprints.size > 0 && (
                        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-white shadow-lg border rounded-lg px-6 py-3 flex items-center gap-4 z-50">
                            <span className="text-sm text-gray-700">
                                {selectedSprints.size} sprint{selectedSprints.size > 1 ? "s" : ""} selected
                            </span>
                            <button
                                onClick={handleDeleteSelectedSprints}
                                className="px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    )}

                    {selectedTasks.size > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">
                                {selectedTasks.size} task(s)
                            </span>
                            <button
                                onClick={handleDeleteSelectedTasks}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Task
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => { setSelectedSprints(new Set()); setSelectedTasks(new Set()); }}
                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                        Clear selection
                    </button>
                </div>
            )}

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

            {/* {selectedTaskId && (
                <TaskDetailModal
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )} */}
        </div>
    )
}
