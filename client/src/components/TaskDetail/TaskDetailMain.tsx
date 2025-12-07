import axios from "@/config/axiosConfig";
import { useEffect, useState } from "react";
import {
    ChevronDown,
    Activity,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getTaskStatusBadge } from "@/utils/statusUtils";
import * as signalR from "@microsoft/signalr";
import ColoredAvatar from "../ColoredAvatar";
import TaskAttachments from "./TaskAttachments";
import { Task } from "@/utils/mapperUtil";

interface Comment {
    commentId: number;
    taskId: number;
    userId: string;
    content: string;
    createdAt: string;
    isEdited: boolean;
    userName?: string;
}

interface TaskDetailMainProps {
    task: Task;
    taskId: number;
    projectId: number;
    connection: signalR.HubConnection | null;
}

export default function TaskDetailMain({
    task,
    taskId,
    projectId,
    connection,
}: TaskDetailMainProps) {
    // --- STATE ---
    const [title, setTitle] = useState(task?.title || "");
    const [editTitle, setEditTitle] = useState(false);

    const [description, setDescription] = useState(task?.description || "");
    const [editDescription, setEditDescription] = useState(false);

    // State cho Activity/Comments
    const [activeTab, setActiveTab] = useState("all");
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

    // Đồng bộ state từ props
    useEffect(() => {
        setTitle(task.summary || "");
        setDescription(task.description || "");
    }, [task.title, task.description]);

    // --- CORE FUNCTION: UPDATE FIELD ---
    const updateTaskField = async (key: string, value: string) => {
        try {
            // Validate cơ bản
            if (key === "title" && !value.trim()) {
                setTitle(task?.title || ""); // Revert nếu rỗng
                return;
            }

            console.log(`Updating [${key}] to:`, value);

            // Gọi API chung
            await axios.put(`/tasks/${projectId}/tasks/${taskId}/update`, {
                [key]: value
            });

            // Cập nhật state UI
            if (key === "title") {
                setTitle(value);
                setEditTitle(false);
            }
            if (key === "description") {
                setDescription(value);
                setEditDescription(false);
            }

        } catch (error) {
            console.error(`Failed to update ${key}:`, error);
            // Revert data nếu lỗi
            if (key === "title") setTitle(task.title || "");
            if (key === "description") setDescription(task.description || "");
        }
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await axios.get(`/comment/task/${taskId}`);
                setComments(res.data ?? []);
            } catch (error) {
                console.error("Fetch comments error:", error);
            }
        };
        fetchComments();
    }, [taskId]);

    useEffect(() => {
        if (!connection) return;
        const newCommentHandler = (newComment: Comment) => {
            setComments((prev) => {
                if (prev.find(c => c.commentId === newComment.commentId)) return prev;
                return [newComment, ...prev];
            });
        };
        connection.on("NewComment", newCommentHandler);
        return () => {
            connection.off("NewComment", newCommentHandler);
        };
    }, [connection]);

    const handleAddComment = async () => {
        if (!comment.trim()) return;
        const contentToSend = comment.trim();
        setComment("");

        try {
            if (editingCommentId) {
                const res = await axios.put(`/comment/${editingCommentId}`, {
                    content: contentToSend,
                });
                setComments((prev) =>
                    prev.map((c) => (c.commentId === editingCommentId ? res.data : c))
                );
                setEditingCommentId(null);
            } else {
                const newCommentPayload = {
                    TaskId: taskId,
                    Content: contentToSend,
                };
                const res = await axios.post(`/comment/task/${taskId}/project/${projectId}`, newCommentPayload);
                setComments((prev) => [res.data, ...prev]);

                if (connection && connection.state === signalR.HubConnectionState.Connected) {
                    await connection.invoke("BroadcastNewComment", taskId, res.data);
                }
            }
        } catch (error) {
            console.error("Comment add/edit error:", error);
            // Nếu lỗi thì trả lại text vào ô input để user sửa
            setComment(contentToSend);
        }
    };

    const handleEditClick = (c: Comment) => {
        setComment(c.content);
        setEditingCommentId(c.commentId);
        setActiveTab("comments");
    };

    const handleDeleteComment = async (id: number) => {
        try {
            await axios.delete(`/comment/${id}`);
            setComments((prev) => prev.filter((c) => c.commentId !== id));
        } catch (error) {
            console.error("Delete comment error:", error);
        }
    };

    return (
        <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
                {/* Component 4: Attachments (Tự quản lý files) */}
                <TaskAttachments
                    taskId={taskId}
                    projectId={projectId}
                />

                <div>
                    {!editTitle ? (
                        <div
                            className="text-2xl text-black-600 min-h-[60px] cursor-pointer hover:bg-gray-100 p-2 rounded"
                            onClick={() => setEditTitle(true)}
                        >
                            <strong>{title}</strong>
                        </div>
                    ) : (
                        <textarea
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => updateTaskField("title", title)} // Blur -> Save
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // Chặn xuống dòng
                                    updateTaskField("title", title); // Save & Close
                                }
                            }}
                            className="w-full text-sm text-gray-700 bg-white border border-gray-300 p-3 rounded min-h-[80px] focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder={task.title}
                        />
                    )}
                </div>

                {/* Description (Sử dụng updateTaskField) */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    {!editDescription ? (
                        <div
                            className="text-sm text-gray-600 bg-gray-50 p-3 rounded border min-h-[60px] cursor-pointer hover:bg-gray-100"
                            onClick={() => setEditDescription(true)}
                        >
                            {description || "Add a description..."}
                        </div>
                    ) : (
                        <textarea
                            autoFocus
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => updateTaskField("description", description)} // Blur -> Save
                            onKeyDown={(e) => {
                                // Cho phép xuống dòng nếu giữ Shift + Enter
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    updateTaskField("description", description); // Save & Close
                                }
                            }}
                            className="w-full text-sm text-gray-700 bg-white border border-gray-300 p-3 rounded min-h-[80px] focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Add a description..."
                        />
                    )}
                </div>

                {/* Subtasks */}
                {/* <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900">
                            Subtasks
                        </h3>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                        Add subtask
                    </button>
                </div> */}

                {/* Linked work items */}
                {/* <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Linked work items
                    </h3>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                        Add linked work item
                    </button>
                </div> */}

                {/* Activity (Tự quản lý) */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-900">
                            Activity
                        </h3>
                        <Button variant="ghost" size="sm">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
                            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                            <TabsTrigger value="worklog" className="text-xs">Work log</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-4 space-y-4">
                            {/* Mục History (hardcoded từ file gốc) */}
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-red-500 text-white text-xs">
                                        TB
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Thái Bảo</span>
                                        <span className="text-gray-500">updated the</span>
                                        <span className="font-medium">Reporter</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        September 13, 2025 at 3:36 PM
                                    </div>
                                    <Badge variant="outline" className="mt-2 text-xs">
                                        HISTORY
                                    </Badge>
                                    <div className="text-sm text-gray-600 mt-2">
                                        Thái Bảo → None
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách Comments (hiển thị trong tab "All") */}
                            {comments && comments?.map((c) => (
                                <div key={c.commentId} className="flex gap-3 pb-3">
                                    <ColoredAvatar
                                        id={c.userId}
                                        name={c.userName ?? "User"}
                                        size="md"
                                        showOnlineStatus={true}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">
                                                {c.userName ?? "User"}
                                            </span>
                                            <span className="text-gray-500">commented</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {new Date(c.createdAt).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-700 mt-1">
                                            {c.content}
                                        </div>
                                        {c.isEdited && (
                                            <span className="text-xs text-gray-400">
                                                (edited)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="comments" className="mt-4">
                            {/* Input Comment */}
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
                                                e.preventDefault();
                                                handleAddComment();
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => setComment("🎉 Looks good!")}>🎉 Looks good!</Button>
                                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => setComment("👋 Need help?")}>👋 Need help?</Button>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            {editingCommentId && (
                                                <Button size="sm" variant="ghost" onClick={() => { setEditingCommentId(null); setComment(""); }}>Cancel</Button>
                                            )}
                                            <Button size="sm" onClick={handleAddComment}>{editingCommentId ? "Update" : "Comment"}</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Render Comments List */}
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
                            <div className="text-sm text-gray-500">
                                History items will appear here
                            </div>
                        </TabsContent>

                        <TabsContent value="worklog" className="mt-4">
                            <div className="text-sm text-gray-500">
                                Work log entries will appear here
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}