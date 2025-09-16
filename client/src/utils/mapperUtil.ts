import { BasicTask } from "@/utils/ITask";
import { UserMini } from "@/utils/IUser";

export interface Task {
  id: string;
  key: string;
  summary: string;
  status: "To Do" | "Done" | "In Progress";
  assignee?: { name: string; avatar: string; initials: string };
  dueDate?: string;
  type: "Task";
  [key: string]: any;
}

export const mapApiTaskToTask = (apiTask: BasicTask): Task => {
  const assigneeName = apiTask.assignee || null;
  const reporterName = apiTask.createdBy || null;

  return {
    id: String(apiTask.taskId),
    key: `TASK-${apiTask.taskId}`,
    summary: apiTask.title,
    status: apiTask.status as "To Do" | "Done" | "In Progress",
    assignee: assigneeName
      ? {
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
    type: "Task",
    raw: apiTask, // giữ lại data gốc để sau dễ dùng
  };
};

export const mapApiUserToUserMini = (apiUser: any): UserMini => ({
  name: apiUser.userName,
  avatar: apiUser.avatarUrl || "",
  initials: (apiUser.userName || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase(),
});
