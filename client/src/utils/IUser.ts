export interface Member {
  userId: string
  name: string
  role: string
  isOwner: boolean
  joinedAt: string
}

export interface UserMini {
  id?: string;
  name: string;
  avatar: string;
  initials: string;
}

export interface ActiveUser {
    id: string
    name: string
    taskId: number
}

export interface User {
    id: string
    name: string
    token: string
    email: string
}