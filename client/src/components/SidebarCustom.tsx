'use client'

import { User, CreditCard, FolderOpen, Users, Plus, MoreHorizontal, Sparkles, FolderClosed, ChevronRight } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { useProject } from '@/app/(context)/ProjectContext'

export function SidebarCustom({ className }: { className?: string }) {
    const { project_name } = useProject()
    const [activeTab, setActiveTab] = useState<string>()
    const [isProjectsOpen, setIsProjectsOpen] = useState(true)
    const { projects, setProjects } = useProject()
    const router = useRouter()

    useEffect(() => {
        const projectIdStored = localStorage.getItem("projectId")
        const projectId = (projectIdStored ? JSON.parse(projectIdStored) : null)
        if (project_name) return router.push(`/project/${project_name}`)
        if (projectId === project_name) router.push(`/project/${projectId.toString()}`)
    }, [project_name, router])

    const handleClick = (id: number) => {
        if (Number(project_name) === id) return
        router.push(`/project/${id.toString()}`)
    }

    const handleActiveTab = (tab: string) => {
        return tab === activeTab
            ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border-l-[3px] border-blue-600 shadow-sm"
            : "hover:bg-muted/60 hover:text-foreground transition-all duration-200"
    }

    return (
        <Sidebar className={`w-64 h-full border-r bg-background/95 backdrop-blur-sm ${className || ""}`}>
            <SidebarContent className="p-4 h-full overflow-y-auto">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1.5">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    className={`w-full justify-start rounded-xl px-3.5 py-3 transition-all duration-200 ${handleActiveTab("")}`}
                                    onClick={() => setActiveTab("")}
                                >
                                    <Link href="/project" className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold">For you</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    className={`w-full rounded-xl px-3.5 py-3 transition-all duration-200 ${handleActiveTab("plans")}`}
                                    onClick={() => setActiveTab("plans")}
                                >
                                    <Link href="/project/plan" className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm shadow-purple-500/20">
                                            <CreditCard className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold">Plans</span>
                                        <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-sm border-0 tracking-wide">
                                            PRO
                                        </Badge>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <div className="h-px bg-border/60 my-3" />

                            <SidebarMenuItem>
                                <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen} className="group/collapsible">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="w-full justify-between rounded-xl px-3.5 py-3 hover:bg-muted/60 transition-all duration-200">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shadow-orange-500/20">
                                                    <FolderOpen className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-sm font-semibold">Projects</span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-muted rounded-lg transition-all duration-200 cursor-pointer"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 cursor-pointer ml-0.5 ${isProjectsOpen ? 'rotate-90' : ''}`} />
                                            </div>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="transition-all duration-300 ease-in-out">
                                        <SidebarMenuSub className="ml-4 mt-2 space-y-4 border-l-2 border-border/40 pl-4">
                                            <div className="text-[11px] font-bold text-muted-foreground/70 mb-2.5 px-2 uppercase tracking-wider">
                                                Recent
                                            </div>
                                            <div className="space-y-0.5">
                                                {projects.map((project) => {
                                                    const Icon = Number(project_name) === project.projectId ? FolderOpen : FolderClosed
                                                    const isActive = Number(project_name) === project.projectId

                                                    return (
                                                        <SidebarMenuSubItem key={project.projectId}>
                                                            <SidebarMenuSubButton asChild>
                                                                <button
                                                                    onClick={() => handleClick(project.projectId)}
                                                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group ${isActive
                                                                        ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-l-[3px] border-blue-600 shadow-sm'
                                                                        : 'hover:bg-muted/60'
                                                                        }`}
                                                                >
                                                                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-600' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                                                    <span className={`text-md font-medium truncate transition-colors ${isActive ? 'text-blue-600' : 'text-foreground/80 group-hover:text-foreground'}`}>{project.name}</span>
                                                                </button>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    )
                                                })}
                                            </div>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>

                            <div className="h-px bg-border/60 my-3" />

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="w-full justify-between rounded-xl px-3.5 py-3 hover:bg-muted/60 transition-all duration-200">
                                    <a href="#" className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/20">
                                                <Users className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-sm font-semibold">Teams</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}