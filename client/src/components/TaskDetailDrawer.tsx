"use client";

import {
  X,
  ChevronDown,
  User,
  Calendar,
  Plus,
  Activity,
  Filter,
  MoreHorizontal,
  Eye,
  Share,
  Lock,
} from "lucide-react";
import type { Task } from "@/utils/mapperUtil";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { BasicTask } from "@/utils/ITask";
import { getPriorityIcon, getTaskStatusBadge } from "@/utils/statusUtils";
import { useEffect, useState } from "react";
import axios from "@/config/axiosConfig";
import ColoredAvatar from "./ColoredAvatar";

interface TaskDetailDrawerProps {
  task: Task | BasicTask | null;
  onClose: () => void;
}

interface Comment {
  commentId: number;
  taskId: number;
  userId: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  userName?: string;
}

export default function TaskDetailDrawer({
  task,
  onClose,
}: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [description, setDescription] = useState(task?.description || "");
  const [editDescription, setEditDescription] = useState(false);

  console.log("Task in drawer:", task);
  useEffect(() => {
    if (task) {
      const taskId = "taskId" in task ? task.taskId : task.id;
      axios.get(`/comment/task/${taskId}`).then((res) => {
        setComments(res.data);
      });
    }
  }, [task]);

  console.log("Comments:", comments);

  // thêm comment
  const handleAddComment = async () => {
    if (!comment.trim() || !task) return;
    const taskId = "taskId" in task ? task.taskId : task.id;
    if (editingCommentId) {
      // đang edit
      const res = await axios.put(`/comment/${editingCommentId}`, {
        content: comment.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c.commentId === editingCommentId ? res.data : c))
      );
      setEditingCommentId(null);
    } else {
      // tạo mới
      const newComment = {
        TaskId: taskId,
        Content: comment.trim(),
      };
      const res = await axios.post(`/comment`, newComment);
      setComments((prev) => [res.data, ...prev]);
    }

    setComment("");
  };

  if (!task) return null;

  // sửa comment
  const handleEditClick = (c: Comment) => {
    setComment(c.content); // fill data lên textarea
    setEditingCommentId(c.commentId); // bật chế độ edit
  };

  // xóa comment
  const handleDeleteComment = async (id: number) => {
    await axios.delete(`/comment/${id}`);
    setComments((prev) => prev.filter((c) => c.commentId !== id));
  };

  const handleUpdateDescription = async (updateDescription: string) => {
    try {
      const response = await axios.put(
        `/tasks/updateDescription/${task.taskId}`,
        { description: updateDescription }
      );
      setEditDescription(false);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white w-[1000px] h-[90vh] rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add epic
            </Button>
            <span className="text-gray-400">/</span>
            <div className="flex items-center gap-2">
              {"key" in task ? (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {task.key}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Lock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-blue-100 text-blue-700"
            >
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
                <h1 className="text-xl font-medium text-gray-900 flex-1 mr-4">
                  {("summary" in task ? task.summary : "") || "No title"}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getTaskStatusBadge(task.status)} border`}
                  >
                    {task.status}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Description
                </h3>

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
                    onBlur={() => {
                      handleUpdateDescription(description);
                      setEditDescription(false);
                    }}
                    className="w-full text-sm text-gray-700 bg-white border border-gray-300 p-3 rounded min-h-[80px] focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="Add a description..."
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Subtasks
                  </h3>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Add subtask
                </button>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Linked work items
                </h3>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Add linked work item
                </button>
              </div>

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

                    {comments.map((c) => (
                      <div key={c.commentId} className="flex gap-3 pb-3">
                        {/* Avatar có màu + initials */}
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
                            {/* action mô tả comment (có thể thay đổi text tùy history/comment/worklog) */}
                            <span className="text-gray-500">commented</span>
                          </div>

                          {/* Thời gian tạo */}
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(c.createdAt).toLocaleString()}
                          </div>

                          {/* Nội dung comment */}
                          <div className="text-sm text-gray-700 mt-1">
                            {c.content}
                          </div>

                          {/* Hiển thị “(edited)” nếu có */}
                          {c.isEdited && (
                            <span className="text-xs text-gray-400">
                              (edited)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="comments" className="mt-4 space-y-4">
                    {/* form thêm comment */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-red-500 text-white text-xs">
                          ME
                        </AvatarFallback>
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
                          <Button size="sm" onClick={handleAddComment}>
                            {editingCommentId ? "Update" : "Comment"}
                          </Button>
                          {editingCommentId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingCommentId(null);
                                setComment("");
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* danh sách comment */}
                    {comments.map((c) => (
                      <div
                        key={c.commentId}
                        className="flex gap-3 border-b pb-3"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-500 text-white text-xs">
                            {c.userName?.[0] ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {c.userName ?? "User"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            {c.content}
                          </div>
                          {c.isEdited && (
                            <span className="text-xs text-gray-400 ml-1">
                              (edited)
                            </span>
                          )}

                          <div className="flex gap-2 text-xs text-blue-600 mt-1">
                            <button onClick={() => handleEditClick(c)}>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c.commentId)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="history" className="mt-4">
                    {comments.map((c) => (
                      <div key={c.commentId} className="flex gap-3 pb-3">
                        {/* Avatar có màu + initials */}
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
                            {/* action mô tả comment (có thể thay đổi text tùy history/comment/worklog) */}
                            <span className="text-gray-500">commented</span>
                          </div>

                          {/* Thời gian tạo */}
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(c.createdAt).toLocaleString()}
                          </div>

                          {/* Nội dung comment */}
                          <div className="text-sm text-gray-700 mt-1">
                            {c.content}
                          </div>

                          {/* Hiển thị “(edited)” nếu có */}
                          {c.isEdited && (
                            <span className="text-xs text-gray-400">
                              (edited)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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

          <div className="w-80 border-l bg-gray-50 overflow-auto">
            <div className="p-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm font-medium">
                    Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 mt-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          Assignee
                        </label>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {typeof task.assignee === "string"
                              ? task.assignee
                              : task.assignee?.name || "Unassigned"}
                          </span>
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                          Assign to me
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          Priority
                        </label>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon("Medium")}
                          <span className="text-sm text-gray-600">Medium</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          Parent
                        </label>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Add parent
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          Start date
                        </label>
                        <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {("startDate" in task ? task.dueDate : null) ||
                            "Add due date"}
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          Due date
                        </label>
                        <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {("dueDate" in task ? task.dueDate : null) ||
                            "Add due date"}
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          Labels
                        </label>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Add labels
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">
                          Sprint
                        </label>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Add to sprint
                        </button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="more-fields">
                  <AccordionTrigger className="text-sm font-medium">
                    More fields
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="mb-2">
                        <span className="block text-xs font-medium text-gray-700 mb-1">
                          Reporter
                        </span>
                        Anonymous
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="automation">
                  <AccordionTrigger className="text-sm font-medium">
                    Automation
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="mb-2">Recent rule runs</p>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        Refresh to see recent runs
                      </button>
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
  );
}
