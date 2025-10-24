"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar } from "lucide-react"
import type { ProjectBasic } from "@/utils/IProject"
import { formatDate } from "@/utils/dateUtils"
import ColoredAvatar from "./ColoredAvatar"
import Link from "next/link"
import MemberList from "./MemberList"

export function ProjectCard({ project }: { project: ProjectBasic }) {
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
                <MemberList project={project} />

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
