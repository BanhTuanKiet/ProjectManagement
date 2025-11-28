import React from "react"
import ColoredAvatar from "./ColoredAvatar"
import { ProjectBasic } from "@/utils/IProject"
import { Member } from "@/utils/IUser"
import { useProject } from "@/app/(context)/ProjectContext"

const maxDisplayedMembers = 6

export default function MemberList({ project, members }: { project: ProjectBasic, members: Member[] }) {
    const displayedMembers = members && members.slice(0, maxDisplayedMembers)
    const remainingCount = members && Math.max(0, members.length - maxDisplayedMembers)
    const pm = members.find(m => m.userId == project.ownerId)

    return (
        <div className="flex items-center justify-between px-2 py-1 h-9 text-xs font-normal text-gray-700">
            <div className="flex items-center gap-1 me-5">
                <span>Owner:</span>
                <ColoredAvatar id={project.ownerId} name={project.owner} size="sm" src={pm?.avatarUrl} />
            </div>

            <div className="flex items-center gap-1">
                <span className="text-gray-700">Members:</span>
                {displayedMembers?.map((member) => (
                    <ColoredAvatar
                        key={member.userId}
                        id={member.userId}
                        name={member.name}
                        size="sm"
                        src={member.avatarUrl}
                    />
                ))}
                {remainingCount > 0 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-[10px] font-medium text-muted-foreground">
                            +{remainingCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

