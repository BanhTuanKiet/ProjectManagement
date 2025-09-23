export interface Notification {
    NotificationId: number
    UserId: string
    ProjectId: number
    Message: string
    Link?: string
    IsRead: boolean
    CreatedAt: Date
}