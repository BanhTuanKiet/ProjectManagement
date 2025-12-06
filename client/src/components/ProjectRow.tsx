"use client"

import { Calendar, FolderGit2 } from "lucide-react"
import type { ProjectBasic } from "@/utils/IProject"
import { formatDate } from "@/utils/dateUtils"
import ColoredAvatar from "./ColoredAvatar"
import { useEffect, useState } from "react"
import { Member } from "@/utils/IUser"
import Link from "next/link"

const maxDisplayedMembers = 5

export function ProjectRow({ 
    project, members 
}: { 
    project: ProjectBasic, 
    members: Member[] 
}) {
    const [mockMembers, setMockMembers] = useState<Member[] | []>()

    useEffect(() => {
        if (!members) return
        const filteredMembers = members.filter(m => m.userId !== project.ownerId)
        setMockMembers(filteredMembers)
    }, [members, project.ownerId])

    const displayedMembers = mockMembers?.slice(0, maxDisplayedMembers)
    const remainingCount = mockMembers ? Math.max(0, mockMembers?.length - maxDisplayedMembers) : 0

    return (
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group">
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-blue-600">
                        <FolderGit2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Link 
                            href={`/project/${project.projectId}`} 
                            className="font-medium text-gray-900 hover:underline hover:text-blue-600 transition-colors"
                        >
                            {project.name}
                        </Link>
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                            {project.description || "No description provided"}
                        </span>
                    </div>
                </div>
            </td>

            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <div className="flex items-center gap-2">
                    <ColoredAvatar id={project.ownerId} name={project.owner} size="sm" />
                    <span className="text-sm text-gray-700">{project.owner}</span>
                </div>
            </td>

            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <div className="flex items-center -space-x-2 hover:space-x-1 transition-all duration-200">
                    {displayedMembers?.map((member) => (
                         <div key={member.userId} title={member.name} className="relative transition-transform hover:z-10 hover:scale-110">
                            <ColoredAvatar
                                id={member.userId}
                                name={member.name}
                                size="sm"
                            />
                        </div>
                    ))}
                    {remainingCount > 0 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                            +{remainingCount}
                        </div>
                    )}
                    {(!mockMembers || mockMembers.length === 0) && (
                        <span className="text-xs text-muted-foreground italic">No members</span>
                    )}
                </div>
            </td>

            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs whitespace-nowrap">
                        {formatDate(project.endDate)}
                    </span>
                </div>
            </td>
        </tr>
    )
}