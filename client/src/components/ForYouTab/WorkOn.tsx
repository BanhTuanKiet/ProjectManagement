"use client"

import { useProject } from '@/app/(context)/ProjectContext'
import React, { useEffect, useMemo, useState } from 'react'
import axios from '@/config/axiosConfig'
import { Member } from '@/utils/IUser'
import { ProjectRow } from '@/components/ProjectRow'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type SortConfig = {
    key: 'name' | 'endDate' | 'owner'
    direction: 'asc' | 'desc'
} | null

export default function WorkOn() {
    const { projects } = useProject()
    const [members, setMembers] = useState<Record<number, Member[]>>({})
    const [sortConfig, setSortConfig] = useState<SortConfig>(null)

    useEffect(() => {
        if (!projects || projects.length === 0) return

        const fetchMembers = async () => {
            try {
                const requests = projects.map(p =>
                    axios.get(`/projects/member/${p.projectId}`)
                )

                const responses = await Promise.all(requests)
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

    const sortedProjects = useMemo(() => {
        if (!projects) return []

        const sortableProjects = [...projects]

        if (sortConfig !== null) {
            sortableProjects.sort((a, b) => {
                const key = sortConfig.key

                if (typeof a[key] === 'string' && typeof b[key] === 'string') {
                    return sortConfig.direction === 'asc'
                        ? (a[key] as string).localeCompare(b[key] as string)
                        : (b[key] as string).localeCompare(a[key] as string)
                }

                if (a[key] < b[key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1
                }
                if (a[key] > b[key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1
                }
                return 0
            })
        }
        return sortableProjects
    }, [projects, sortConfig])

    const requestSort = (key: 'name' | 'endDate' | 'owner') => {
        let direction: 'asc' | 'desc' = 'asc'

        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const getSortIcon = (columnName: string) => {
        if (sortConfig?.key !== columnName) return <ArrowUpDown className="h-3 w-3" />
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="h-3 w-3 text-gray-900" />
            : <ArrowDown className="h-3 w-3 text-gray-900" />
    }

    return (
        <div className="space-y-">
            <div className="bg-white shadow-sm">
                <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th
                                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[350px] cursor-pointer hover:bg-gray-50 transition-colors select-none"
                                    onClick={() => requestSort('name')}
                                >
                                    <div className="flex items-center gap-2 hover:text-gray-900">
                                        Project Name
                                        {getSortIcon('name')}
                                    </div>
                                </th>

                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                                    Owner
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                                    Team Members
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                                    Deadline
                                </th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {sortedProjects.map((p) => (
                                <ProjectRow
                                    key={p.projectId}
                                    project={p}
                                    members={members[p.projectId]}
                                />
                            ))}
                            {(!sortedProjects || sortedProjects.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No projects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}