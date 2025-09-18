"use client"
import type { DragEndEvent } from "@/components/ui/shadcn-io/list"
import { ListGroup, ListHeader, ListItem, ListItems, ListProvider } from "@/components/ui/shadcn-io/list"
import { useEffect, useState } from "react"
import type { BasicTask } from "@/utils/ITask"
import { getBorderColor, getCheckboxColor, taskStatus } from "@/utils/statusUtils"
import ColoredAvatar from "./ColoredAvatar"
import { Checkbox } from "@radix-ui/react-checkbox"
import { arrayMove } from "@dnd-kit/sortable"
const TaskList = ({ tasks }: { tasks: BasicTask[] }) => {
  const [features, setFeatures] = useState<BasicTask[]>([])

  useEffect(() => {
    if (!tasks) return
    setFeatures(tasks)
  }, [tasks])



  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    setFeatures((prev) => {
      const oldIndex = prev.findIndex((t) => t.taskId.toString() === active.id)
      const overTask = prev.find((t) => t.taskId.toString() === over.id)

      if (overTask) {
        const newIndex = prev.findIndex((t) => t.taskId.toString() === over.id)
        if (prev[oldIndex].status === overTask.status) {
          return arrayMove(prev, oldIndex, newIndex)
        } else {
          return prev.map((task) =>
            task.taskId.toString() === active.id
              ? { ...task, status: overTask.status }
              : task,
          )
        }
      } else {
        return prev.map((task) =>
          task.taskId.toString() === active.id
            ? { ...task, status: over.id as string }
            : task,
        )
      }
    })
  }


  const handleAction = (taskId: string, action: string) => {
    if (action === "edit") {
      console.log("Edit task", taskId)
    }
    if (action === "delete") {
      console.log("Delete task", taskId)
    }
    if (action.startsWith("status:")) {
      const newStatus = action.split(":")[1]
      setFeatures((prev) =>
        prev.map((feature) => (feature.taskId.toString() === taskId ? { ...feature, status: newStatus } : feature)),
      )
    }
  }

  return (
    <ListProvider onDragEnd={handleDragEnd}>
      {taskStatus.map((status) => (
        <ListGroup id={status.name} key={status.name}>
          <ListHeader color={status.color} name={status.name} />
          <ListItems className="p-0">
            {features
              .filter((f) => f.status === status.name)
              .map((feature, index) => (
                <ListItem
                  id={feature.taskId.toString()}
                  index={index}
                  key={feature.taskId}
                  name={feature.title}
                  parent={feature.status}
                  className="w-full p-1"
                >
                  <div key={feature.taskId} className="space-y-1 w-full">
                    <div
                      className={`flex items-center gap-2 p-1 bg-muted/50 rounded text-xs w-full ${getBorderColor(feature.status)}`}
                    >
                      <Checkbox
                        checked={true}
                        className={`h-4 w-4 appearance-none rounded ${getCheckboxColor(feature.status)}`}
                      />
                      <span className="flex-1 truncate">{feature.title}</span>
                      {feature.assignee && <ColoredAvatar name={feature.assignee} size="sm" />}
                    </div>
                  </div>
                </ListItem>
              ))}
          </ListItems>
        </ListGroup>
      ))}
    </ListProvider>
  )
}

export default TaskList
