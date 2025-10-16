'use client'

import { User, CreditCard, FolderOpen, Users, Plus, MoreHorizontal, Sparkles, FolderClosed, ChevronRight, Settings, Bell, Search, LayoutDashboard } from 'lucide-react'
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
    SidebarHeader,
    SidebarFooter,
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
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[0.98]"
            : "hover:bg-accent/50 hover:scale-[0.99] active:scale-[0.97]"
    }

    return (
        <Sidebar className={`w-72 h-full border-r border-border/40 bg-gradient-to-b from-background via-background to-muted/20 ${className || ""}`}>
            {/* Header with Logo and Actions */}
            <SidebarHeader className="border-b border-border/40 p-4 py-2 bg-background/50 backdrop-blur-sm">                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/60"
                    />
                </div>
            </SidebarHeader>

            <SidebarContent className="p-3 h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {/* Main Navigation */}
                            <div className="mb-2">
                                <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                                    Main Menu
                                </div>
                            </div>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    className={`w-full justify-start rounded-xl px-4 py-3 transition-all duration-200 ${handleActiveTab("")}`}
                                    onClick={() => setActiveTab("")}
                                >
                                    <Link href="/project" className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold">Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    className={`w-full rounded-xl px-4 py-3 transition-all duration-200 ${handleActiveTab("plans")}`}
                                    onClick={() => setActiveTab("plans")}
                                >
                                    <Link href="/project/plan" className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/30">
                                            <CreditCard className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold">Plans</span>
                                        <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md border-0 tracking-wide">
                                            PRO
                                        </Badge>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                          
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />

                            {/* Projects Section */}
                            <SidebarMenuItem>
                                <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen} className="group/collapsible">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="w-full justify-between rounded-xl px-4 py-3 hover:bg-accent/60 transition-all duration-200 group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/30 group-hover:shadow-orange-500/40 transition-shadow">
                                                    <FolderOpen className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-sm font-semibold">Projects</span>
                                                <Badge variant="secondary" className="ml-auto mr-2 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {projects.length}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                    }}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isProjectsOpen ? 'rotate-90' : ''}`} />
                                            </div>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="transition-all duration-300 ease-in-out">
                                        <SidebarMenuSub className="ml-3 mt-2 space-y-1 border-l-2 border-border/30 pl-3">
                                            <div className="text-[10px] font-bold text-muted-foreground/60 mb-2 px-3 uppercase tracking-wider">
                                                Recent Projects
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
                                                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                                                        isActive
                                                                            ? 'bg-primary/10 border-l-2 border-primary shadow-sm text-primary'
                                                                            : 'hover:bg-accent/60 border-l-2 border-transparent hover:border-muted-foreground/20'
                                                                    }`}
                                                                >
                                                                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                                                    <span className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-primary font-semibold' : 'text-foreground/80 group-hover:text-foreground'}`}>
                                                                        {project.name}
                                                                    </span>
                                                                    {isActive && (
                                                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                                    )}
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

                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />

                            {/* Teams Section */}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="w-full justify-between rounded-xl px-4 py-3 hover:bg-accent/60 transition-all duration-200 group">
                                    <a href="#" className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/30 group-hover:shadow-emerald-500/40 transition-shadow">
                                                <Users className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-sm font-semibold">Teams</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with User Profile */}
            <SidebarFooter className="border-t border-border/40 p-3 bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/60 transition-all duration-200 cursor-pointer group">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                            NA
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">Nguyễn Văn A</p>
                        <p className="text-xs text-muted-foreground truncate">nguyenvana@example.com</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}