'use client'

import React from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { useParams } from 'next/navigation'
import TaskDetailModal from '../TaskDetailModal'

interface WorkItem {
    id: number
    key: string
    title: string
    status: 'TO DO' | 'IN PROGRESS' | 'DONE'
    assignee?: string
    assigneeColor?: string
    sprintId?: number | null
}

interface Sprint {
    sprintId: number
    name: string
    projectId: number
    startDate?: string
    endDate?: string
    status?: 'active' | 'planned' | 'completed'
    workItems: WorkItem[]
}

interface BacklogContentProps {
    projectId: number
    sprints: Sprint[]
    backlogItems: WorkItem[]
    expandedSprints: Set<string>
    selectedTasks: Set<number>
    editingTaskId: number | null
    editingTitle: string
    isCreating: false | number | 'backlog'
    newTaskTitles: { [key: string]: string }

    // event handlers
    toggleSprint: (id: string) => void
    handleDragOver: (e: React.DragEvent) => void
    handleDropToSprint: (e: React.DragEvent, id: number) => void
    handleDropToBacklog: (e: React.DragEvent) => void
    handleUpdateTask: (id: number) => void
    createTask: (sprintId?: number) => void

    // state setters
    setEditingTaskId: (id: number | null) => void
    setEditingTitle: (title: string) => void
    setSelectedTaskId: (id: number | null) => void
    setSelectedTasks: React.Dispatch<React.SetStateAction<Set<number>>>
    setIsCreating: (v: false | number | 'backlog') => void
    setNewTaskTitles: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
    setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>
    setBacklogItems: React.Dispatch<React.SetStateAction<WorkItem[]>>
    selectedTaskId: number | null
}

export default function BacklogContent({
    projectId,
    sprints,
    backlogItems,
    expandedSprints,
    selectedTasks,
    editingTaskId,
    editingTitle,
    isCreating,
    newTaskTitles,
    toggleSprint,
    handleDragOver,
    handleDropToSprint,
    handleDropToBacklog,
    handleUpdateTask,
    createTask,
    setEditingTaskId,
    setEditingTitle,
    setSelectedTaskId,
    setSelectedTasks,
    setIsCreating,
    setNewTaskTitles,
    setSprints,
    setBacklogItems,
    selectedTaskId
}: BacklogContentProps) {

    const getStatusCounts = (items: WorkItem[]) => ({
        todo: items.filter(i => i.status === 'TO DO').length,
        inProgress: items.filter(i => i.status === 'IN PROGRESS').length,
        done: items.filter(i => i.status === 'DONE').length
    })

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4">

            {/* 🧱 Sprint list */}
            {sprints.map((sprint) => {
                const counts = getStatusCounts(sprint.workItems)
                const isExpanded = expandedSprints.has(sprint.sprintId.toString())

                return (
                    <div key={sprint.sprintId} className="mb-6 border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between py-3 group relative">
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggleSprint(sprint.sprintId.toString())} className="hover:bg-gray-100 p-1 rounded">
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                <h2 className="font-semibold">{sprint.name}</h2>
                                <span className="text-sm text-gray-500">({sprint.workItems.length} work items)</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">{counts.todo}</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{counts.inProgress}</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">{counts.done}</span>
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div
                                className="ml-8 space-y-2"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropToSprint(e, sprint.sprintId)}
                            >
                                {sprint.workItems.map((item) => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => e.dataTransfer.setData('taskId', item.id.toString())}
                                        className="group flex items-center justify-between py-2 px-4 rounded hover:bg-blue-50 cursor-pointer"
                                        onClick={() => setSelectedTaskId(item.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedTasks.has(item.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedTasks(prev => {
                                                        const newSet = new Set(prev)
                                                        e.target.checked ? newSet.add(item.id) : newSet.delete(item.id)
                                                        return newSet
                                                    })
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{item.key}</span>
                                            {editingTaskId === item.id ? (
                                                <input
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onBlur={() => handleUpdateTask(item.id)}
                                                    className="border rounded px-1 text-sm"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-600">{item.title}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isCreating === sprint.sprintId ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="text"
                                            placeholder="Enter task summary..."
                                            value={newTaskTitles[sprint.sprintId] || ''}
                                            onChange={(e) => setNewTaskTitles(prev => ({ ...prev, [sprint.sprintId]: e.target.value }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') createTask(sprint.sprintId)
                                                if (e.key === 'Escape') setIsCreating(false)
                                            }}
                                            className="border rounded px-2 py-1 text-sm w-64"
                                            autoFocus
                                        />
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

            {/* 🗂 Backlog Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                        <button onClick={() => toggleSprint('backlog')} className="hover:bg-gray-100 p-1 rounded">
                            {expandedSprints.has('backlog') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <h2 className="font-semibold">Backlog</h2>
                        <span className="text-sm text-gray-500">({backlogItems.length} work items)</span>
                    </div>
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
                    </div>
                )}
            </div>
            {selectedTaskId && (
                <TaskDetailModal
                    projectId={Number(projectId)}
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
