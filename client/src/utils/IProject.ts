import { Member } from "./IUser"

export interface ProjectBasic {
    projectId: number
    name: string
    description: string
    startDate: string
    endDate: string
    ownerId: string
    owner: string
    members: Member[]
}