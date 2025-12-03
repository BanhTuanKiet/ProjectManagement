export interface BasicSprint {
    sprintId: number
    projectId: number
    name: string
    startDate: string
    endDate: string
}

export interface Sprint {
    sprintId: number
    name: string
    projectId: number
    startDate?: string
    endDate?: string
    status?: 'active' | 'planned' | 'completed'
    workItems: WorkItem[]
}

export interface WorkItem {
    id: number
    key: string
    title: string
    status: 'TO DO' | 'IN PROGRESS' | 'DONE'
    assignee?: string
    assigneeColor?: string
    sprintId?: number | null
}