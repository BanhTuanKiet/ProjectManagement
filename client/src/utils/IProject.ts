export interface ProjectBasic {
    projectId: number
    name: string
    description: string
    startDate: string
    endDate: string
    ownerId: string
    owner: string
    status?: string
    role?: string
}

export interface UpdateProject {
    title?: string
    description?: string
    startDate?: string
    endDate?: string
}