"use client"

import { MoreHorizontal, UserPlus, Save, ImageIcon, Archive, Trash2, Pencil } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import BackgroundPicker from "./ChangeBackground"
import { useParams, useRouter } from "next/navigation"
import InvitePeopleDialog from "@/components/InvitePeopleDialog"
import EditProjectDialog from "@/components/EditProjectDialog"
import axios from "@/config/axiosConfig"

export default function ProjectMenu() {
    const { project_name } = useParams()
    const projectId = Number(project_name)
    const [bgOpen, setBgOpen] = useState(false)
    const [invitePeopleOpen, setInvitePeopleOpen] = useState(false)
    const [editProjectOpen, setEditProjectOpen] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const route = useRouter()

    const handleDeleteProject = async () => {
        try {
            setIsDeleting(true)
            await axios.delete(`/projects/${projectId}`)
            setIsDeleting(false)
            setDeleteConfirmOpen(false)
            route.push("http://localhost:3000/project")
        } catch (error) {
            setIsDeleting(false)
            console.error(error)
        }
    }

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
                    {/* Invite */}
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 cursor-pointer">
                        <div className="p-1 rounded-sm bg-blue-100">
                            <UserPlus className="h-4 w-4 text-blue-600" />
                        </div>
                        <span onClick={() => setInvitePeopleOpen(true)} className="text-sm font-medium">Invite people</span>
                    </DropdownMenuItem>

                    {/* Edit */}
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 cursor-pointer">
                        <div className="p-1 rounded-sm bg-orange-100">
                            <Pencil className="h-4 w-4 text-orange-600" />
                        </div>
                        <span onClick={() => setEditProjectOpen(true)} className="text-sm font-medium">Edit project</span>
                    </DropdownMenuItem>

                    {/* Save template */}
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 cursor-pointer">
                        <div className="p-1 rounded-sm bg-purple-100">
                            <Save className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">Save as project template</span>
                    </DropdownMenuItem>

                    {/* Set background */}
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-green-50 hover:text-green-700 transition-colors duration-200 cursor-pointer">
                        <div className="p-1 rounded-sm bg-green-100">
                            <ImageIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium" onClick={() => setBgOpen(true)}>Set project background</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Archive */}
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 cursor-pointer">
                        <div className="p-1 rounded-sm bg-orange-100">
                            <Archive className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium">Archive project</span>
                    </DropdownMenuItem>

                    {/* Delete */}
                    <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer text-red-600"
                        onClick={() => setDeleteConfirmOpen(true)}
                    >
                        <div className="p-1 rounded-sm bg-red-100">
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium">Delete project</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Background Dialog */}
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

            {/* Invite people */}
            <InvitePeopleDialog
                open={invitePeopleOpen}
                onOpenChange={setInvitePeopleOpen}
                projectId={projectId}
            />

            {/* Edit project */}
            <EditProjectDialog
                open={editProjectOpen}
                onOpenChange={setEditProjectOpen}
                projectId={projectId}
            />

            {/* Delete confirm dialog */}
            <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
                        <Dialog.Title className="text-lg font-semibold mb-4">Confirm Delete</Dialog.Title>
                        <p className="mb-4">Do you really want to delete this project?</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    )
}
