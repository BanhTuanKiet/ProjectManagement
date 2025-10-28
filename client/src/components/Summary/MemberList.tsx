"use client"
import { MoreVertical, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import type { ProjectBasic } from "@/utils/IProject"
import { formatDate } from "@/utils/dateUtils"
import type { Member } from "@/utils/IUser"
import { getRoleBadge } from "@/utils/statusUtils"
import ColoredAvatar from "../ColoredAvatar"
import InvitePeopleDialog from "@/components/InvitePeopleDialog"
import { useParams } from "next/navigation"

export default function MemberList({
  project,
}: {
  project: ProjectBasic
}) {
  const [sortedMemers, setSortedMembers] = useState<Member[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { project_name } = useParams()
  const projectId = Number(project_name)
  const [invitePeopleOpen, setInvitePeopleOpen] = useState(false)

  useEffect(() => {
    if (!project) return

    const roleOrder = ["Project Manager", "Leader", "Member"]
    const membersTemp = [...project.members].sort((a, b) => {
      return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
    })
    setSortedMembers(membersTemp)
    setCurrentPage(1)
  }, [project])

  const totalPages = Math.ceil(sortedMemers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMembers = sortedMemers.slice(startIndex, endIndex)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <UserPlus size={16} className="inline mr-1" />
            <span onClick={() => setInvitePeopleOpen(true)} className="text-sm font-medium">Invite people</span>
            <InvitePeopleDialog
              open={invitePeopleOpen}
              onOpenChange={setInvitePeopleOpen}
              projectId={projectId}
            />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                STT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedMembers &&
              paginatedMembers.map((member, index) => {
                return (
                  <tr key={member.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <ColoredAvatar id={member.userId} name={member.name} size="md" />
                        <div className="font-medium text-gray-900">{member.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getRoleBadge(member.role)}>{member.role}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(member.joinedAt)}</div>
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

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedMemers.length)} of {sortedMemers.length} members
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
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentPage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
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
    </div>
  )
}
