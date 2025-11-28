'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
    Users,
    Globe,
    BarChart3,
    Calendar,
    List,
    FileText,
    Archive,
    Plus,
    Square,
    Trash,
    User2,
    X,       // Mới: Icon đóng tab
    Check    // Mới: Icon check trong menu
} from 'lucide-react'
import CalendarView from '@/components/CalendarView/CalendarView'
import BoardView from '@/components/BoardView/BoardView'
import MoreHorizontalDropdown from '@/components/MorehorizonalDropdown'
import { BasicTask } from '@/utils/ITask'
import ListPage from '@/components/ListView/ListPage'
import axios from '@/config/axiosConfig'
import BacklogView from '@/components/BacklogView/BacklogView'
import TrashView from '@/components/TrashView/TrashView'
import { useProject } from '@/app/(context)/ProjectContext'
import Summary from '@/components/Summary/Summary'
import { useHash } from '@/hooks/useHash'
import Timeline from '@/components/Timeline'
import MemberList from '@/components/Summary/MemberList'

interface NavigationTab {
    id: string
    label: string
    icon: React.ReactNode
}

const ALL_TABS: NavigationTab[] = [
    { id: '', label: 'Summary', icon: <Globe className="w-4 h-4" /> },
    { id: 'member', label: 'Member', icon: <User2 className='w-4 h-3' /> },
    { id: 'timeline', label: 'Timeline', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'backlog', label: 'Backlog', icon: <Square className="w-4 h-4" /> },
    { id: 'board', label: 'Board', icon: <Square className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'list', label: 'List', icon: <List className="w-4 h-4" /> },
    { id: 'trash', label: 'Trash', icon: <Trash className="w-4 h-4" /> },
]

const DEFAULT_TABS = ['', 'timeline', 'backlog', 'list', 'calendar']

export default function ProjectInterface() {
    const [tasks, setTasks] = useState<BasicTask[]>([])
    const { project_name, projects, projectRole } = useProject()
    const { hash: activeTab, setHash: setActiveTab } = useHash("")
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const [visibleTabIds, setVisibleTabIds] = useState<string[]>(() => {
        try {
            const savedTabs = localStorage.getItem('default_tabs')

            if (savedTabs !== null) {
                return JSON.parse(savedTabs)
            }
        } catch (error) {
            return []
        }

        return DEFAULT_TABS
    })

    useEffect(() => {
        if (visibleTabIds !== undefined) {
            localStorage.setItem('default_tabs', JSON.stringify(visibleTabIds))
        }
    }, [visibleTabIds]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`/tasks/userRole/${project_name}`)
                setTasks(response.data.tasks)
            } catch (error) {
                console.log(error)
            }
        }
        fetchProjects()
    }, [project_name])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAddMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const project = projects.find(p => p.projectId === Number(project_name))
    const availableTabs = ALL_TABS.filter(tab => {
        if (tab.id === 'member' && projectRole !== "Project Manager") return false
        return true
    })

    const visibleTabs = visibleTabIds && availableTabs.filter(tab => visibleTabIds.includes(tab.id))
    const hiddenTabs = visibleTabIds && availableTabs.filter(tab => !visibleTabIds.includes(tab.id))

    const handleAddTab = (id: string) => {
        if (!visibleTabIds) return
        if (!visibleTabIds.includes(id)) {
            setVisibleTabIds([...visibleTabIds, id])
        }
        setActiveTab(id === "" ? "" : id)
        setIsAddMenuOpen(false)
    }

    const handleHideTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (id === '' || !visibleTabIds) return

        const newIds = visibleTabIds.filter(t => t !== id)
        setVisibleTabIds(newIds)

        if (activeTab === id) setActiveTab("")
    }

    const renderContent = (activeTab: string) => {
        switch (activeTab) {
            case "": return <Summary />
            case "timeline": return <Timeline />
            case "backlog": return <BacklogView />
            case "calendar": return <CalendarView />
            case "board": return <BoardView />
            case "list": return <ListPage tasksNormal={tasks} projectId={Number(project_name)} />
            case "trash": return <TrashView projectId={Number(project_name)} />
            case "member":
                if (project && projectRole === "Project Manager") return <MemberList project={project} />
                break
            default:
                return <div className="py-12 text-center text-muted-foreground">No content in <strong>{activeTab}</strong></div>
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
                    </div>
                </div>

                <div className="px-6 bg-white border-t border-gray-200">
                    <nav className="flex items-center border-b border-gray-200">
                        <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                            {visibleTabs?.map((tab) => (
                                <div
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id === "" ? "" : tab.id)}
                                    className={`
                                        group relative flex items-center space-x-1 py-3 px-3 border-b-2 cursor-pointer transition-colors select-none
                                        ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {tab.icon}
                                    <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>
                                    <button
                                        onClick={(e) => handleHideTab(e, tab.id)}
                                        className={`
                                                ml-1 p-0.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity
                                                ${activeTab === tab.id ? 'group-hover:opacity-100' : ''}
                                            `}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="relative ml-2 py-2" ref={menuRef}>
                            <button
                                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                                className={`
                                    flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors
                                    ${isAddMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}
                                `}
                            >
                                <Plus className="w-4 h-4" />
                            </button>

                            {isAddMenuOpen && (
                                <div className="z-99 absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-99">
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                                        More Views
                                    </div>

                                    <div className="py-1 max-h-60 overflow-y-auto">
                                        {hiddenTabs?.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-400 text-center italic">
                                                All views are visible
                                            </div>
                                        ) : (
                                            hiddenTabs?.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => handleAddTab(tab.id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3"
                                                >
                                                    <span className="text-gray-400">{tab.icon}</span>
                                                    <span>{tab.label}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {visibleTabs && visibleTabs.length > 1 && (
                                        <>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <div className="px-3 py-1.5 text-xs text-gray-400">Visible</div>
                                            {visibleTabs.filter(t => t.id !== '').map(tab => (
                                                <div key={tab.id} className="flex items-center justify-between px-4 py-1.5 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2 opacity-75">
                                                        <Check className="w-3 h-3 text-blue-500" />
                                                        <span>{tab.label}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleHideTab(e, tab.id)}
                                                        className="text-xs text-gray-400 hover:text-red-500"
                                                    >
                                                        Hide
                                                    </button>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-0 bg-gray-50">
                {renderContent(activeTab)}
            </div>
        </div>
    )
}