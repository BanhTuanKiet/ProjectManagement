import type { BasicTask, TaskDetail, UpdateTask } from "@/utils/ITask"
import type { UserMini } from "@/utils/IUser"

export interface Task {
  id: number
  key: string
  summary: string
  status: "To Do" | "Done" | "In Progress"
  assignee?: UserMini
  dueDate?: string
  type?: "Task" | "Bug" | "Feature" | string
  created?: string
  reporter?: UserMini
  description?: string
  priority?: "Low" | "Medium" | "High" | number
  estimateHours?: number
  isActive: boolean
  raw: BasicTask // giữ lại data gốc để sau dễ dùng
  // Thêm các trường khác nếu cần
  subtasks?: Task[]
}

const priorityMapBEtoFE: Record<number, "Low" | "Medium" | "High"> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

export const mapPriorityFromApi = (priority?: number | string): "Low" | "Medium" | "High" => {
  if (typeof priority === "number") return priorityMapBEtoFE[priority] ?? "Low";
  if (typeof priority === "string") return priority as "Low" | "Medium" | "High";
  return "Low";
};

const priorityMapFEtoBE: Record<"Low" | "Medium" | "High", number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

export const mapPriorityToApi = (priority?: "Low" | "Medium" | "High" | number): number => {
  if (typeof priority === "number") return priority;
  if (typeof priority === "string") return priorityMapFEtoBE[priority as "Low" | "Medium" | "High"];
  return 1; // default Low
};

export const mapApiTaskToTask = (apiTask: BasicTask): Task => {
  const assigneeName = apiTask.assignee || null
  const reporterName = apiTask.createdName|| null
  // console.log("Mapping API Task:", apiTask);
  return {
    id: apiTask.subTaskId ?? apiTask.taskId ?? apiTask.id,
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
    dueDate: apiTask.deadline ? new Date(apiTask.deadline).toISOString().split("T")[0] : undefined,
    created: apiTask.createdAt ? new Date(apiTask.createdAt).toISOString().split("T")[0] : undefined,
    reporter: reporterName
      ? {
          name: reporterName,
          avatar: "",
          initials: reporterName.charAt(0).toUpperCase(),
        }
      : undefined,
    description: apiTask.description,
    type: "Task",
    priority:  mapPriorityFromApi(apiTask.priority),
    isActive: apiTask.isActive,
    raw: apiTask, // giữ lại data gốc để sau dễ dùng
    subtasks: [],
  }
}

export const mapApiUserToUserMini = (apiUser: Record<string, unknown>): UserMini => {
  const name = (apiUser["name"] as string) ?? "?";

  return {
    id: apiUser["userId"] as string | number,
    name,
    avatar: (apiUser["avatarUrl"] as string) ?? "",
    initials: name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase(),
  };
};

export const mapTaskToApiUpdatePayload = (task: Task): Record<string, unknown> => {
  const payload: Record<string, unknown> = {}

  if (task.summary !== undefined) payload.title = task.summary
  if (task.description !== undefined) payload.description = task.description
  if (task.status !== undefined) payload.status = task.status
  if (task.priority !== undefined) payload.priority = mapPriorityToApi(task.priority)

  if (task.assignee && typeof task.assignee === "object") {
    const userObj = task.assignee as UserMini
    payload.assigneeId = userObj.id || null
  } else if (task.assignee === null) {
    payload.assigneeId = null
  }

  if (task.dueDate !== undefined) payload.deadline = task.dueDate
  if (task.estimateHours !== undefined) payload.estimateHours = task.estimateHours

  return payload
}

export const mapTaskDetailToUpdateTask = (taskDetail: TaskDetail): UpdateTask => {
  return {
    Title: taskDetail.title,
    Description: taskDetail.description,
    Priority: taskDetail.priority,
    CreatedAt: taskDetail.createdAt,
    Deadline: taskDetail.deadline,
  }
}