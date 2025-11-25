import { useProject } from '@/app/(context)/ProjectContext'
import React, { useEffect, useState } from 'react'
import { ProjectCard } from '../ProjectCard'
import axios from '@/config/axiosConfig'
import { Member } from '@/utils/IUser'
import { UpcomingDeadline } from '../UpcomingDeadline'

const mockTasks = [
    {
        taskId: 1,
        projectId: 101,
        title: "Hoàn thành API authentication",
        description: "Implement JWT authentication for the backend API",
        status: "in-progress",
        priority: 1,
        assigneeId: "user1",
        assignee: "Nguyễn Văn A",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-20",
        deadline: "2025-11-25",
        estimateHours: 8,
        isActive: true,
    },
    {
        taskId: 2,
        projectId: 101,
        title: "Thiết kế Database schema",
        description: "Design the database structure for user management",
        status: "pending",
        priority: 2,
        assigneeId: "user3",
        assignee: "Lê Hoàng C",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-21",
        deadline: new Date().toISOString(),
        estimateHours: 6,
        isActive: true,
    },
    {
        taskId: 3,
        projectId: 102,
        title: "Review pull request #45",
        description: "",
        status: "pending",
        priority: 3,
        assigneeId: "user4",
        assignee: "Phạm Thị D",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-22",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        estimateHours: 2,
        isActive: true,
    },
    {
        taskId: 4,
        projectId: 101,
        title: "Deploy production release",
        description: "Deploy v2.0.0 to production environment",
        status: "in-progress",
        priority: 1,
        assigneeId: "user5",
        assignee: "Đỗ Văn E",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-23",
        deadline: new Date(Date.now() + 172800000).toISOString(),
        estimateHours: 4,
        isActive: true,
    },
    {
        taskId: 5,
        projectId: 102,
        title: "Write unit tests",
        description: "Write comprehensive unit tests for auth module",
        status: "pending",
        priority: 2,
        assigneeId: "user6",
        assignee: "Vũ Thị F",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-24",
        deadline: new Date(Date.now() + 604800000).toISOString(),
        estimateHours: 12,
        isActive: true,
    },
    {
        taskId: 6,
        projectId: 101,
        title: "Hoàn thành API authentication",
        description: "Implement JWT authentication for the backend API",
        status: "in-progress",
        priority: 1,
        assigneeId: "user1",
        assignee: "Nguyễn Văn A",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-20",
        deadline: "2025-11-25",
        estimateHours: 8,
        isActive: true,
    },
    {
        taskId: 7,
        projectId: 101,
        title: "Thiết kế Database schema",
        description: "Design the database structure for user management",
        status: "pending",
        priority: 2,
        assigneeId: "user3",
        assignee: "Lê Hoàng C",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-21",
        deadline: new Date().toISOString(),
        estimateHours: 6,
        isActive: true,
    },
    {
        taskId: 8,
        projectId: 102,
        title: "Review pull request #45",
        description: "",
        status: "pending",
        priority: 3,
        assigneeId: "user4",
        assignee: "Phạm Thị D",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-22",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        estimateHours: 2,
        isActive: true,
    },
    {
        taskId: 9,
        projectId: 101,
        title: "Deploy production release",
        description: "Deploy v2.0.0 to production environment",
        status: "in-progress",
        priority: 1,
        assigneeId: "user5",
        assignee: "Đỗ Văn E",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-23",
        deadline: new Date(Date.now() + 172800000).toISOString(),
        estimateHours: 4,
        isActive: true,
    },
    {
        taskId: 10,
        projectId: 102,
        title: "Write unit tests",
        description: "Write comprehensive unit tests for auth module",
        status: "pending",
        priority: 2,
        assigneeId: "user6",
        assignee: "Vũ Thị F",
        createdBy: "user2",
        createdName: "Trần Thị B",
        createdAt: "2025-11-24",
        deadline: new Date(Date.now() + 604800000).toISOString(),
        estimateHours: 12,
        isActive: true,
    },
]

export default function WorkOn() {
    const { projects } = useProject()
    const [members, setMembers] = useState<Record<number, Member[]>>({})

    useEffect(() => {
        if (!projects || projects.length === 0) return

        const fetchMembers = async () => {
            try {
                const requests = projects.map(p =>
                    axios.get(`/projects/member/${p.projectId}`)
                )

                const responses = await Promise.all(requests)
                const membersMap: Record<number, Member[]> = {}
                responses.forEach((res, index) => {
                    const projId = projects[index].projectId
                    membersMap[projId] = res.data
                })

                setMembers(membersMap)
            } catch (error) {
                console.log(error)
            }
        }

        fetchMembers()
    }, [projects])

    return (
        <div className="relative -mx-6 px-6">
            <div className="overflow-x-auto scrollbar-custom pb-4">
                <div className="flex gap-4 min-w-max">
                    {projects?.map((p) => (
                        <div key={p.projectId} className="flex-none w-80 ms-1">
                            <ProjectCard
                                project={p}
                                members={members[p.projectId]}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <UpcomingDeadline tasks={mockTasks} />
        </div>
    )
}
