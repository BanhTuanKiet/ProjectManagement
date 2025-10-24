import React from "react"
import { Button } from "./ui/button"
import { Users } from "lucide-react"
import ColoredAvatar from "./ColoredAvatar"
import { ProjectBasic } from "@/utils/IProject"
import { Member } from "@/utils/IUser"

type MemberListProps =
    | { project: ProjectBasic; object?: never }
    | { object: { projectManager: Member; projectMembers: Member[] }; project?: never }

export default function MemberList(props: MemberListProps) {
    const isProjectMode = !!props.project
    const maxDisplayedMembers = 6

    const owner = isProjectMode
        ? { id: props.project.ownerId, name: props.project.owner }
        : { id: props.object.projectManager.userId, name: props.object.projectManager.name }

    const members = isProjectMode
        ? props.project.members || []
        : props.object.projectMembers || []

    const displayedMembers = members.slice(0, maxDisplayedMembers)
    const remainingCount = Math.max(0, members.length - maxDisplayedMembers)

    if (!isProjectMode) {
        return (
            <div className="flex items-center justify-between px-2 py-1 h-9 text-xs font-normal text-gray-700">
                <div className="flex items-center gap-1 me-5">
                    <span>Owner:</span>
                    <ColoredAvatar id={owner.id} name={owner.name} size="sm" />
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-gray-700">Members:</span>
                    {displayedMembers.map((member) => (
                        <ColoredAvatar
                            key={member.userId}
                            id={member.userId}
                            name={member.name}
                            size="sm"
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

    return (
        <div className="space-y-1">
            <Button
                variant="ghost"
                className="w-full justify-between h-8 px-2 text-xs font-normal hover:bg-gray-50"
            >
                <span className="text-gray-700 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Owner:
                    <ColoredAvatar key={owner.id} id={owner.id} name={owner.name} size="sm" />
                </span>
            </Button>

            <Button
                variant="ghost"
                className="w-full justify-between h-8 px-2 text-xs font-normal hover:bg-gray-50"
            >
                <span className="text-gray-700">Team members:</span>
                {members.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center -space-x-1">
                            {displayedMembers.map((member) => (
                                <ColoredAvatar
                                    key={member.userId}
                                    id={member.userId}
                                    name={member.name}
                                    size="sm"
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
                )}
            </Button>
        </div>
    )
}
