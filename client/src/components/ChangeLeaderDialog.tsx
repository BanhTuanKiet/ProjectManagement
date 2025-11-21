"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useProject } from "@/app/(context)/ProjectContext"
import { AvailableMember, Member } from "@/utils/IUser"
import ColoredAvatar from "./ColoredAvatar"
import axios from "@/config/axiosConfig"
import { DialogProps } from "@/utils/IDialogProps"
import { MoveRight } from "lucide-react"
import { ProjectBasic } from "@/utils/IProject"

export default function ChangeLeaderDialog({ open, onOpenChange }: DialogProps) {
    const { projects, setProjects, project_name } = useProject()
    const [mockMembers, setMockMembers] = useState<AvailableMember[]>()
    const [mockLeaders, setMockLeaders] = useState<Member[]>()
    const [memberId, setMemberId] = useState<string | null>(null)
    const [leaderId, setLeaderId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const project: ProjectBasic | undefined = projects.find(p => p.projectId === Number(project_name))

    useEffect(() => {
        if (project) {
            const leaders = project.members.filter(m => m.role === "Leader")
            setMockLeaders(leaders)
        } else {
            setMockLeaders([])
        }
    }, [project])

    useEffect(() => {
        if (!leaderId) {
            setMockMembers([])
            return
        }

        const fetchMembers = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/teams/members/available/${Number(project_name)}/${leaderId}`)
                setMockMembers(response.data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        fetchMembers()
    }, [project_name, leaderId])

    useEffect(() => {
        if (!onOpenChange) {
            setLeaderId(null)
            setMemberId(null)
            setLoading(false)
        }
    }, [onOpenChange])

    const handleChangeLeader = async () => {
        setLoading(true)
        try {
            await axios.put(`/projects/leader/${Number(project_name)}/${leaderId}/${memberId}`)
            const updatedProjects = projects.map(p => {
                if (p.projectId === Number(project_name)) {
                    const updatedMembers = p.members.map(m => {
                        if (m.userId === leaderId) return { ...m, role: "Member" }
                        if (m.userId === memberId) return { ...m, role: "Leader" }
                        return m
                    })
                    return { ...p, members: updatedMembers }
                }
                return p
            })

            setProjects(updatedProjects)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border shadow-md rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">Change Team Leader</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Select a current leader and choose a new leader for the team.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 mt-4">
                    <div className="flex-1 space-y-2 w-full">
                        <label className="text-sm font-medium text-gray-700">Current Leader</label>
                        <Select value={leaderId ?? ""} onValueChange={setLeaderId}>
                            <SelectTrigger className="w-full border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:ring-1 focus:ring-gray-400">
                                <SelectValue placeholder="Select current leader" />
                            </SelectTrigger>
                            <SelectContent className="rounded-md border border-gray-300 shadow-sm">
                                {mockLeaders?.map(l => (
                                    <SelectItem key={l.userId} value={l.userId}>
                                        <div className="flex items-center gap-2">
                                            <ColoredAvatar id={l.userId} name={l.name} />
                                            <span>{l.name || l.userId}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pb-6">
                        <MoveRight className="w-6 h-6 text-gray-500 mx-auto" />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                        <label className="text-sm font-medium text-gray-700">New Leader</label>
                        <Select value={memberId ?? ""} onValueChange={setMemberId} disabled={!leaderId}>
                            <SelectTrigger
                                className={`w-full border rounded-md transition-all ${leaderId
                                    ? "border-gray-300 bg-white hover:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                    : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                                    }`}
                            >
                                <SelectValue placeholder={leaderId ? "Select new leader" : "Choose leader first"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-md border border-gray-300 shadow-sm">
                                {mockMembers?.map(m => (
                                    <SelectItem key={m.memberId} value={m.memberId}>
                                        <div className="flex items-center gap-2">
                                            <ColoredAvatar id={m.memberId} name={m.memberName} />
                                            <span>{m.memberName || m.memberId}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="min-w-24 rounded-md border-gray-300 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleChangeLeader}
                        disabled={!leaderId || !memberId || loading}
                        className="min-w-32 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
                    >
                        {loading ? "Saving..." : "Change Leader"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}