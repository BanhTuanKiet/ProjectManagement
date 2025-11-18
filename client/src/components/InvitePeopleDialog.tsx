"use client"

import { CircleX, XIcon } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import axios from "@/config/axiosConfig"
import { X } from "lucide-react"

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
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Member")
  const [loading, setLoading] = useState(false)
  const [notResponded, setNotResponded] = useState<any[]>([])

  const fetchPendingMembers = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/users/not-responded-invitations/${projectId}`)
      setNotResponded(res.data || [])
    } catch (error) {
      console.error("Error fetching pending members:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchPendingMembers()
  }, [open])

  const handleInvite = async () => {
    if (!email) return
    try {
      const formData = {
        toEmail: email,
        projectId,
        roleInProject: role,
      }

      await axios.post(`/projects/inviteMember/${projectId}`, formData)
      setEmail("")
      setRole("Member")
      await fetchPendingMembers() // cập nhật lại danh sách
      onOpenChange(false)
    } catch (err) {
      console.error("Error inviting member:", err)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add people to Project
          </Dialog.Title>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
          />

          <label className="block mb-2 font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
          >
            <option value="Manager">Manager</option>
            <option value="Member">Leader</option>
            <option value="User">Member</option>
          </select>

          <div className="flex justify-end gap-3 mb-6">
            <Dialog.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleInvite}>Add</Button>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700">
              Thành viên chưa phản hồi:
            </h3>

            {loading ? (
              <p className="text-sm text-gray-500">Đang tải...</p>
            ) : notResponded.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {notResponded.map((user: any) => (
                  <div
                    key={user.id}
                    className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700 text-center"
                  >
                    {user.email}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Không có thành viên nào chưa phản hồi.
              </p>
            )}
          </div>

          <Dialog.Close asChild>
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <XIcon className="w-6 h-6 mt-3" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
