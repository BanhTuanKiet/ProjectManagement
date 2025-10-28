'use client'

import React, { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'

interface WorkItem {
    id: number
    key: string
    title: string
    status: 'TO DO' | 'IN PROGRESS' | 'DONE'
    assignee?: string
    assigneeColor?: string
    sprintId?: number | null
    deadline?: string
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
    handleUpdateSprintDate: (sprintId: number, field: 'startDate' | 'endDate', value: string) => void

    // state setters
    setEditingTaskId: (id: number | null) => void
    setEditingTitle: (title: string) => void
    setSelectedTaskId: (id: number | null) => void
    setSelectedTasks: React.Dispatch<React.SetStateAction<Set<number>>>
    setIsCreating: (v: false | number | 'backlog') => void
    setNewTaskTitles: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
    selectedSprints: Set<number>
    setSelectedSprints: React.Dispatch<React.SetStateAction<Set<number>>>
}

export default function BacklogContent({
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
    selectedSprints,
    setSelectedSprints,
    handleUpdateSprintDate
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
                                <input
                                    type="checkbox"
                                    checked={selectedSprints.has(sprint.sprintId)}
                                    onChange={(e) => {
                                        const newSet = new Set(selectedSprints);
                                        e.target.checked ? newSet.add(sprint.sprintId) : newSet.delete(sprint.sprintId);
                                        setSelectedSprints(newSet);
                                    }}
                                    className="w-4 h-4"
                                />
                                <button onClick={() => toggleSprint(sprint.sprintId.toString())} className="hover:bg-gray-100 p-1 rounded">
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                <h2 className="font-semibold">{sprint.name}</h2>
                                <span className="text-sm text-gray-500">({sprint.workItems.length} work items)</span>

                                {/* 🗓 Hiển thị start/end date có thể chỉnh sửa */}
                                <div className="flex items-center gap-2 ml-6 text-sm text-gray-600">
                                    <label className="text-gray-500">Start:</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={sprint.startDate ? sprint.startDate.split('T')[0] : ''}
                                        onChange={(e) => handleUpdateSprintDate(sprint.sprintId, 'startDate', e.target.value)}
                                        className="border rounded px-1 py-0.5 text-sm"
                                    />
                                    <label className="text-gray-500 ml-2">End:</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={sprint.endDate ? sprint.endDate.split('T')[0] : ''}
                                        onChange={(e) => handleUpdateSprintDate(sprint.sprintId, 'endDate', e.target.value)}
                                        className="border rounded px-1 py-0.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-sm" title={`To Do: ${counts.todo} (work item count)`}>{counts.todo}</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm" title={`In Progress: ${counts.inProgress} (work item count)`}>{counts.inProgress}</span>
                                    <span className="px-2 py-1 bg-green-100 rounded text-sm" title={`Done: ${counts.done} (work item count)`}>{counts.done}</span>
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
                                            {item.deadline && (
                                                <span className="ml-3 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    🗓 {new Date(item.deadline).toLocaleDateString('vi-VN')}
                                                </span>
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
                        {backlogItems.map((item) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('taskId', item.id.toString())}
                                className="group flex items-center justify-between py-2 px-4 rounded hover:bg-gray-100 cursor-pointer"
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
                                    <span className="text-sm text-gray-600">{item.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {isCreating === 'backlog' ? (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            placeholder="Enter new task title..."
                            value={newTaskTitles['backlog'] || ''}
                            onChange={(e) =>
                                setNewTaskTitles((prev) => ({ ...prev, backlog: e.target.value }))
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') createTask();
                                if (e.key === 'Escape') setIsCreating(false);
                            }}
                            className="border rounded px-2 py-1 text-sm w-64"
                            autoFocus
                        />
                        <button
                            onClick={() => createTask()}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating('backlog')}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mt-2"
                    >
                        <Plus className="w-4 h-4" /> Create
                    </button>
                )}
            </div>
        </div>
    )
}
