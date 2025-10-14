export interface Notification {
    notificationId: number
    assigneeId: string
    assignee: string
    createdId: string
    createdBy: string
    projectId: number
    message: string
    link?: string
    isRead: boolean
    createdAt: string   
    type?: string
}

export interface NotificationGroups {
    task: Notification[]
    mention: Notification[]
    project: Notification[]
    system: Notification[]
    workedOn: Notification[]
}