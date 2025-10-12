"use client"
import type { DragEndEvent } from "@/components/ui/shadcn-io/list"
import { ListGroup, ListHeader, ListItem, ListItems, ListProvider } from "@/components/ui/shadcn-io/list"
import { useEffect, useState } from "react"
import type { BasicTask } from "@/utils/ITask"
import { taskStatus } from "@/utils/statusUtils"
import { arrayMove } from "@dnd-kit/sortable"
import axios from "@/config/axiosConfig"
import { useParams } from "next/navigation"
import { useNotification } from "@/app/(context)/Notfication"
import TaskCard from "./TaskCalendar"

const TaskList = ({ tasks }: { tasks: BasicTask[] }) => {
  const { project_name } = useParams()
  const [features, setFeatures] = useState<BasicTask[]>([])
  const { selectedTask, setSelectedTask } = useNotification()

  useEffect(() => {
    if (!tasks) return
    setFeatures(tasks)
  }, [tasks])

  const updateTask = async (taskId: number, newStatus: string) => {
    try {
      const projectId = project_name
      await axios.put(`/tasks/${projectId}/${taskId}`, { status: newStatus })
    } catch (error) {
      console.log(error)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    let newStatus = ""
    const activeTaskId = Number(active.id)

    setFeatures((prev) => {
      const oldIndex = prev.findIndex((t) => t.taskId.toString() === active.id)
      const overTask = prev.find((t) => t.taskId.toString() === over.id)
      const currentTask = prev.find((f) => f.taskId === overTask?.taskId)

      if (overTask?.taskId === currentTask?.taskId) return prev

      if (overTask) {
        const newIndex = prev.findIndex((t) => t.taskId.toString() === over.id)
        if (prev[oldIndex].status === overTask.status) {
          return arrayMove(prev, oldIndex, newIndex)
        } else {
          newStatus = overTask.status
          return prev.map((task) =>
            task.taskId.toString() === active.id ? { ...task, status: overTask.status } : task,
          )
        }
      } else {
        newStatus = over.id as string
        return prev.map((task) => (task.taskId.toString() === active.id ? { ...task, status: newStatus } : task))
      }
    })

    if (newStatus === "") return
    if (newStatus) {
      await updateTask(activeTaskId, newStatus)
    }
  }

  return (
    <div className="w-full h-full bg-background p-6">
      <ListProvider onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full overflow-x-auto">
          {taskStatus.map((status) => {
            const tasksInColumn = features.filter((f) => f.status === status.name)
            return (
              <div key={status.name} className="flex-shrink-0 w-80">
                <ListGroup id={status.name}>
                  <div className="mb-3">
                    <ListHeader color={status.color} name={status.name} />
                    <div className="mt-2 px-3">
                      <span className="text-xs text-muted-foreground">
                        {tasksInColumn.length} {tasksInColumn.length === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                  </div>

                  <ListItems className="space-y-2 p-0 min-h-[200px] bg-muted/30 rounded-lg p-2">
                    {tasksInColumn.map((feature, index) => (
                      <ListItem
                        id={feature.taskId.toString()}
                        index={index}
                        key={feature.taskId}
                        name={feature.title}
                        parent={feature.status}
                        className="p-0 w-full"
                      >
                        <TaskCard key={feature.taskId} task={feature} setSelectedTask={setSelectedTask} />
                      </ListItem>
                    ))}
                  </ListItems>
                </ListGroup>
              </div>
            )
          })}
        </div>
      </ListProvider>
    </div>
  )
}

export default TaskList
