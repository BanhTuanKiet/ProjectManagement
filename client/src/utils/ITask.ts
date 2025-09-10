export interface BasicTask {
  taskId: number
  projectId: number
  title: string
  description?: string
  status: string
  priority: number
  assigneeId?: string
  assignee: string
  createdBy: string
  createdAt: string   // ISO datetime (từ BE)
  deadline?: string   // ISO datetime
  estimateHours?: number
}