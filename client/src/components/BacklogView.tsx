'use client'

import React, { useEffect, useState } from 'react'
import axios from '@/config/axiosConfig'
import { useParams } from 'next/navigation'
import type { ParamValue } from 'next/dist/server/request/params'
import TaskDetailModal from './TaskDetailModal'
import {
    Search, Filter, ChevronDown, ChevronRight,
    Plus, MoreHorizontal, TrendingUp, Settings
} from 'lucide-react'
import { TaskBody, TaskResponse } from '@/utils/ITask'
import { Sprint, WorkItem } from '@/utils/ISprint'



export default function BacklogView({ projectId }: { projectId: ParamValue }) {
    const [sprints, setSprints] = useState<Sprint[]>([])
    const [backlogItems, setBacklogItems] = useState<WorkItem[]>([])
    const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set(['backlog']))
    const [searchQuery, setSearchQuery] = useState('')
    const { project_name } = useParams<{ project_name: string }>()
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>('');
    const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isCreating, setIsCreating] = useState<false | number | "backlog">(false);
    const [newTaskTitles, setNewTaskTitles] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (!projectId) return
        fetchData()
    }, [projectId])

    const fetchData = async () => {
        try {
            const [sprintRes, backlogRes, taskRes] = await Promise.all([
                axios.get(`/sprints/${projectId}`),
                axios.get(`/backlogs/${projectId}`),
                axios.get(`/tasks/${projectId}/list`)
            ])

            const sprintData: Sprint[] = sprintRes.data || []
            const allTasks: WorkItem[] = taskRes.data.map((t: TaskResponse) => ({
                id: t.taskId,
                key: t.key || `TASK-${t.taskId}`,
                title: t.title,
                status: (t.status || 'TO DO').toUpperCase(),
                sprintId: t.sprintId,
                assignee: t.assigneeName || '',
                assigneeColor: '#6366F1'
            }))

            const sprintMap = sprintData.map(s => ({
                ...s,
                workItems: allTasks.filter(t => t.sprintId === s.sprintId && t.sprintId !== -1)
            }))

            const backlogTasks = allTasks.filter(t => !t.sprintId || t.sprintId === -1)

            setSprints(sprintMap)
            setBacklogItems(backlogTasks)
        } catch (err) {
            console.error('❌ Fetch failed:', err)
        }
    }

    const createTask = async (sprintId?: number) => {
        const key = sprintId ? sprintId.toString() : "backlog";
        const title = newTaskTitles[key];
        if (!title?.trim()) return;

        try {
            // 1️⃣ Gửi yêu cầu tạo task
            const body: TaskBody = {
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

    const toggleSprint = (sprintId: string) => {
        setExpandedSprints(prev => {
            const newSet = new Set(prev)
            newSet.has(sprintId) ? newSet.delete(sprintId) : newSet.add(sprintId)
            return newSet
        })
    }

    const getStatusCounts = (items: WorkItem[]) => ({
        todo: items.filter(i => i.status === 'TO DO').length,
        inProgress: items.filter(i => i.status === 'IN PROGRESS').length,
        done: items.filter(i => i.status === 'DONE').length
    })

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
        e.preventDefault();
    };

    // Khi thả vào Sprint
    const handleDropToSprint = async (e: React.DragEvent, sprintId: number) => {
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        if (!taskId) return;

        try {
            // Gọi API cập nhật sprintId
            await axios.patch(`/tasks/${projectId}/tasks/${taskId}/update`, { sprintId });

            // Cập nhật UI tại client
            setBacklogItems(prev => prev.filter(t => t.id !== taskId));
            setSprints(prev =>
                prev.map(s =>
                    s.sprintId === sprintId
                        ? { ...s, workItems: [...s.workItems, backlogItems.find(t => t.id === taskId)!] }
                        : s
                )
            );
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
    };



    return (
        <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm">
            {/* Header */}
            <div className="border-b sticky top-0 z-40 border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search backlog"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded"><TrendingUp className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded"><Settings className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Scrollable content (the only scroll layer) */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Sprint list */}
                {sprints.map((sprint) => {
                    const counts = getStatusCounts(sprint.workItems)
                    const isExpanded = expandedSprints.has(sprint.sprintId.toString())

                    return (
                        <div key={sprint.sprintId} className="mb-6 border-b border-gray-100 pb-4">
                            {/* Sprint Header */}
                            <div className="flex items-center justify-between py-3 group relative">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleSprint(sprint.sprintId.toString())}
                                        className="hover:bg-gray-100 p-1 rounded"
                                    >
                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>

                                    {/* Sprint name + Edit icon */}
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-semibold">{sprint.name}</h2>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                                            title="Edit sprint name"
                                        >
                                            {/* Pencil/Edit icon */}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <span className="text-sm text-gray-500">
                                        ({sprint.workItems.length} work items)
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">{counts.todo}</span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{counts.inProgress}</span>
                                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">{counts.done}</span>
                                    </div>
                                    <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                                        {sprint.status === 'active' ? 'Complete sprint' : 'Start sprint'}
                                    </button>
                                </div>
                            </div>

                            {/* Sprint Items */}
                            {isExpanded && (
                                <div
                                    className="ml-8 space-y-2"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDropToSprint(e, sprint.sprintId)}
                                >
                                    {sprint.workItems.length > 0 ? sprint.workItems.map((item) => (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData("taskId", item.id.toString())}
                                            className="group flex items-center justify-between py-2 px-4 rounded hover:bg-blue-50 cursor-pointer transition"
                                            onClick={(e) => {
                                                // Chỉ mở modal khi không click checkbox
                                                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                    setSelectedTaskId(item.id);
                                                }
                                            }}

                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTasks.has(item.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTasks(prev => {
                                                            const newSet = new Set(prev);
                                                            if (e.target.checked) newSet.add(item.id);
                                                            else newSet.delete(item.id);
                                                            return newSet;
                                                        });
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{item.key}</span>
                                                {editingTaskId === item.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onBlur={() => handleUpdateTask(item.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateTask(item.id)
                                                            if (e.key === 'Escape') setEditingTaskId(null)
                                                        }}
                                                        className="border rounded px-1 text-sm"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-600">{item.title}</span>
                                                )}
                                                {/* ✏️ Edit icon - hiện khi hover dòng */}
                                                <button
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                                                    title="Edit task"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingTaskId(item.id);
                                                        setEditingTitle(item.title);
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        className="w-4 h-4 text-gray-600"
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036 a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5 L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </div>


                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Eye button */}
                                                <button className="p-1 rounded hover:bg-gray-200" onClick={(e) => e.stopPropagation()}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>

                                                {/* More button */}
                                                <button className="p-1 rounded hover:bg-gray-200" onClick={(e) => e.stopPropagation()}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h.01M12 12h.01M18 12h.01" />
                                                    </svg>
                                                </button>

                                                <select
                                                    className="px-2 py-1 text-sm bg-gray-100 rounded"
                                                    value={item.status}
                                                    onChange={(e) => { e.stopPropagation(); }}
                                                >
                                                    <option>TO DO</option>
                                                    <option>IN PROGRESS</option>
                                                    <option>DONE</option>
                                                </select>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-4 text-gray-500 text-sm italic">
                                            No work items in this sprint.
                                        </div>
                                    )}
                                    {isCreating === sprint.sprintId ? (
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="text"
                                                placeholder="Enter task summary..."
                                                value={newTaskTitles[sprint.sprintId] || ""}
                                                onChange={(e) =>
                                                    setNewTaskTitles((prev) => ({
                                                        ...prev,
                                                        [sprint.sprintId]: e.target.value,
                                                    }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") createTask(sprint.sprintId);
                                                    if (e.key === "Escape") {
                                                        setIsCreating(false);
                                                        setNewTaskTitles((prev) => ({ ...prev, [sprint.sprintId]: "" }));
                                                    }
                                                }}
                                                className="border rounded px-2 py-1 text-sm w-64"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => createTask(sprint.sprintId)}
                                                className="bg-black text-white px-3 py-1 rounded text-sm"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsCreating(false);
                                                    setNewTaskTitles((prev) => ({ ...prev, [sprint.sprintId]: "" }));
                                                }}
                                                className="text-sm text-gray-500"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsCreating(sprint.sprintId)}
                                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mt-2"
                                        >
                                            <Plus className="w-4 h-4" /> Create
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Backlog Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between py-3 group">
                        <div className="flex items-center gap-3">
                            <button onClick={() => toggleSprint('backlog')} className="hover:bg-gray-100 p-1 rounded">
                                {expandedSprints.has('backlog')
                                    ? <ChevronDown className="w-4 h-4" />
                                    : <ChevronRight className="w-4 h-4" />}
                            </button>

                            {/* Backlog title + Edit icon */}
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold">Backlog</h2>
                                <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                                    title="Edit backlog name"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>

                            <span className="text-sm text-gray-500">
                                ({backlogItems.length} work items)
                            </span>
                        </div>

                        <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Create sprint</button>
                    </div>

                    {expandedSprints.has('backlog') && (
                        <div className="ml-8 space-y-2" onDragOver={handleDragOver} onDrop={handleDropToBacklog}>
                            {backlogItems.length > 0 ? backlogItems.map((item) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData("taskId", item.id.toString())}
                                    className="group flex items-center justify-between py-2 px-4 rounded hover:bg-gray-100 cursor-pointer transition"
                                    onClick={(e) => {
                                        // Chỉ mở modal khi không click checkbox
                                        if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                            setSelectedTaskId(item.id);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedTasks.has(item.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setSelectedTasks(prev => {
                                                    const newSet = new Set(prev);
                                                    if (e.target.checked) newSet.add(item.id);
                                                    else newSet.delete(item.id);
                                                    return newSet;
                                                });
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{item.key}</span>

                                        {editingTaskId === item.id ? (
                                            <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onBlur={() => handleUpdateTask(item.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdateTask(item.id)
                                                    if (e.key === 'Escape') setEditingTaskId(null)
                                                }}
                                                className="border rounded px-1 text-sm"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-600">{item.title}</span>
                                        )}

                                        {/* ✏️ Edit icon - hiện khi hover dòng */}
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                                            title="Edit task"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingTaskId(item.id);
                                                setEditingTitle(item.title);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4 text-gray-600"
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036 a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5 L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 rounded hover:bg-gray-200" onClick={(e) => e.stopPropagation()}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>

                                        <button className="p-1 rounded hover:bg-gray-200" onClick={(e) => e.stopPropagation()}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h.01M12 12h.01M18 12h.01" />
                                            </svg>
                                        </button>

                                        <select
                                            className="px-2 py-1 text-sm bg-gray-100 rounded"
                                            value={item.status}
                                            onChange={(e) => { e.stopPropagation(); }}
                                        >
                                            <option>TO DO</option>
                                            <option>IN PROGRESS</option>
                                            <option>DONE</option>
                                        </select>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-4 text-gray-500 text-sm italic">Your backlog is empty.</div>
                            )}

                            {isCreating === "backlog" ? (
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="text"
                                        placeholder="Enter task summary..."
                                        value={newTaskTitles["backlog"] || ""}
                                        onChange={(e) =>
                                            setNewTaskTitles((prev) => ({
                                                ...prev,
                                                backlog: e.target.value,
                                            }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") createTask();
                                            if (e.key === "Escape") {
                                                setIsCreating(false);
                                                setNewTaskTitles((prev) => ({ ...prev, backlog: "" }));
                                            }
                                        }}
                                        className="border rounded px-2 py-1 text-sm w-64"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => createTask()}
                                        className="bg-black text-white px-3 py-1 rounded text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewTaskTitles((prev) => ({ ...prev, backlog: "" }));
                                        }}
                                        className="text-sm text-gray-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsCreating("backlog")}
                                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mt-2"
                                >
                                    <Plus className="w-4 h-4" /> Create
                                </button>
                            )}

                        </div>
                    )}
                </div>

            </div>
            {selectedTaskId && (
                <TaskDetailModal
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
            {selectedTasks.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-md px-4 py-2 flex items-center gap-4 z-50">
                    <span>{selectedTasks.size} work items selected</span>
                    <button
                        className="border px-3 py-1 rounded hover:bg-gray-50"
                        onClick={() => {
                            navigator.clipboard.writeText([...selectedTasks].join(', '));
                        }}
                    >
                        Copy
                    </button>
                    <button
                        className="border px-3 py-1 rounded hover:bg-red-50 text-red-600"
                        onClick={() => {
                            setSprints(prev => prev.map(s => ({
                                ...s,
                                workItems: s.workItems.filter(t => !selectedTasks.has(t.id))
                            })));
                            setBacklogItems(prev => prev.filter(t => !selectedTasks.has(t.id)));
                            setSelectedTasks(new Set());
                        }}
                    >
                        Delete
                    </button>
                    <button
                        className="border px-3 py-1 rounded hover:bg-gray-50"
                        onClick={() => setSelectedTasks(new Set())}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    )
}
