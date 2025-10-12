"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar } from "lucide-react"
import type { ProjectBasic } from "@/utils/IProject"
import { formatDate } from "@/utils/dateUtils"
import ColoredAvatar from "./ColoredAvatar"
import Link from "next/link"

export function ProjectCard({ project }: { project: ProjectBasic }) {
    const maxDisplayedMembers = 6
    const displayedMembers = project.members?.slice(0, maxDisplayedMembers) || []
    const remainingCount = (project.members?.length || 0) - maxDisplayedMembers

    return (
        <Card className="w-full max-w-[320px] relative overflow-hidden hover:shadow-md transition-shadow py-0">
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-cyan-200" />

            <CardHeader className="pl-5 pr-4 space-y-1 pt-3 cursor-pointer">
                <Link href={`/project/${project.projectId}`}>
                    <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                                {project.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{project.name}</h3>
                            <p className="text-xs text-gray-600 line-clamp-1">{project.description}</p>
                        </div>
                    </div>
                </Link>
            </CardHeader>

            <CardContent className="pl-5 pr-4 pb-3 space-y-2">
                <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-between h-8 px-2 text-xs font-normal hover:bg-gray-50">
                        <span className="text-gray-700 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Owner: <ColoredAvatar key={project.projectId} id={project.ownerId} name={project.owner} size="sm" />
                        </span>
                    </Button>

                    <Button variant="ghost" className="w-full justify-between h-8 px-2 text-xs font-normal hover:bg-gray-50">
                        <span className="text-gray-700">Team members: </span>
                        {project.members && project.members.length > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center -space-x-1">
                                    {displayedMembers.map((member) => (
                                        <ColoredAvatar key={member.userId} id={member.userId} name={member.name} size="sm" />
                                    ))}
                                    {remainingCount > 0 && (
                                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                            <span className="text-[10px] font-medium text-muted-foreground">+{remainingCount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-between h-7 px-2 text-xs font-normal text-gray-600 hover:bg-gray-50 mt-2"
                >
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                </Button>
            </CardContent>
        </Card>
    )
}
