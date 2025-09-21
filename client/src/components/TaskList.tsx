"use client"
import type { DragEndEvent } from "@/components/ui/shadcn-io/list"
import { ListGroup, ListHeader, ListItem, ListItems, ListProvider } from "@/components/ui/shadcn-io/list"
import { useEffect, useState } from "react"
import type { BasicTask } from "@/utils/ITask"
import { getBorderColor, getCheckboxColor, taskStatus } from "@/utils/statusUtils"
import ColoredAvatar from "./ColoredAvatar"
import { Checkbox } from "@radix-ui/react-checkbox"
import { arrayMove } from "@dnd-kit/sortable"
import axios from "@/config/axiosConfig"
import { useParams } from "next/navigation"

const TaskList = ({ tasks }: { tasks: BasicTask[] }) => {
    const { project_name } = useParams()
    const [features, setFeatures] = useState<BasicTask[]>([])

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
            const currentTask = prev.find(f => f.taskId === overTask?.taskId)
            
            if (overTask?.taskId === currentTask?.taskId) return prev
            
            if (overTask) {
                const newIndex = prev.findIndex((t) => t.taskId.toString() === over.id)
                if (prev[oldIndex].status === overTask.status) {
                    return arrayMove(prev, oldIndex, newIndex)
                } else {
                    newStatus = overTask.status
                    return prev.map((task) =>
                        task.taskId.toString() === active.id
                            ? { ...task, status: overTask.status }
                            : task,
                    )
                }
            } else {
                newStatus = over.id as string
                return prev.map((task) =>
                    task.taskId.toString() === active.id
                        ? { ...task, status: newStatus }
                        : task,
                )
            }
        })

        if (newStatus === "") return
        // gọi API sau khi setFeatures xong
        if (newStatus) {
            await updateTask(activeTaskId, newStatus)
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
