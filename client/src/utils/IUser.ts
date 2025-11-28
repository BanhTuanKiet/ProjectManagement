export interface Member {
  userId: string
  name: string
  email: string
  role: string
  isOwner: boolean
  joinedAt: string
  teamId: string
  leaderId: string
  avatarUrl: string
}

export interface Teams {
    teamId: string
    leaderId: string
    members: Member[]
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
    planId: string
    planName: string
    roles: string[] 
}

export interface UserProfile {
    userName: string
    email: string
    phoneNumber: string
    jobTitle: string
    department: string
    organization: string
    location: string
    facebook: string
    instagram: string
    imageCoverUrl: string
    avatarUrl: string
}

export interface AvailableMember {
    memberId: string
    memberName: string
}

export interface InviteUser {
    status: string
    email: string
}

export interface TaskAssignee {
    userId: string;
    name: string;
    avatar?: string | null;
}