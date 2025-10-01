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