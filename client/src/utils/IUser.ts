export interface Member {
  userId: string
  name: string
  role: string
  isOwner: boolean
}

export interface UserMini {
  id?: string;
  name: string;
  avatar: string;
  initials: string;
}