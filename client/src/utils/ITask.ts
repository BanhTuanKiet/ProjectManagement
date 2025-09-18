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
  createdAt: string   
  deadline?: string  
  estimateHours?: number
}

export interface NewTaskView {
  Title: string
  Description: string
  AssigneeId: string
  Priority: number
  Deadline: string   
}