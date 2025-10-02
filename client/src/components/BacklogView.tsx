'use client'

import React, { useState } from 'react'
import { Search, Filter, ChevronDown, ChevronRight, Plus, MoreHorizontal, TrendingUp, Settings, Calendar, Minus } from 'lucide-react'

// Types
interface WorkItem {
  id: string
  key: string
  title: string
  status: 'TO DO' | 'IN PROGRESS' | 'DONE'
  assignee?: string
  assigneeColor?: string
}

interface Sprint {
  id: string
  name: string
  startDate?: string
  endDate?: string
  status: 'active' | 'planned' | 'completed'
  workItems: WorkItem[]
}

// Mock Data
const mockSprints: Sprint[] = [
  {
    id: '1',
    name: 'RTPTMS Sprint 1',
    startDate: '27 Sep',
    endDate: '11 Oct',
    status: 'active',
    workItems: [
      {
        id: '1',
        key: 'RTPTMS-2',
        title: '12312123',
        status: 'TO DO',
        assignee: '',
        assigneeColor: '#6B7280'
      },
      {
        id: '2',
        key: 'RTPTMS-3',
        title: '123123123',
        status: 'TO DO',
        assignee: 'BK',
        assigneeColor: '#6366F1'
      }
    ]
  },
  {
    id: '2',
    name: 'RTPTMS Sprint 2',
    status: 'planned',
    workItems: []
  }
]

const mockUsers = [
  { id: '1', name: 'BK', color: '#6366F1' },
  { id: '2', name: '', color: '#1F2937' },
  { id: '3', name: 'FB', color: '#DC2626' }
]

export default function BacklogView() {
  const [sprints, setSprints] = useState<Sprint[]>(mockSprints)
  const [backlogItems, setBacklogItems] = useState<WorkItem[]>([])
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set(['1', '2', 'backlog']))
  const [searchQuery, setSearchQuery] = useState('')

  const toggleSprint = (sprintId: string) => {
    setExpandedSprints(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sprintId)) {
        newSet.delete(sprintId)
      } else {
        newSet.add(sprintId)
      }
      return newSet
    })
  }

  const getStatusCounts = (items: WorkItem[]) => {
    return {
      todo: items.filter(i => i.status === 'TO DO').length,
      inProgress: items.filter(i => i.status === 'IN PROGRESS').length,
      done: items.filter(i => i.status === 'DONE').length
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search backlog"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* User Avatars */}
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {mockUsers.map((user, idx) => (
                <button
                  key={idx}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold hover:opacity-80"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name}
                </button>
              ))}
            </div>

            {/* Filter */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {/* Sprints */}
        {sprints.map((sprint) => {
          const counts = getStatusCounts(sprint.workItems)
          const isExpanded = expandedSprints.has(sprint.id)
          
          return (
            <div key={sprint.id} className="mb-6">
              {/* Sprint Header */}
              <div className="flex items-center justify-between py-3 group">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <button
                    onClick={() => toggleSprint(sprint.id)}
                    className="hover:bg-gray-100 p-1 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <h2 className="font-semibold text-gray-900">{sprint.name}</h2>
                  {sprint.startDate && sprint.endDate && (
                    <span className="text-sm text-gray-500">
                      {sprint.startDate} – {sprint.endDate}
                    </span>
                  )}
                  {!sprint.startDate && (
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                      <Calendar className="w-4 h-4" />
                      Add dates
                    </button>
                  )}
                  <span className="text-sm text-gray-500">
                    ({sprint.workItems.length} work items)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Counts */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                      {counts.todo}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                      {counts.inProgress}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                      {counts.done}
                    </span>
                  </div>

                  {sprint.status === 'active' ? (
                    <button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                      Complete sprint
                    </button>
                  ) : (
                    <button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                      Start sprint
                    </button>
                  )}

                  <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Sprint Items */}
              {isExpanded && (
                <div className="ml-12 space-y-2">
                  {sprint.workItems.length > 0 ? (
                    sprint.workItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                          <span className="text-sm font-medium text-gray-700">{item.key}</span>
                          <span className="text-sm text-gray-600">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <select className="px-3 py-1 text-sm border-0 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">
                            <option>TO DO</option>
                            <option>IN PROGRESS</option>
                            <option>DONE</option>
                          </select>

                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Minus className="w-4 h-4 text-gray-400" />
                          </button>

                          {item.assignee ? (
                            <button
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                              style={{ backgroundColor: item.assigneeColor }}
                            >
                              {item.assignee}
                            </button>
                          ) : (
                            <button className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 border-2 border-dashed border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-500">
                        Plan a sprint by dragging work items into it, or by dragging the sprint footer.
                      </p>
                    </div>
                  )}

                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2">
                    <Plus className="w-4 h-4" />
                    Create
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Divider */}
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-px bg-gray-200 w-full"></div>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            <div className="h-px bg-gray-200 w-full"></div>
          </div>
        </div>

        {/* Backlog Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between py-3 group">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleSprint('backlog')}
                className="hover:bg-gray-100 p-1 rounded"
              >
                {expandedSprints.has('backlog') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <h2 className="font-semibold text-gray-900">Backlog</h2>
              <span className="text-sm text-gray-500">({backlogItems.length} work items)</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">0</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">0</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">0</span>
              </div>
              <button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                Create sprint
              </button>
            </div>
          </div>

          {expandedSprints.has('backlog') && (
            <div className="ml-12">
              {backlogItems.length === 0 ? (
                <div className="py-8 border-2 border-dashed border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Your backlog is empty.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {backlogItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm font-medium text-gray-700">{item.key}</span>
                        <span className="text-sm text-gray-600">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 mt-2">
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-end gap-4 text-sm text-gray-500 py-4">
          <span>0 of 0 work items visible</span>
          <span>|</span>
          {/* <span>Estimate: <strong>0</strong> of <strong>0</strong></span> */}
        </div>
      </div>
    </div>
  )
}