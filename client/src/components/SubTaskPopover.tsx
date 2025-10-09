"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Plus } from "lucide-react"
import axios from "axios"
import type { Task } from "@/utils/mapperUtil"
import { mapApiTaskToTask } from "@/utils/mapperUtil"

export function SubtaskPopover({ taskId, handleCellEdit, tasks }: {
    taskId: string
    handleCellEdit: (taskId: string, field: string, value: any) => void
    tasks: Task[]
}) {
    const [open, setOpen] = useState(false)
    const [newSubSummary, setNewSubSummary] = useState("")

    const handleCreateSubtask = async () => {
        if (!newSubSummary.trim()) return
        try {
            const res = await axios.post(`/tasks/${taskId}/subtasks`, {
                summary: newSubSummary,
                parentId: taskId,
                status: "To Do",
            })

            const created = mapApiTaskToTask(res.data)

            handleCellEdit(
                taskId,
                "subtasks",
                [...(tasks.find((t) => t.id.toString() === taskId)?.subtasks || []), created]
            )

            setNewSubSummary("")
            setOpen(false) // đóng popover sau khi tạo
        } catch (err) {
            console.error("Error creating subtask", err)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter subtask summary..."
                        value={newSubSummary}
                        onChange={(e) => setNewSubSummary(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateSubtask()
                        }}
                        autoFocus
                        className="flex-1"
                    />
                    <Button size="sm" onClick={handleCreateSubtask}>
                        Create
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
