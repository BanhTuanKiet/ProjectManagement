export interface Notification {
    notificationId: number
    userId: string
    projectId: number
    message: string
    link?: string
    isRead: boolean
    createdAt: string   
    type?: string
}