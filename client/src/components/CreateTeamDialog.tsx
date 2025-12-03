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
import { X } from "lucide-react"
import { useProject } from "@/app/(context)/ProjectContext"
import { Member } from "@/utils/IUser"
import ColoredAvatar from "./ColoredAvatar"
import axios from "@/config/axiosConfig"
import { DialogProps, MembersSelection } from "@/utils/IDialogProps"

export default function CreateTeamDialog({ open, onOpenChange }: DialogProps) {
    const { members, project_name } = useProject()
    const [mockMembers, setMockMembers] = useState<Member[]>()
    const [mockLeaders, setMockLeaders] = useState<Member[]>()
    const [selectedMembers, setSelectedMembers] = useState<MembersSelection[]>([])
    const [leaderId, setLeaderId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (members && open) {
            const leaders = members.filter(m => m.role === "Leader")
            const mems = members.filter(m => m.role === "Member")
            setMockLeaders(leaders)
            setMockMembers(mems)
        }
    }, [members, open])

    const handleAddMember = (member: Member) => {
        if (selectedMembers.some(m => m.id === member.userId)) return
        setSelectedMembers([...selectedMembers, { id: member.userId, name: member.name }])
    }

    const handleRemoveMember = (id: string) => {
        setSelectedMembers(selectedMembers.filter(m => m.id !== id))
    }

    const handleCreateTeam = async () => {
        if (!leaderId) return
        setLoading(true)
        try {
            const memberIds = selectedMembers.map(m => m.id)
            const response = await axios.post(`/teams/members/${project_name}/${leaderId}`, memberIds)
            console.log(response.data)
            setSelectedMembers([])
            setLeaderId(null)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Members</DialogTitle>
                    <DialogDescription>
                        Select a Group Leader and choose members for the team.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Select Group Leader</label>
                        <Select value={leaderId ?? ""} onValueChange={setLeaderId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose Leader" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockLeaders?.map(l => (
                                    <SelectItem key={l.userId} value={l.userId}>
                                        <ColoredAvatar id={l.userId} name={l.name} /> {l.name || l.userId}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Add Members */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Select Members</label>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
                            {mockMembers
                                ?.filter(m => !selectedMembers.some(sm => sm.id === m.userId))
                                .map(m => (
                                    <button
                                        key={m.userId}
                                        type="button"
                                        className="flex items-center gap-1 p-1 bg-white rounded border hover:bg-gray-100 w-[48%]"
                                        onClick={() => handleAddMember(m)}
                                    >
                                        <ColoredAvatar id={m.userId} name={m.name} size="sm" />
                                        <span className="truncate">{m.name}</span>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Selected Members */}
                    {selectedMembers.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Selected Members</label>
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                                {selectedMembers.map(m => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between p-1 bg-white border rounded w-[48%]"
                                    >
                                        <div className="flex items-center gap-1">
                                            <ColoredAvatar id={m.id} name={m.name} size="sm" />
                                            <span className="truncate">{m.name}</span>
                                        </div>
                                        <button onClick={() => handleRemoveMember(m.id)} className="text-gray-400 hover:text-gray-600">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleCreateTeam} disabled={!leaderId || loading}>
                        {loading ? "Adding..." : `Add to Team (${selectedMembers.length})`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
