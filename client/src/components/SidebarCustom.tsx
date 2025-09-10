'use client'

import { User, Clock, CreditCard, FolderOpen, Users, ChevronRight, Plus, MoreHorizontal, Sparkles, FolderClosed } from "lucide-react"
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
import { useParams } from "next/navigation"

const mainItems = [
  {
    title: "For you",
    url: "#",
    icon: User,
    isActive: true,
  },
]

const projectsData = {
  starred: [
    {
      title: "(Learn) Jira Premium benefits in ...",
      icon: Sparkles,
      url: "#",
    },
  ],
  recent: [
    {
      title: "Project",
      icon: FolderOpen,
      url: "#",
    },
  ],
}

const fetcher = (url: string) =>
  fetch(url)
    .then(res => res.json())
    .catch((error) => console.log(error))

export function SidebarCustom() {
  const { projectId } = useParams()
  const { data } = useSWR<ProjectTitle[]>('http://localhost:5144/projects', fetcher, { revalidateOnReconnect: true })

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar w-64">
      <SidebarContent className="p-2 h-full overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`w-full justify-between hover:bg-sidebar-accent ${item.isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : ""}`}
                  >
                    <a href={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full hover:bg-sidebar-accent">
                  <Link href="/project/plan" className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm font-medium">Plans</span>
                    <Badge variant="secondary" className="ml-auto bg-purple-600 text-white text-xs px-2 py-0.5">
                      PREMIUM
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

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
                        {data?.map((project) => {
                          const Icon = Number(projectId) === project.projectId ? FolderOpen : FolderClosed

                          return (
                            <SidebarMenuSubItem key={project.projectId}>
                              <SidebarMenuSubButton asChild className="hover:bg-sidebar-accent">
                                <a href={`/project/${project.projectId.toString()}`} className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-blue-400" />

                                  <span className="text-sm">{project.name}</span>
                                </a>
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
