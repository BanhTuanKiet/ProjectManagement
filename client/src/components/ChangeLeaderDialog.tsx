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
import { Member } from "@/utils/IUser"
import ColoredAvatar from "./ColoredAvatar"
import axios from "@/config/axiosConfig"
import { DialogProps, MembersSelection } from "@/utils/IDialogProps"
import { MoveRight } from "lucide-react"

export default function ChangeLeaderDialog({ open, onOpenChange }: DialogProps) {
    const { members, project_name } = useProject()
    const [mockMembers, setMockMembers] = useState<Member[]>()
    const [mockLeaders, setMockLeaders] = useState<Member[]>()
    const [selectedMembers, setSelectedMembers] = useState<MembersSelection[]>([])
    const [leaderId, setLeaderId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (members) {
            const leaders = members.filter(m => m.role === "Leader")
            const mems = members.filter(m => m.role === "Member")
            setMockLeaders(leaders)
            setMockMembers(mems)
            console.log(mems)
        }
    }, [members])

    const handleAddMember = (member: Member) => {
        if (selectedMembers.some(m => m.id === member.userId)) return
        setSelectedMembers([...selectedMembers, { id: member.userId, name: member.name }])
    }

    const handleRemoveMember = (id: string) => {
        setSelectedMembers(selectedMembers.filter(m => m.id !== id))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Role</DialogTitle>
                    <DialogDescription>
                        Select a Group Leader and choose members for the team.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-end justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Select Present Leader</label>
                        <Select value={leaderId ?? ""} onValueChange={setLeaderId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose Leader" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockLeaders?.map(l => (
                                    <SelectItem key={l.userId} value={l.userId}>
                                        <div className="flex items-center gap-2">
                                            <ColoredAvatar id={l.userId} name={l.name} />
                                            {l.name || l.userId}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pb-6">
                        <MoveRight className="w-6 h-6 text-gray-500" />
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Select New Leader</label>
                        <Select value={leaderId ?? ""} onValueChange={setLeaderId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose Leader" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockLeaders?.map(l => (
                                    <SelectItem key={l.userId} value={l.userId}>
                                        <div className="flex items-center gap-2">
                                            <ColoredAvatar id={l.userId} name={l.name} />
                                            {l.name || l.userId}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button disabled={!leaderId || loading}>
                        {loading ? "Adding..." : `Add to Team (${selectedMembers.length})`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}