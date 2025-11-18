import type { BasicTask, TaskDetail, UpdateTask } from "@/utils/ITask"
import type { UserMini } from "@/utils/IUser"

export interface Task {
  id: number
  key: string
  summary: string
  status: "To Do" | "Done" | "In Progress"
  assignee?: UserMini
  dueDate?: string
  type: "Task"
  created?: string
  reporter?: UserMini
  description?: string
  priority?: "Low" | "Medium" | "High" | number
  estimateHours?: number
  raw: BasicTask // giữ lại data gốc để sau dễ dùng
  // Thêm các trường khác nếu cần
  subtasks?: Task[]
  [key: string]: any
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
  const reporterName = apiTask.createdBy || null
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
    raw: apiTask, // giữ lại data gốc để sau dễ dùng
    subtasks: [],
  }
}

export const mapApiUserToUserMini = (apiUser: any): UserMini => ({
  id: apiUser.userId,
  name: apiUser.name,
  avatar: apiUser.avatarUrl || "",
  initials: (apiUser.name || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase(),
})

// FE Task -> BE update payload
export const mapTaskToApiUpdatePayload = (task: Task): Record<string, any> => {
  const payload: Record<string, any> = {}

  if (task.summary !== undefined) {
    payload.title = task.summary // map summary -> title
  }

  if (task.description !== undefined) {
    payload.description = task.description
  }

  if (task.status !== undefined) {
    payload.status = task.status
  }

  if (task.priority !== undefined) {
    payload.priority = mapPriorityToApi(task.priority)
  }

  if (task.assignee?.id !== undefined) {
    payload.assigneeId = task.assignee?.id
  }

  if (task.dueDate !== undefined) {
    payload.deadline = task.dueDate
  }

  if (task.estimateHours !== undefined) {
    payload.estimateHours = task.estimateHours
  }
  if (task.description !== undefined) {
    payload.description = task.description
  }

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