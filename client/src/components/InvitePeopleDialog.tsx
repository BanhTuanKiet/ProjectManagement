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
    const [emails, setEmails] = useState<{ email: string; role: string }[]>([])
    const [currentEmail, setCurrentEmail] = useState("")
    const [role, setRole] = useState("Member")
    const [isLoading, setIsLoading] = useState(false)

    const handleAddEmail = () => {
        if (currentEmail && !emails.some((e) => e.email === currentEmail)) {
            setEmails([...emails, { email: currentEmail, role }])
            setCurrentEmail("")
        }
    }

    const handleRemoveEmail = (email: string) => {
        setEmails(emails.filter((e) => e.email !== email))
    }

    const handleSendInvites = async () => {
        if (emails.length === 0) return

        setIsLoading(true)
        try {
            console.log("Sending invites for project", projectId, {
                invites: emails,
            })

            const payload = {
                toEmails: emails,
                roleInProject: role,
                projectId: projectId
            };

            const response = await axios.post(
                `projects/inviteMember/${projectId}`,
                payload
            );


            await new Promise((resolve) => setTimeout(resolve, 1000))

            setEmails([])
            setCurrentEmail("")
            setRole("Member")
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
                                value={currentEmail}
                                onChange={(e) => setCurrentEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleAddEmail()
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddEmail}
                                disabled={!currentEmail}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <Select value={role} onValueChange={setRole}>
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

                    {/* Email List */}
                    {emails.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Invited ({emails.length})
                            </label>
                            <div className="space-y-2 bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                                {emails.map((item) => (
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
                                            onClick={() => handleRemoveEmail(item.email)}
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
                        disabled={emails.length === 0 || isLoading}
                    >
                        {isLoading ? "Sending..." : `Send Invites (${emails.length})`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
