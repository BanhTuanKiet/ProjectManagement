"use client"
import { UserPlus, ChevronLeft, ChevronRight, ChevronDown, Trash2, Edit2, MoreVertical } from 'lucide-react'
import { useEffect, useState } from "react"
import type { ProjectBasic } from "@/utils/IProject"
import { filterMembersByDate, formatDate } from "@/utils/dateUtils"
import { getRoleBadge, getTeamBadge } from "@/utils/statusUtils"
import ColoredAvatar from "../ColoredAvatar"
import InvitePeopleDialog from "@/components/InvitePeopleDialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"
import CreateTeamDialog from "../CreateTeamDialog"
import axios from '@/config/axiosConfig'
import { WarningNotify } from '@/utils/toastUtils'
import { useProject } from '@/app/(context)/ProjectContext'
import ChangeLeaderDialog from '../ChangeLeaderDialog'
import { Member } from '@/utils/IUser'

const itemsPerPage = 10

interface Team {
    TeamId: string
    LeaderId: string
    LeaderName: string;
}

export default function MemberList({ project }: { project: ProjectBasic }) {
    const [sortedMembers, setSortedMembers] = useState<Member[]>([])
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [invitePeopleOpen, setInvitePeopleOpen] = useState(false)
    const [createTeamOpen, setCreateTeamOpen] = useState(false)
    const [changeLeaderDialog, setChangeLeaderDialog] = useState(false)
    const [filters, setFilters] = useState({
        role: "all",
        dateRange: "all"
    })
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
    const { projectRole, project_name, members } = useProject()

    useEffect(() => {
        if (!members) return
        setSortedMembers(members)
        setFilteredMembers(members)
    }, [members])

    if (!members) return

    const applyFilters = (members: Member[], filters: { role: string, dateRange: string }) => {
        let result = members

        if (filters.role !== "all") {
            result = result.filter(m => m.role === filters.role)
        }

        result = filterMembersByDate(result, filters.dateRange)

        return result
    }

    const handleFilterRole = (role: string) => {
        const newFilters = { ...filters, role }
        setFilters(newFilters)
        setCurrentPage(1)

        const filtered = applyFilters(members, newFilters)
        setFilteredMembers(filtered)
    }

    const handleFilterJoinDate = (dateRange: string) => {
        const newFilters = { ...filters, dateRange }
        setFilters(newFilters)
        setCurrentPage(1)

        const filtered = applyFilters(members, newFilters)
        setFilteredMembers(filtered)
    }

    const handleSelectMember = (userId: string) => {
        const newSelected = new Set(selectedMembers)
        if (newSelected.has(userId)) {
            newSelected.delete(userId)
        } else {
            newSelected.add(userId)
        }
        setSelectedMembers(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedMembers.size === paginatedMembers.length && paginatedMembers.length > 0) {
            setSelectedMembers(new Set())
        } else {
            const allUserIds = new Set(paginatedMembers.map(m => m.userId))
            setSelectedMembers(allUserIds)
        }
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex)

    const handleRemoveMember = async (userIds: string[]) => {
        try {
            if (!userIds.length) return
            const hasLeader = sortedMembers.some(
                (m) => userIds.includes(m.userId) && m.role === "Leader"
            )
            if (hasLeader) {
                WarningNotify("You cannot delete a member who is currently a Leader in the project. Please transfer the Leader role to someone else before doing this.")
                return
            }

            await axios.delete(`/users/${Number(project_name)}`, { data: userIds })

            const updatedMembers = sortedMembers.filter(m => !userIds.includes(m.userId))
            setSortedMembers(updatedMembers)
            const filtered = applyFilters(updatedMembers, filters)
            setFilteredMembers(filtered)
            setSelectedMembers(new Set())
        } catch (error) {
            console.error("Failed to remove member:", error)
        }
    }

    const handleRemoveSingleMember = async (userId: string) => {
        await handleRemoveMember([userId])
    }

    const handleChangeTeam = (userId: string) => {
        console.log("Change team for member:", userId)
    }

    const handleRemoveFromTeam = async (userId: string) => {
        console.log("Remove from team:", userId)
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div id="featureMember" className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                    {selectedMembers.size > 0 && (
                        <div className="text-sm text-gray-600 font-medium">
                            {selectedMembers.size} selected
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    {filters.role !== "all" ? filters.role : "Filter by Role"}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-44">
                                <DropdownMenuItem onSelect={() => handleFilterRole("all")}>
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />

                                {["Leader", "Member"].map((role, index) => (
                                    <DropdownMenuItem
                                        key={index}
                                        onSelect={() => handleFilterRole(role)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`${getRoleBadge(role)}`}>
                                                {role}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    {filters.dateRange === "all"
                                        ? "All Dates"
                                        : filters.dateRange === "today"
                                            ? "Today"
                                            : filters.dateRange === "7days"
                                                ? "Last 7 Days"
                                                : "Last 30 Days"
                                    }
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-44">
                                <DropdownMenuItem onSelect={() => handleFilterJoinDate("all")}>
                                    All Dates
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => handleFilterJoinDate("today")}>
                                    Today
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleFilterJoinDate("7days")}>
                                    Last 7 Days
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleFilterJoinDate("30days")}>
                                    Last 30 Days
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => setInvitePeopleOpen(true)}
                        >
                            <UserPlus size={16} />
                            Invite to Project
                        </Button>

                        <Button
                            size="sm"
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setCreateTeamOpen(true)}
                        >
                            <UserPlus size={16} />
                            Add to Team
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-500 text-amber-600 hover:bg-amber-50"
                            onClick={() => setChangeLeaderDialog(true)}
                        >
                            <Edit2 size={16} />
                            Change Leader
                        </Button>
                    </div>

                    <div className="ml-auto">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            disabled={selectedMembers.size === 0}
                            onClick={() => handleRemoveMember(Array.from(selectedMembers))}
                        >
                            <Trash2 size={16} />
                            Delete ({selectedMembers.size})
                        </Button>
                    </div>
                </div>
            </div>

            <div id="tableMember" className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.size === paginatedMembers.length && paginatedMembers.length > 0}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Team
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
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
                        {paginatedMembers.map((member, index) => (
                            <tr key={member.userId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.has(member.userId)}
                                        onChange={() => handleSelectMember(member.userId)}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <ColoredAvatar src={member.avatarUrl} id={member.userId} name={member.name} size="md" />
                                        <div className="font-medium text-gray-900">{member.name}</div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{member.email}</div>
                                </td>

                                <td className="px-6 py-4">
                                    <span className={getTeamBadge(index)}>
                                        {members?.find(m => m.userId === member.leaderId)?.name ?? "No Team"}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <span className={getRoleBadge(member.role)}>{member.role}</span>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {formatDate(member.joinedAt)}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end" className="w-44">
                                            <DropdownMenuItem onClick={() => handleChangeTeam(member.userId)}>
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Change Team
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => handleRemoveFromTeam(member.userId)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove from Team
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                onClick={() => handleRemoveSingleMember(member.userId)}
                                                disabled={member.role === "Leader"}
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove from Project
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <InvitePeopleDialog
                open={invitePeopleOpen}
                onOpenChange={setInvitePeopleOpen}
                projectId={Number(project_name)}
            />

            <CreateTeamDialog
                open={createTeamOpen}
                onOpenChange={setCreateTeamOpen}
            />

            <ChangeLeaderDialog
                open={changeLeaderDialog}
                onOpenChange={setChangeLeaderDialog}
            />
        </div>
    )
}