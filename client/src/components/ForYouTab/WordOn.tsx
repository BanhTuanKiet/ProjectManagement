import { useProject } from '@/app/(context)/ProjectContext'
import React from 'react'
import { ProjectCard } from '../ProjectCard'

export default function WordOn() {
    const { projects } = useProject()

    return (
        <div className="relative -mx-6 px-6">
            <div className="overflow-x-auto scrollbar-custom pb-4">
                <div className="flex gap-4 min-w-max">
                    {projects?.map((p) => (
                        <div key={p.projectId} className="flex-none w-80">
                            <ProjectCard project={p} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
