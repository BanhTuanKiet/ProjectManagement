'use client'

import React, { useEffect, useState } from 'react'
import {
    Users,
    Maximize2,
    Share2,
    Link2,
    Zap,
    Globe,
    BarChart3,
    Calendar,
    List,
    FileText,
    Archive,
    Plus,
    Square
} from 'lucide-react'
import CalendarView from '@/components/CalendarView'
import BoardView from '@/components/BoardView'
import MoreHorizontalDropdown from '@/components/MorehorizonalDropdown'
import { BasicTask } from '@/utils/ITask'
import ListPage from '@/components/ListPage'
import axios from '@/config/axiosConfig'
import BacklogView from '@/components/BacklogView/BacklogView'
import { useProject } from '@/app/(context)/ProjectContext'
import Summary from '@/components/Summary'
import { useHash } from '@/hooks/useHash'

interface NavigationTab {
    id: string
    label: string
    icon: React.ReactNode
    isActive?: boolean
}

const navigationTabs: NavigationTab[] = [
    { id: 'summary', label: 'Summary', icon: <Globe className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'backlog', label: 'Backlog', icon: <Square className="w-4 h-4" /> },
    { id: 'board', label: 'Board', icon: <Square className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'list', label: 'List', icon: <List className="w-4 h-4" /> },
    { id: 'forms', label: 'Forms', icon: <FileText className="w-4 h-4" /> },
    { id: 'archived', label: 'Archived work items', icon: <Archive className="w-4 h-4" /> },
]

export default function ProjectInterface() {
    const [tasks, setTasks] = useState<BasicTask[]>([])
    const { project_name } = useProject()
    const { hash: activeTab, setHash: setActiveTab } = useHash("")

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`/tasks/${project_name}`, {
                    params: {
                        month: null,
                        year: null,
                        filters: null,
                    },
                })
                setTasks(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchProjects()
    }, [project_name])

    const renderContent = (activeTab: string) => {
        switch (activeTab) {
            case "":
                return <Summary />
            case "backlog":
                return <BacklogView />
            case "calendar":
                return <CalendarView />
            case "board":
                return <BoardView />
            case "list":
                return <ListPage tasksNormal={tasks} projectId={Number(project_name)} />
            default:
                return (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">
                            No content in <strong>{activeTab}</strong>
                        </p>
                    </div>
                )
        }
    }

    return (
        <div className="h-screen flex flex-col p-[30px] py-0 bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Projects</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">P</span>
                                </div>
                                <h1 className="text-lg font-semibold text-gray-900">Project</h1>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                    <Users className="w-4 h-4 text-gray-500" />
                                </button>
                                <MoreHorizontalDropdown />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded">
                                <Maximize2 className="w-4 h-4 text-gray-500" />
                            </button>

                            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Share</span>
                            </button>

                            <button className="p-2 hover:bg-gray-100 rounded">
                                <Link2 className="w-4 h-4 text-gray-500" />
                            </button>

                            <button className="p-2 hover:bg-gray-100 rounded">
                                <Zap className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 bg-white border-t border-gray-200">
                    <nav className="flex space-x-8 border-b border-gray-200 overflow-x-auto">
                        {navigationTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id === "summary" ? "" : tab.id)}
                                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                        <button className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                            <Plus className="w-4 h-4" />
                        </button>
                    </nav>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-0 bg-gray-50">
                {renderContent(activeTab)}
            </div>
        </div>
    )
}
