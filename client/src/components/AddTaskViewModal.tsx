import React, { useState } from 'react'
import { Button } from './ui/button'
import { Plus, X } from 'lucide-react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import ColoredAvatar from './ColoredAvatar'
import axios from '@/config/axiosConfig'
import { Member } from '@/utils/IUser'
import { useParams } from 'next/navigation'
import { BasicTask, NewTaskView } from '@/utils/ITask'
import { formattedDate, setDefaultDeadline } from '@/utils/dateUtils'

export default function AddTaskViewModal({
  isModalOpen,
  members,
  currentDate,
  selectedDay,
  setIsModalOpen,
  setTasks
}: {
  isModalOpen: boolean
  members: Member[]
  currentDate: Date
  selectedDay: number
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  setTasks: React.Dispatch<React.SetStateAction<BasicTask[]>>
}) {
  const { project_name } = useParams()
  const [task, setTask] = useState<Partial<NewTaskView>>()

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTask({})
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const projectId = project_name
      const response = await axios.post(`/tasks/view/${projectId}`, task)

      setTasks((prev) => [...prev, response.data])
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const handleTask = (name: string, value: string) => {
    setTask(prev => ({
      ...prev, [name]: name === "Priority" ? Number(value) : value
    }))
  }
console.log(new Date().toISOString().slice(0,11))
  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">What needs to be done?</h2>
                <p className="text-sm text-muted-foreground">{formattedDate(selectedDay, currentDate)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseModal} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  placeholder="Enter task title..."
                  value={task?.Title}
                  onChange={(e) => handleTask("Title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Add task description..."
                  value={task?.Description}
                  name='Description'
                  onChange={(e) => handleTask('Description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date & Time</label>
                <Input
                  type="datetime-local"
                  value={task?.Deadline ?? setDefaultDeadline().toISOString ().slice(0,16)}
                  name='Deadline'
                  onChange={(e) => handleTask("Deadline", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignee</label>
                  <Select
                    value={task?.AssigneeId}
                    onValueChange={(value) => handleTask("AssigneeId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {members?.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          <div className="flex items-center gap-2">
                            <ColoredAvatar id={member.userId} name={member.name} size="sm" />
                            <span>{member.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={task?.Priority?.toString()}
                    onValueChange={(value) => handleTask("Priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">High</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer" disabled={false} onClick={(e) => handleCreateTask(e)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}