export interface TaskDetail {
  taskId: number
  projectId: number
  title: string
  description: string | null
  status: string
  priority: number
  assigneeId: string
  assignee: ApplicationUser | null
  createdByNavigation:  null
  createdAt: string | null
  deadline: string | null 
  estimateHours: number | null
  comments: Comment[]
  files: File[]
  subTasks: SubTask[]
  taskHistories: TaskHistory[]
  tags: Tag[]
  project: Project | null
}

export interface Comment {
  createdAt: string
  createdBy: string
  createdByNavigation: ApplicationUser | null
}

export interface ApplicationUser {
  id: string
  name: string
  // thêm các field khác nếu backend trả về
}

export interface File {
  fileId: number;
  folderId?: number | null;
  taskId?: number | null;
  fileName: string;
  filePath: string;
  fileType?: string | null;
  version: number;
  isLatest: boolean;
  uploadedBy: string;
  uploadedAt: string;
  // ...
}

export interface SubTask {
  id: number
  title: string
  // ...
}

export interface TaskHistory {
  id: number
  action: string
  createdAt: string
  // ...
}

export interface Tag {
  id: number
  name: string
}

export interface Project {
  id: number
  name: string
}

export interface TaskStats {
    priority: number
    total: number
    todo: number
    inProgress: number
    done: number
    cancel: number
    expired: number
}

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
  deadline: string  
  estimateHours?: number
  subTaskId?: number
  id?: number
  sprintId?: number
}

export interface NewTaskView {
  Title: string
  Description: string
  AssigneeId: string
  Priority: number
  Deadline: string   
}