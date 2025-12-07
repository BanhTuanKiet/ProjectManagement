'use client'

import {
    User,
    FolderOpen,
    Plus,
    FolderGit2,
    LayoutGrid,
    Search,
    Settings,
    ChevronsUpDown,
    Hash,
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { useProject } from '@/app/(context)/ProjectContext'
import CreateProjectDialog from "@/components/CreateProjectDialog"
import { cn } from "@/lib/utils"

export function SidebarCustom({ className }: { className?: string }) {
    const { project_name, projects } = useProject()
    const [isProjectsOpen, setIsProjectsOpen] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const projectIdStored = localStorage.getItem("projectId")
        const projectId = (projectIdStored ? JSON.parse(projectIdStored) : null)
        if (project_name) return router.push(`/project/${project_name}`)
        if (projectId === project_name) router.push(`/project/${projectId.toString()}`)
    }, [project_name, router])

    const isProjectActive = (id: number) => Number(project_name) === id

    return (
        <Sidebar collapsible="icon" className={cn("border-r border-border bg-gray-50/50", className)}>
            {/* <SidebarHeader className="pb-0">
                <div className="flex items-center gap-2 px-2 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <LayoutGrid className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Jira Clone</span>
                        <span className="truncate text-xs text-muted-foreground">Enterprise</span>
                    </div>
                </div>
                <div className="px-2 pb-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-8 h-9 bg-background shadow-sm" />
                    </div>
                </div>
            </SidebarHeader> */}

            <SidebarContent className="px-2">
            <SidebarContent className="h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip="Dashboard"
                                    isActive={!project_name}
                                    className="transition-all hover:bg-blue-50 hover:text-blue-600 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 data-[active=true]:font-medium"
                                >
                                    <Link href="/project">
                                        <LayoutGrid className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible
                                open={isProjectsOpen}
                                onOpenChange={setIsProjectsOpen}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip="Projects">
                                            <FolderGit2 className="h-4 w-4" />
                                            <span>Projects</span>
                                            <div className="ml-auto flex items-center gap-1">
                                                <Badge variant="secondary" className="px-1.5 h-5 min-w-5 flex items-center justify-center text-[10px]">
                                                    {projects.length}
                                                </Badge>
                                                <ChevronsUpDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                            </div>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub className="mr-0 pr-0">
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    className="text-muted-foreground hover:text-primary cursor-pointer border-dashed border border-transparent hover:border-border"
                                                    onClick={() => setCreateDialogOpen(true)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    <span>Add New Project</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>

                                            {projects.map((project) => {
                                                const active = isProjectActive(project.projectId)

                                                return (
                                                    <SidebarMenuSubItem key={project.projectId}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={active}
                                                            className="transition-all hover:bg-blue-50 hover:text-blue-600 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 data-[active=true]:font-medium"
                                                        >
                                                            <Link href={`/project/${project.projectId}`}>
                                                                {active ? <FolderOpen className="h-4 w-4 mr-2 !text-blue-700" /> : <FolderGit2 className="h-4 w-4 mr-2 opacity-70" />}
                                                                <span className="truncate">{project.name}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                )
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <CreateProjectDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
            />
        </Sidebar>
    )
}