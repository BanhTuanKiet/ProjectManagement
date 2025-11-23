import { useProject } from '@/app/(context)/ProjectContext'
import React, { useEffect, useState } from 'react'
import { ProjectCard } from '../ProjectCard'
import axios from '@/config/axiosConfig'
import { Member } from '@/utils/IUser'

export default function WorkOn() {
    const { projects } = useProject()
    const [members, setMembers] = useState<Record<number, Member[]>>({})

    useEffect(() => {
        if (!projects || projects.length === 0) return

        const fetchMembers = async () => {
            try {
                const requests = projects.map(p =>
                    axios.get(`/projects/member/${p.projectId}`)
                )

                const responses = await Promise.all(requests)
                console.log(responses)
                const membersMap: Record<number, Member[]> = {}
                responses.forEach((res, index) => {
                    const projId = projects[index].projectId
                    membersMap[projId] = res.data
                })

                setMembers(membersMap)
            } catch (error) {
                console.log(error)
            }
        }

        fetchMembers()
    }, [projects])

    return (
        <div className="relative -mx-6 px-6">
            <div className="overflow-x-auto scrollbar-custom pb-4">
                <div className="flex gap-4 min-w-max">
                    {projects?.map((p) => (
                        <div key={p.projectId} className="flex-none w-80 ms-1">
                            <ProjectCard
                                project={p}
                                members={members[p.projectId]}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
