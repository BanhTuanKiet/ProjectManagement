"use client"

import axios from "@/config/axiosConfig"
import { useEffect, useState } from "react"
import { Paperclip } from "lucide-react";
import { X, ChevronDown, User, Calendar, Plus, Activity, Filter, MoreHorizontal, Eye, Share, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TaskDetail } from "@/utils/ITask"
import { getPriorityIcon, getTaskStatusBadge } from "@/utils/statusUtils"
import * as signalR from "@microsoft/signalr"
import { usePresence } from "@/app/(context)/OnlineMembers"
import ColoredAvatar from "./ColoredAvatar"
import type { ActiveUser } from "@/utils/IUser"

interface Comment {
    commentId: number
    taskId: number
    userId: string
    content: string
    createdAt: string
    isEdited: boolean
    userName?: string
}

export default function TaskDetailModal({
    projectId,
    taskId,
    onClose,
}: {
    projectId: number,
    taskId: number,
    onClose: () => void
}) {
    const [activeTab, setActiveTab] = useState("all")
    const [comment, setComment] = useState("")
    const [task, setTask] = useState<TaskDetail | null>(null)
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
    const [comments, setComments] = useState<Comment[]>([])
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
    const { tokenStored } = usePresence()
    const [files, setFiles] = useState<any[]>([]);
    const [previewFile, setPreviewFile] = useState<any | null>(null);

    // fetch task detail + comments
    useEffect(() => {
        const fetchTaskDetail = async () => {
            try {
                const response = await axios.get(`/tasks/detail/${projectId}/${taskId}`)
                setTask(response.data)
            } catch (error) {
                console.error("Fetch task detail error:", error)
            }
        }

        const fetchComments = async () => {
            try {
                const res = await axios.get(`/comment/task/${taskId}`)
                setComments(res.data ?? [])
            } catch (error) {
                console.error("Fetch comments error:", error)
            }
        }

        fetchTaskDetail()
        fetchComments()
    }, [projectId, taskId])

    // setup SignalR connection
    useEffect(() => {
        if (!tokenStored) return

        const conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5144/hubs/task", {
                accessTokenFactory: () => tokenStored,
            })
            .withAutomaticReconnect()
            .build()

        setConnection(conn)

        return () => {
            // ensure cleanup if token changes before connection established
            if (conn && conn.state === signalR.HubConnectionState.Connected) {
                conn.stop().catch(() => { /* ignore */ })
            }
        }
    }, [tokenStored])

    useEffect(() => {
        if (!connection) return

        let mounted = true

        connection.start().then(async () => {
            if (!mounted) return
            console.log("Connected to TaskHub")

            try {
                await connection.invoke("JoinTaskGroup", taskId)
            } catch (err) {
                console.error("JoinTaskGroup error:", err)
            }

            connection.on("UserJoinedTask", (user: ActiveUser) => {
                setActiveUsers((prev) => {
                    // avoid duplicates
                    if (prev.find((p) => p.id === user.id)) return prev
                    return [...prev, user]
                })
            })

            connection.on("UserLeftTask", (user: ActiveUser) => {
                setActiveUsers((prev) => prev.filter((u) => u.id !== user.id))
            })

            connection.on("ActiveUsersInTask", (users: ActiveUser[]) => {
                setActiveUsers(users)
            })

            // optional: listen to new comments broadcasted by hub (if implemented server-side)
            connection.on("NewComment", (newComment: Comment) => {
                setComments((prev) => [newComment, ...prev])
            })

            try {
                await connection.invoke("GetActiveUsers", taskId)
            } catch (err) {
                console.error("GetActiveUsers error:", err)
            }
        }).catch(err => {
            console.error("SignalR connection start error:", err)
        })

        return () => {
            connection.off("UserJoinedTask")
            connection.off("UserLeftTask")
            connection.off("ActiveUsersInTask")
            connection.off("NewComment")
            connection.stop().catch(() => { /* ignore */ })
            mounted = false
        }
    }, [connection, taskId])

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const res = await axios.get(`/files/task/${taskId}`);
                console.log("Fetched files:", res.data);
                setFiles(res.data);
            } catch (err) {
                console.error("Fetch files error:", err);
            }
        };

        fetchFiles();
    }, [taskId]);

    // Handlers for comments ----------------------------------

    const handleAddComment = async () => {
        if (!comment.trim()) return
        try {
            if (editingCommentId) {
                // update existing comment
                const res = await axios.put(`/comment/${editingCommentId}`, { content: comment.trim() })
                setComments((prev) => prev.map(c => c.commentId === editingCommentId ? res.data : c))
                setEditingCommentId(null)
            } else {
                // create new
                const newCommentPayload = {
                    TaskId: taskId,
                    Content: comment.trim(),
                }
                const res = await axios.post(`/comment`, newCommentPayload)
                // prepend new comment
                setComments((prev) => [res.data, ...prev])
                // optionally notify server via SignalR if needed
                if (connection && connection.state === signalR.HubConnectionState.Connected) {
                    try {
                        await connection.invoke("BroadcastNewComment", taskId, res.data)
                    } catch (err) {
                        // ignore if server not implement BroadcastNewComment
                    }
                }
            }
            setComment("")
        } catch (error) {
            console.error("Comment add/edit error:", error)
        }
    }

    const handleEditClick = (c: Comment) => {
        setComment(c.content)
        setEditingCommentId(c.commentId)
        // switch to comments tab if not there
        setActiveTab("comments")
    }

    const handleDeleteComment = async (id: number) => {
        try {
            await axios.delete(`/comment/${id}`)
            setComments((prev) => prev.filter((c) => c.commentId !== id))
        } catch (error) {
            console.error("Delete comment error:", error)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("taskId", taskId.toString());

        try {
            const res = await axios.post(`/files/upload`, formData);
            alert("Upload thành công!");
            setFiles(prev => [res.data, ...prev]); // ✅ Cập nhật danh sách ngay
        } catch (err) {
            console.error("Upload error:", err);
            alert("Lỗi upload file");
        }
    };

    const handleDeleteFile = async (fileIdOrName: any) => {
        setFiles((prev) => prev.filter((f) => f.fileId !== fileIdOrName && f.fileName !== fileIdOrName));
        // Nếu bạn có API xóa file, có thể gọi thêm:
        await axios.delete(`/files/${fileIdOrName}`);
    };

    if (!task) return null

    return (
        <TooltipProvider>
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
                                {/* if you have task.key you can show it here */}
                                {("key" in task && (task as any).key) ? (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {(task as any).key}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                <Lock className="h-4 w-4" />
                            </Button>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="bg-blue-100 text-blue-700">
                                        <Eye className="h-4 w-4 mr-1" />
                                        {activeUsers.length}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="p-3">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Active Users ({activeUsers.length})</p>
                                        {activeUsers.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {activeUsers.map((user) => (
                                                    <div key={user.id} className="flex items-center gap-2">
                                                        <ColoredAvatar id={user.id} name={user.name} size="sm" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500">No active users</p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
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
                                <div className="relative">
                                    <Button variant="ghost" size="sm" onClick={() => document.getElementById("fileUploadInput")?.click()}>
                                        <Paperclip className="h-4 w-4 mr-1" />
                                        Add attachment
                                    </Button>
                                    <input
                                        id="fileUploadInput"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                                {task.files && task.files.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                                        <ul className="space-y-1">
                                            {task.files.map((f) => (
                                                <li key={f.fileId}>
                                                    <a
                                                        href={f.filePath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm"
                                                    >
                                                        {f.fileName}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Attachments section */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                                    {files.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No attachments yet.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {files.map((f) => (
                                                <div
                                                    key={f.fileId || f.fileName}
                                                    onClick={() => setPreviewFile(f)} // 👉 click mở preview
                                                    className="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white cursor-pointer"
                                                >
                                                    {/* Nội dung file */}
                                                    {f.fileType?.includes("image") ? (
                                                        <img
                                                            src={f.filePath}
                                                            alt={f.fileName}
                                                            className="w-full h-32 object-cover"
                                                        />
                                                    ) : f.fileType?.includes("pdf") ? (
                                                        <iframe
                                                            src={`${f.filePath}#toolbar=0`}
                                                            className="w-full h-32"
                                                            title={f.fileName}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-32 bg-gray-100 text-gray-500 text-sm">
                                                            📄
                                                        </div>
                                                    )}

                                                    {/* Footer info */}
                                                    <div className="p-2 flex flex-col bg-white">
                                                        <span className="text-xs font-medium truncate">{f.fileName}</span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {f.uploadedAt
                                                                ? new Date(f.uploadedAt).toLocaleString()
                                                                : "Just now"}
                                                        </span>
                                                    </div>

                                                    {/* Hiệu ứng đen mờ khi hover */}
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                            <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
                                            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                                            <TabsTrigger value="worklog" className="text-xs">Work log</TabsTrigger>
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
                                                    <Badge variant="outline" className="mt-2 text-xs">HISTORY</Badge>
                                                    <div className="text-sm text-gray-600 mt-2">Thái Bảo → None</div>
                                                </div>
                                            </div>

                                            {comments.map((c) => (
                                                <div key={c.commentId} className="flex gap-3 pb-3">
                                                    <ColoredAvatar id={c.userId} name={c.userName ?? "User"} size="md" showOnlineStatus={true} />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className="font-medium">{c.userName ?? "User"}</span>
                                                            <span className="text-gray-500">commented</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{new Date(c.createdAt).toLocaleString()}</div>
                                                        <div className="text-sm text-gray-700 mt-1">{c.content}</div>
                                                        {c.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </TabsContent>

                                        <TabsContent value="comments" className="mt-4">
                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-red-500 text-white text-xs">ME</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <Textarea
                                                        placeholder="Add a comment..."
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        className="min-h-[80px] resize-none"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && !e.shiftKey) {
                                                                e.preventDefault()
                                                                handleAddComment()
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => { setComment("🎉 Looks good!"); }}>
                                                                🎉 Looks good!
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => { setComment("👋 Need help?"); }}>
                                                                👋 Need help?
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => { setComment("🚫 This is blocked..."); }}>
                                                                🚫 This is blocked...
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => { setComment("🔍 Can you clarify...?"); }}>
                                                                🔍 Can you clarify...?
                                                            </Button>
                                                        </div>

                                                        <div className="ml-auto flex items-center gap-2">
                                                            {editingCommentId && (
                                                                <Button size="sm" variant="ghost" onClick={() => { setEditingCommentId(null); setComment(""); }}>
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                            <Button size="sm" onClick={handleAddComment}>
                                                                {editingCommentId ? "Update" : "Comment"}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Pro tip: press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">M</kbd> to comment
                                                    </div>
                                                </div>
                                            </div>

                                            {/* comment list with edit/delete */}
                                            <div className="mt-4 space-y-3">
                                                {comments.map((c) => (
                                                    <div key={c.commentId} className="flex gap-3 border-b pb-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-gray-500 text-white text-xs">{c.userName?.[0] ?? "U"}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium">{c.userName ?? "User"}</span>
                                                                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-700 mt-1">{c.content}</div>
                                                            {c.isEdited && <span className="text-xs text-gray-400 ml-1">(edited)</span>}
                                                            <div className="flex gap-2 text-xs text-blue-600 mt-1">
                                                                <button onClick={() => handleEditClick(c)}>Edit</button>
                                                                <button onClick={() => handleDeleteComment(c.commentId)}>Delete</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
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
                                                        {("deadline" in task ? (task as any).deadline : null) || "Add due date"}
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
            {previewFile && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] relative">
                        <button
                            onClick={() => setPreviewFile(null)}
                            className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {previewFile.fileType?.includes("image") ? (
                            <img
                                src={previewFile.filePath}
                                alt={previewFile.fileName}
                                className="w-full h-full object-contain"
                            />
                        ) : previewFile.fileType?.includes("pdf") ? (
                            <iframe
                                src={previewFile.filePath}
                                className="w-full h-full"
                                title={previewFile.fileName}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-700">
                                <p>Không thể xem trước file này.</p>
                                <a
                                    href={previewFile.filePath}
                                    download={previewFile.fileName}
                                    className="mt-2 text-blue-600 underline"
                                >
                                    Tải xuống {previewFile.fileName}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </TooltipProvider>
    )
}
