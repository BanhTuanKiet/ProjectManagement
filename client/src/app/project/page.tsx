'use client'

import { ProjectCard } from '@/components/ProjectCard'
import { ProjectBasic } from '@/utils/IProject'

export default function Page() {
    const tabs = [
        { name: 'Worked on', active: false, count: null },
        { name: 'Viewed', active: true, count: null },
        { name: 'Assigned to me', active: false, count: 2 },
        { name: 'Starred', active: false, count: null },
        { name: 'Boards', active: false, count: null }
    ]

    const project: ProjectBasic[] = [
        {
            projectId: 1,
            name: "Hospital Management System",
            description: "Web platform for booking doctor appointments and managing patient records.",
            startDate: "2025-01-10",
            endDate: "2025-12-31",
            ownerId: "u001",
            owner: "Banh Tuan Kiet",
            countMembers: 8
        },
        {
            projectId: 2,
            name: "E-Commerce Website",
            description: "Full-stack e-commerce website with product management and payment integration.",
            startDate: "2025-03-01",
            endDate: "2025-09-15",
            ownerId: "u002",
            owner: "Nguyen Van A",
            countMembers: 5
        },
        {
            projectId: 3,
            name: "Project Tracker App",
            description: "Tool for tracking software development progress and team collaboration.",
            startDate: "2025-02-20",
            endDate: "2025-10-01",
            ownerId: "u001",
            owner: "Banh Tuan Kiet",
            countMembers: 6
        },
        {
            projectId: 4,
            name: "Learning Management System",
            description: "Online platform for managing courses, lessons, and student progress.",
            startDate: "2025-04-15",
            endDate: "2025-11-20",
            ownerId: "u003",
            owner: "Le Thi B",
            countMembers: 7
        },
        {
            projectId: 5,
            name: "Chat Collaboration Tool",
            description: "Realtime chat and task management tool for remote teams using SignalR and React.",
            startDate: "2025-05-01",
            endDate: "2025-12-01",
            ownerId: "u004",
            owner: "Tran Van C",
            countMembers: 10
        }
    ]

    return (
        <div className="w-full p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">For you</h1>

            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Recent projects</h2>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View all projects
                    </button>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {project?.map(p => (
                            <ProjectCard key={p.projectId} project={p} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${tab.active
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.name}
                            {tab.count && (
                                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}