"use client"

import axios from '@/config/axiosConfig'
import React, { useEffect } from 'react'
import {
    X,
    ChevronDown,
    User,
    Calendar,
    Flag,
    Plus,
    Activity,
    Filter,
    MoreHorizontal,
    Eye,
    Share,
    Lock,
} from "lucide-react"
import type { Task } from "@/utils/mapperUtil"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { BasicTask, TaskDetail } from "@/utils/ITask"
import { getPriorityIcon, getTaskStatusBadge } from "@/utils/statusUtils"

export default function TaskDetailModal({ projectId, taskId, onClose }: { projectId: number, taskId: number, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState("all")
    const [comment, setComment] = useState("")
    const [task, setTask] = useState<TaskDetail>()

    useEffect(() => {
        const fetchTaskDetail = async () => {
            try {
                console.log("AAAAAAAAA")
                const response = await axios.get(`/tasks/detail/${projectId}/${taskId}`)
                console.log(response.data)
                setTask(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchTaskDetail()
    }, [projectId, taskId])

    if (!task) return

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />

            <div className="relative bg-white w-[1000px] h-[90vh] rounded-lg shadow-xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                            <Plus className="h-4 w-4 mr-1" />
                            Add epic
                        </Button>
                        <span className="text-gray-400">/</span>
                        <div className="flex items-center gap-2">
                            {/* {"key" in task ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {task.key}
                                </Badge>
                            ) : null} */}

                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            <Lock className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="bg-blue-100 text-blue-700">
                            <Eye className="h-4 w-4 mr-1" />1
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-auto">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                {/* <h1 className="text-xl font-medium text-gray-900 flex-1 mr-4">{("summary" in task ? task.summary : "") || "No title"}</h1> */}
                                <div className="flex items-center gap-2">
                                    <Badge className={`${getTaskStatusBadge(task.status)} border`}>
                                        {task.status}
                                        <ChevronDown className="h-3 w-3 ml-1" />
                                    </Badge>
                                    <Button variant="ghost" size="sm">
                                        <Activity className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border min-h-[60px]">
                                    {task.description || "Add a description..."}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-900">Subtasks</h3>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </div>
                                <button className="text-sm text-gray-500 hover:text-gray-700">Add subtask</button>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Linked work items</h3>
                                <button className="text-sm text-gray-500 hover:text-gray-700">Add linked work item</button>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-900">Activity</h3>
                                    <Button variant="ghost" size="sm">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                                        <TabsTrigger value="all" className="text-xs">
                                            All
                                        </TabsTrigger>
                                        <TabsTrigger value="comments" className="text-xs">
                                            Comments
                                        </TabsTrigger>
                                        <TabsTrigger value="history" className="text-xs">
                                            History
                                        </TabsTrigger>
                                        <TabsTrigger value="worklog" className="text-xs">
                                            Work log
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all" className="mt-4 space-y-4">
                                        <div className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-red-500 text-white text-xs">TB</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">Thái Bảo</span>
                                                    <span className="text-gray-500">updated the</span>
                                                    <span className="font-medium">Reporter</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">September 13, 2025 at 3:36 PM</div>
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    HISTORY
                                                </Badge>
                                                <div className="text-sm text-gray-600 mt-2">Thái Bảo → None</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-red-500 text-white text-xs">TB</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">Thái Bảo</span>
                                                    <span className="text-gray-500">created the</span>
                                                    <span className="font-medium">Work item</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">September 7, 2025 at 1:34 PM</div>
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    HISTORY
                                                </Badge>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="comments" className="mt-4">
                                        <div className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-red-500 text-white text-xs">TB</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <Textarea
                                                    placeholder="Add a comment..."
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    className="min-h-[80px] resize-none"
                                                />
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
                                                            🎉 Looks good!
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
                                                            👋 Need help?
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
                                                            🚫 This is blocked...
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
                                                            🔍 Can you clarify...?
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Pro tip: press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">M</kbd> to comment
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="history" className="mt-4">
                                        <div className="text-sm text-gray-500">History items will appear here</div>
                                    </TabsContent>

                                    <TabsContent value="worklog" className="mt-4">
                                        <div className="text-sm text-gray-500">Work log entries will appear here</div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>

                    <div className="w-80 border-l bg-gray-50 overflow-auto">
                        <div className="p-4">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="details">
                                    <AccordionTrigger className="text-sm font-medium">Details</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 mt-2">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 block mb-2">Assignee</label>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {typeof task.assignee === "string" ? task.assignee : task.assignee?.name || "Unassigned"}
                                                    </span>
                                                </div>
                                                <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">Assign to me</button>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700 block mb-2">Priority</label>
                                                <div className="flex items-center gap-2">
                                                    {getPriorityIcon("Medium")}
                                                    <span className="text-sm text-gray-600">Medium</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700 block mb-2">Parent</label>
                                                <button className="text-sm text-gray-500 hover:text-gray-700">Add parent</button>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700 block mb-2">Due date</label>
                                                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {("dueDate" in task ? task.deadline : null) || "Add due date"}
                                                </button>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700 block mb-2">Labels</label>
                                                <button className="text-sm text-gray-500 hover:text-gray-700">Add labels</button>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-gray-700 block mb-2">Sprint</label>
                                                <button className="text-sm text-gray-500 hover:text-gray-700">Add to sprint</button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="more-fields">
                                    <AccordionTrigger className="text-sm font-medium">More fields</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <div className="mb-2">
                                                <span className="block text-xs font-medium text-gray-700 mb-1">Reporter</span>
                                                Anonymous
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="automation">
                                    <AccordionTrigger className="text-sm font-medium">Automation</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p className="mb-2">Recent rule runs</p>
                                            <button className="text-xs text-blue-600 hover:text-blue-800">Refresh to see recent runs</button>
                                            <div className="text-xs text-gray-500 mt-2">
                                                Created September 7, 2025 at 1:34 PM <br />
                                                Updated September 13, 2025 at 3:36 PM
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
