import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Badge, ChevronDown, MoreVertical, UserPlus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ProjectBasic } from '@/utils/IProject'
import { formatDate } from '@/utils/dateUtils'
import { Member } from '@/utils/IUser'

const roles = [
    { label: "Project Manager", value: "Project Manager", color: "bg-gray-100 text-gray-800" },
    { label: "Leader", value: "Leader", color: "bg-blue-100 text-blue-800" },
    { label: "Member", value: "Member", color: "bg-green-100 text-green-800" },
]

export default function MemberList({
    project
}: {
    project: ProjectBasic
}) {
    const [sortedMemers, setSortedMembers] = useState<Member[]>([])

    useEffect(() => {
        if (!project) return

        const roleOrder = ["Project Manager", "Leader", "Member"]
        const membersTemp = [...project.members].sort((a, b) => {
            return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
        })
        setSortedMembers(membersTemp)
    }, [project])

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <UserPlus size={16} className="inline mr-1" />
                        Invite Member
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Added By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined At
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedMemers && sortedMemers.map((member) => {
                            return (
                                <tr key={member.userId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div className="font-medium text-gray-900">{member.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* <div className="text-sm text-gray-600">{member.email}</div> */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* <div className="text-sm text-gray-600">{member.phoneNumber}</div> */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                            className={`inline-flex items-center gap-2 rounded-lg border text-sm font-medium`}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-between bg-transparent"
                                                    >
                                                        {member.role}
                                                        <ChevronDown className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="z-50">
                                                    {roles.map((s) => (
                                                        <DropdownMenuItem key={s.value}>
                                                            <Badge className={s.color}>{s.label}</Badge>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* <div className="text-sm text-gray-600">{member.addedBy}</div> */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* <div className="text-sm text-gray-600">{formatDate(member)}</div> */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
