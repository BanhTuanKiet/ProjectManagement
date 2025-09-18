import { CardDescription } from '@/components/ui/card';
import { BasicTask } from "@/utils/ITask";
import { UserMini } from "@/utils/IUser";

export interface Task {
  id: string;
  key: string;
  summary: string;
  status: "To Do" | "Done" | "In Progress";
  assignee?: UserMini;
  dueDate?: string;
  type: "Task";
  created?: string;
  reporter?: UserMini;
  description?: string;
  priority?: "Low" | "Medium" | "High";
  estimateHours?: number;
  raw: BasicTask; // giữ lại data gốc để sau dễ dùng
  // Thêm các trường khác nếu cần
  [key: string]: any;
}

export const mapApiTaskToTask = (apiTask: BasicTask): Task => {
  const assigneeName = apiTask.assignee || null;
  const reporterName = apiTask.createdBy || null;
  // console.log("Mapping API Task:", apiTask);
  return {
    id: String(apiTask.taskId),
    key: `TASK-${apiTask.taskId}`,
    summary: apiTask.title,
    status: apiTask.status as "To Do" | "Done" | "In Progress",
    assignee: assigneeName
      ? {
          id: apiTask.assigneeId,
          name: assigneeName,
          avatar: "",
          initials: assigneeName.charAt(0).toUpperCase(),
        }
      : undefined,
    dueDate: apiTask.deadline
      ? new Date(apiTask.deadline).toISOString().split("T")[0]
      : undefined,
    created: apiTask.createdAt
      ? new Date(apiTask.createdAt).toISOString().split("T")[0]
      : undefined,
    reporter: reporterName
      ? {
          name: reporterName,
          avatar: "",
          initials: reporterName.charAt(0).toUpperCase(),
        }
      : undefined,
    description: apiTask.description,
    type: "Task", 
    raw: apiTask, // giữ lại data gốc để sau dễ dùng
  };
};

export const mapApiUserToUserMini = (apiUser: any): UserMini => ({
  id: apiUser.id,
  name: apiUser.userName,
  avatar: apiUser.avatarUrl || "",
  initials: (apiUser.userName || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase(),
});

// FE Task -> BE update payload
export const mapTaskToApiUpdatePayload = (task: Task): Record<string, any> => {
  const payload: Record<string, any> = {};

  if (task.summary !== undefined) {
    payload.title = task.summary; // map summary -> title
  }

  if (task.description !== undefined) {
    payload.description = task.description;
  }

  if (task.status !== undefined) {
    payload.status = task.status;
  }

  if (task.priority !== undefined) {
    payload.priority = task.priority;
  }

  if (task.assignee?.id !== undefined) {
    payload.assigneeId = task.assignee?.id;
  }

  if (task.dueDate !== undefined) {
    payload.deadline = task.dueDate;
  }

  if (task.estimateHours !== undefined) {
    payload.estimateHours = task.estimateHours;
  }
  if(task.description !== undefined) {
    payload.description = task.description;
  }

  return payload;
};
