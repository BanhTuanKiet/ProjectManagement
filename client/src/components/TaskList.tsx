"use client"
import type { DragEndEvent } from "@/components/ui/shadcn-io/list"
import { ListGroup, ListHeader, ListItem, ListItems, ListProvider } from "@/components/ui/shadcn-io/list"
import { useEffect, useState } from "react"
import type { BasicTask } from "@/utils/ITask"
import { taskStatus } from "@/utils/statusUtils"
import { arrayMove } from "@dnd-kit/sortable"
import axios from "@/config/axiosConfig"
import { useParams } from "next/navigation"
import { useNotification } from "@/app/.context/Notfication"
import TaskCalendar from "./TaskCalendar"

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
    <ListProvider onDragEnd={handleDragEnd}>
      {taskStatus.map((status) => (
        <ListGroup id={status.name} key={status.name}>
          <ListHeader color={status.color} name={status.name} />
          <ListItems className="p-0 w-full">
            {features
              .filter((f) => f.status === status.name)
              .map((feature, index) => (
                <ListItem
                  id={feature.taskId.toString()}
                  index={index}
                  key={feature.taskId}
                  name={feature.title}
                  parent={feature.status}
                  className="p-1 w-full"
                >
                  <TaskCalendar key={feature.taskId} task={feature} setSelectedTask={setSelectedTask} />
                </ListItem>
              ))}
          </ListItems>
        </ListGroup>
      ))}
    </ListProvider>
  )
}

export default TaskList
