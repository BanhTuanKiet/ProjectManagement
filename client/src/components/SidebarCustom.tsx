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
import useSWR from 'swr'
import { ProjectTitle } from "@/utils/IProject"
import { useParams, useRouter } from "next/navigation"
import { fetcher } from "@/config/fetchConfig"
import { useMemo, useState } from "react"

export function SidebarCustom({ className }: { className?: string }) {
  const { project_name } = useParams()
  const [activeTab, setActiveTab] = useState<string>()
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const router = useRouter()
  const { data, error } = useSWR<ProjectTitle[]>('http://localhost:5144/projects', fetcher, { revalidateOnReconnect: true })

  const handleClick = (id: number) => {
    if (Number(project_name) === id) return
    router.push(`/project/${id.toString()}`)
  }

  const handleActiveTab = (tab: string) => {
    return tab === activeTab
      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-sm"
      : "hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
  }

  const { starredProjects, recentProjects } = useMemo(() => {
    const starred = data?.filter(p => p.isStarred) ?? []
    const recent = data?.filter(p => !p.isStarred) ?? []
    return { starredProjects: starred, recentProjects: recent }
  }, [data])

  return (
    <Sidebar className={`w-64 h-full border-r border-gray-200 bg-white shadow-sm ${className || ""}`}>
      <SidebarContent className="p-3 h-full overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {/* For You Section */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`w-full justify-start rounded-lg px-3 py-2.5 transition-all duration-200 ${handleActiveTab("")}`}
                  onClick={() => setActiveTab("")}
                >
                  <Link href="/project" className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-blue-100">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">For you</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Plans Section */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`w-full rounded-lg px-3 py-2.5 transition-all duration-200 ${handleActiveTab("plans")}`}
                  onClick={() => setActiveTab("plans")}
                >
                  <Link href="/project/plan" className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-purple-100">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Plans</span>
                    <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-2.5 py-1 rounded-full shadow-sm">
                      PREMIUM
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Projects Section */}
              <SidebarMenuItem>
                <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen} className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-orange-100">
                          <FolderOpen className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium">Projects</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md transition-colors duration-200 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle add project
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md transition-colors duration-200 cursor-pointer"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                        </Button>
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 cursor-pointer ${isProjectsOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="transition-all duration-300 ease-in-out">
                    <SidebarMenuSub className="ml-6 mt-3 space-y-3">
                      {/* Starred Projects */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wide">
                          Starred
                        </div>
                        {starredProjects.map((project) => (
                          <SidebarMenuSubItem key={project.projectId}>
                            <SidebarMenuSubButton asChild className="hover:bg-gray-50 rounded-md transition-all duration-200">
                              <button
                                onClick={() => handleClick(project.projectId)}
                                className="flex items-center gap-3 px-3 py-2 w-full"
                              >
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-gray-700 truncate">{project.name}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </div>

                      {/* Recent Projects */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wide">
                          Recent
                        </div>
                        <div className="space-y-1">
                          {recentProjects.map((project) => {
                            const Icon = Number(project_name) === project.projectId ? FolderOpen : FolderClosed
                            const isActive = Number(project_name) === project.projectId
                            {/* {data && data?.map((project) => {
                            const Icon = Number(project_name) === project.projectId ? FolderOpen : FolderClosed
                            const isActive = Number(project_name) === project.projectId */}

                            return (
                              <SidebarMenuSubItem key={project.projectId}>
                                <SidebarMenuSubButton asChild>
                                  <button
                                    onClick={() => handleClick(project.projectId)}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${isActive
                                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                      : 'hover:bg-gray-50 text-gray-700'
                                      }`}
                                  >
                                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                    <span className="text-sm font-medium truncate">{project.name}</span>
                                  </button>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </div>
                      </div>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Teams Section */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-all duration-200">
                  <a href="#" className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-green-100">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Teams</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                      <Plus className="h-3.5 w-3.5 text-gray-600" />
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