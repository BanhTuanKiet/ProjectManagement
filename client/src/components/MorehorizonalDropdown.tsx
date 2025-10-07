"use client"

import { MoreHorizontal, Star, UserPlus, Save, ImageIcon, Archive, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog" 
import BackgroundPicker from "./ChangeBackground"
import axios from "@/config/axiosConfig"
import { useParams } from "next/navigation"
import { ProjectTitle } from "@/utils/IProject"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/config/fetchConfig"


export default function ProjectMenu() {
  const { project_name } = useParams()
  const projectId = Number(project_name)
  const { data, error } = useSWR<ProjectTitle[]>('http://localhost:5144/projects', fetcher, { revalidateOnReconnect: true })
  
  const currentProject = data?.find(p => p.projectId === projectId)
  const [isStarred, setIsStarred] = useState(currentProject?.isStarred)
  const [bgOpen, setBgOpen] = useState(false);
  const [invitePeopleOpen, setInvitePeopleOpen] = useState(false);
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Member")
  

  useEffect(() => {
    if (currentProject) {
      setIsStarred(currentProject.isStarred)
    }
  }, [currentProject])

  

  const toggleStarred = async () => {
    try {
      const reponse = await axios.put(`/projects/starred/${projectId}/${!isStarred}`)
      console.log(reponse.data)
      setIsStarred(!isStarred)
      mutate("http://localhost:5144/projects")
    } catch (err) {
      console.error("Error updating starred status", err)
    }
  }

  const handleInvite = async () => {
  try {
    const formData = {
      toEmail: email,
      projectId: projectId,
      roleInProject: role
    };

    const res = await axios.post(`/projects/inviteMember/${projectId}`, formData);
    console.log("Invite result:", res.data);

    setInvitePeopleOpen(false);
    setEmail("");
    setRole("Member");
  } catch (err) {
    console.error("Error inviting member:", err);
  }
};

  return (
  <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-gray-100 transition-colors duration-200 rounded-md"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 shadow-lg border border-gray-200 rounded-lg">
        <DropdownMenuItem
          onClick={toggleStarred}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-yellow-50 hover:text-yellow-700 transition-colors duration-200 cursor-pointer"
        >
          <div className="p-1 rounded-sm bg-yellow-100">
            <Star className={`h-4 w-4 ${isStarred ? "text-yellow-600" : "text-gray-400"}`} />
          </div>
          <span className="text-sm font-medium">
            {isStarred ? "Remove from starred" : "Add to starred"}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 cursor-pointer">
          <div className="p-1 rounded-sm bg-blue-100">
            <UserPlus className="h-4 w-4 text-blue-600" />
          </div>
          <span onClick={() => setInvitePeopleOpen(true)} className="text-sm font-medium">Invite people</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 cursor-pointer">
          <div className="p-1 rounded-sm bg-purple-100">
            <Save className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-sm font-medium">Save as project template</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-green-50 hover:text-green-700 transition-colors duration-200 cursor-pointer">
          <div className="p-1 rounded-sm bg-green-100">
            <ImageIcon className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-sm font-medium" onClick={() => setBgOpen(true)}>Set project background</span>
        </DropdownMenuItem>
        

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 cursor-pointer">
          <div className="p-1 rounded-sm bg-orange-100">
            <Archive className="h-4 w-4 text-orange-600" />
          </div>
          <span className="text-sm font-medium">Archive project</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer text-red-600">
          <div className="p-1 rounded-sm bg-red-100">
            <Trash2 className="h-4 w-4 text-red-600" />
          </div>
          <span className="text-sm font-medium">Delete project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog.Root open={bgOpen} onOpenChange={setBgOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-md max-h-[85vh] overflow-auto">
          <div className="p-6">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Project background
            </Dialog.Title>
            <BackgroundPicker />
          </div>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1">
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

    <Dialog.Root open={invitePeopleOpen} onOpenChange={setInvitePeopleOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add people to Project
          </Dialog.Title>

          {/* Input email */}
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
          />

          {/* Select role */}
          <label className="block mb-2 font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
          >
            <option value="Manager">Manager</option>
            <option value="Member">Member</option>
            <option value="User">User</option>
          </select>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleInvite}>Add</Button>
          </div>

          {/* Nút X đóng dialog */}
          <Dialog.Close asChild>
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">×</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

    </>
  )
}
