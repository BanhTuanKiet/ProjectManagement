'use client'

import { User, CreditCard, FolderOpen, Users, Plus, MoreHorizontal, Sparkles, FolderClosed } from "lucide-react"
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
import useSWR from 'swr'
import { ProjectTitle } from "@/utils/IProject"
import { useParams, useRouter } from "next/navigation"
import { fetcher } from "@/config/fetchConfig"
import { useState } from "react"

const projectsData = {
  starred: [
    {
      title: "(Learn) Jira Premium benefits in ...",
      icon: Sparkles,
      url: "#",
    },
  ],
}

export function SidebarCustom() {
  const { project_name } = useParams()
  const [activeTab, setActiveTab] = useState<string>()
  const router = useRouter()
  const { data, error } = useSWR<ProjectTitle[]>('http://localhost:5144/projects', fetcher, { revalidateOnReconnect: true })

  const handleClick = (id: number) => {
    if (Number(project_name) === id) return
    router.push(`/project/${id.toString()}`)
  }

  const handleActiveTab = (tab: string) => {
    return tab === activeTab
      ? "bg-blue-100 text-blue-600 border border-blue-600"
      : "hover:bg-sidebar-accent"
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar w-64">
      <SidebarContent className="p-2 h-full overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`w-full justify-start ${handleActiveTab("")}`}
                  onClick={() => setActiveTab("")}
                >
                  <Link href="/project" className="flex items-center gap-3 rounded px-2 py-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">For you</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuButton
                asChild
                className={`w-full ${handleActiveTab("plans")}`}
                onClick={() => setActiveTab("plans")}
              >
                <Link href="/project/plan" className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Plans</span>
                  <Badge variant="secondary" className="ml-auto bg-purple-600 text-white text-xs px-2 py-0.5">
                    PREMIUM
                  </Badge>
                </Link>
              </SidebarMenuButton>

              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between hover:bg-sidebar-accent">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-4 w-4" />
                        <span className="text-sm font-medium">Projects</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-sidebar-accent">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-sidebar-accent">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-2">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Starred</div>
                        {projectsData?.starred?.map((project) => (
                          <SidebarMenuSubItem key={project.title}>
                            <SidebarMenuSubButton asChild className="hover:bg-sidebar-accent">
                              <a href={`/project/${project}`} className="flex items-center gap-2">
                                <project.icon className="h-4 w-4 text-purple-400" />
                                <span className="text-sm truncate">{project.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </div>

                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Recent</div>
                        {data && data?.map((project) => {
                          const Icon = Number(project_name) === project.projectId ? FolderOpen : FolderClosed

                          return (
                            <SidebarMenuSubItem key={project.projectId}>
                              <SidebarMenuSubButton asChild className="hover:bg-sidebar-accent">
                                <button
                                  onClick={() => handleClick(project.projectId)}
                                  className="flex items-center gap-2 hover:bg-sidebar-accent rounded px-2 py-1"
                                >
                                  <Icon className="h-4 w-4 text-blue-400" />
                                  <span className="text-sm">{project.name}</span>
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

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full justify-between hover:bg-sidebar-accent">
                  <a href="#" className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Teams</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-sidebar-accent">
                      <Plus className="h-3 w-3" />
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
