"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Settings, Users, Users2, Cog } from "lucide-react"

export default function SettingsPopup() {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const handleNavigate = (section: string) => {
        router.push(`/setting?section=${section}`)
        setOpen(false)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full bg-transparent" title="Settings">
                    <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => handleNavigate("user-management")}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>User Management</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleNavigate("team-management")}>
                    <Users2 className="mr-2 h-4 w-4" />
                    <span>Team Management</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleNavigate("project-settings")}>
                    <Cog className="mr-2 h-4 w-4" />
                    <span>Project Settings</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
