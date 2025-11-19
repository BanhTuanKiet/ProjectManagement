"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from 'lucide-react'
import axios from "@/config/axiosConfig";


interface InvitePeopleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: number
}

export default function InvitePeopleDialog({
    open,
    onOpenChange,
    projectId,
}: InvitePeopleDialogProps) {
    const [invitees, setInvitees] = useState<{ email: string; role: string }[]>([])
    const [inputEmail, setInputEmail] = useState("")
    const [selectedRole, setSelectedRole] = useState("Member")
    const [isLoading, setIsLoading] = useState(false)

    const handleAddInvitee = () => {
        if (inputEmail && !invitees.some((e) => e.email === inputEmail)) {
            setInvitees([...invitees, { email: inputEmail, role: selectedRole }])
            setInputEmail("")
        }
    }

    const handleRemoveInvitee = (email: string) => {
        setInvitees(invitees.filter((e) => e.email !== email))
    }

    const handleSendInvites = async () => {
        if (invitees.length === 0) return
        setIsLoading(true)

        try {
            const payload = {
                people: invitees.map(i => ({
                    email: i.email,
                    role: i.role
                }))
            }

            console.log("Payload gửi API:", payload)

            await axios.post(`projects/inviteMember/${projectId}`, payload)

            await new Promise((resolve) => setTimeout(resolve, 1000))

            setInvitees([])
            setInputEmail("")
            setSelectedRole("Member")
            onOpenChange(false)
        } catch (error) {
            console.error("Error sending invites:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite People to Project</DialogTitle>
                    <DialogDescription>
                        Add team members to your project and assign them roles.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">

                    {/* Email Input Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Enter email address"
                                value={inputEmail}
                                onChange={(e) => setInputEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleAddInvitee()
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddInvitee}
                                disabled={!inputEmail}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Member">Member</SelectItem>
                                <SelectItem value="Leader">Leader</SelectItem>
                                <SelectItem value="Project Manager">Project Manager</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Invitee List */}
                    {invitees.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Invited ({invitees.length})
                            </label>
                            <div className="space-y-2 bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                                {invitees.map((item) => (
                                    <div
                                        key={item.email}
                                        className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700">{item.email}</span>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                {item.role}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveInvitee(item.email)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dialog Actions */}
                <div className="flex gap-2 justify-end pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSendInvites}
                        disabled={invitees.length === 0 || isLoading}
                    >
                        {isLoading ? "Sending..." : `Send Invites (${invitees.length})`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
