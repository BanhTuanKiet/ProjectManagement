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
import axios from "@/config/axiosConfig"
import { WarningNotify, SuccessNotify } from "@/utils/toastUtils"
import ColoredAvatar from "./ColoredAvatar"
import { Member } from "@/utils/IUser"

interface ChangeTeamDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: string
    leaderId: string | null
}

export default function ChangeTeamDialog({
    open,
    onOpenChange,
    userId,
    leaderId
}: ChangeTeamDialogProps) {

    const { members, project_name, setMembers } = useProject()
    const [availableLeaders, setAvailableLeaders] = useState<Member[]>([])
    const [currentTeam, setCurrentTeam] = useState<Member>()
    const [selectedLeader, setSelectedLeader] = useState<string>("")

    useEffect(() => {
        if (!members) return

        const leaders = members.filter(m => m.role === "Leader")
        const otherLeaders = leaders.filter(l => l.userId !== leaderId)
        const current = leaders.find(l => l.userId === leaderId)

        setCurrentTeam(current)

        setAvailableLeaders(otherLeaders)
    }, [members, leaderId])

    const handleChangeTeam = async () => {
        if (!selectedLeader) {
            WarningNotify("Please select a team to change.")
            return
        }

        try {
            const reponse = await axios.put(`/teams/change-team/${Number(project_name)}`, {
                userId,
                newLeaderId: selectedLeader
            })

            // SuccessNotify("Team changed successfully.")
            setMembers(reponse.data.data)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            // WarningNotify("Failed to change team.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border shadow-md rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Change Team
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Select a new team leader to move this member to another team.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Current Team
                    </label>

                    {!leaderId ? (<span className="text-sm text-gray-500">
                        You are not yet assigned to a team.
                    </span>
                    ) :
                        (<span className="pl-3 flex items-center gap-2">
                            <ColoredAvatar src={currentTeam?.avatarUrl} id={currentTeam?.userId ?? ""} name={currentTeam?.name} size="md" />
                            {currentTeam?.name}
                        </span>)
                    }

                </div>

                <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Change To
                    </label>

                    <Select value={selectedLeader} onValueChange={setSelectedLeader}>
                        <SelectTrigger className="w-full border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:ring-1 focus:ring-gray-400">
                            <SelectValue placeholder="Select team leader..." />
                        </SelectTrigger>

                        <SelectContent className="rounded-md border border-gray-300 shadow-sm">
                            {availableLeaders.length === 0 ? (
                                <div className="text-gray-500 text-sm p-2">
                                    No other teams available.
                                </div>
                            ) : (
                                availableLeaders.map((leader) => (
                                    <SelectItem key={leader.userId} value={leader.userId}>
                                        <div className="flex items-center gap-2">
                                            <ColoredAvatar src={leader.avatarUrl} id={leader.userId} name={leader.name} size="md" />
                                            <span>{leader.name}</span>
                                        </div>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="min-w-24 rounded-md border-gray-300 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleChangeTeam}
                        disabled={!selectedLeader}
                        className="min-w-32 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
                    >
                        Change
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
