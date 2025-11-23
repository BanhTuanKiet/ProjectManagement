export interface ProjectBasic {
    projectId: number
    name: string
    description: string
    startDate: string
    endDate: string
    ownerId: string
    owner: string
}

export interface UpdateProject {
    title?: string
    description?: string
    startDate?: string
    endDate?: string
}