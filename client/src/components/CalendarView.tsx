"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"

import ColoredAvatar from "@/components/ColoredAvatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDaysInMonth } from "@/utils/dateUtils"
import type { BasicTask } from "@/utils/ITask"
import TaskList from "./TaskList"
import { getBorderColor, getCheckboxColor } from "@/utils/statusUtils"
import axios from "@/config/axiosConfig"
import type { ParamValue } from "next/dist/server/request/params"
import type { FilterSelection } from "@/utils/IFilterSelection"
import type { Member } from "@/utils/IUser"
import TaskFilterView from "./TaskFilterView"
import { X, Plus } from "lucide-react"

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function CalendarView({
  projectId,
  currentDate,
  setCurrentDate,
}: {
  projectId: ParamValue
  currentDate: Date
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
}) {
  const [tasks, setTasks] = useState<BasicTask[]>([])
  const [filterSelection, setFilterSelection] = useState<FilterSelection>({})
  const days = getDaysInMonth(currentDate)
  const [openTaskList, setOpenTaskList] = useState(false)
  const filterRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [members, setMembers] = useState<Member[]>()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState("")
  const [taskPriority, setTaskPriority] = useState("medium")
  const [taskStatus, setTaskStatus] = useState("todo")

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`/projects/member/${projectId}`)
        setMembers(response.data)
      } catch (error) {
        console.log(error)
      }
    }

    fetchMembers()
  }, [projectId])

  useEffect(() => {
    if (filterRef.current) {
      clearTimeout(filterRef.current)
    }

    filterRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(`/tasks/${projectId}`, {
          params: {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            filters: JSON.stringify(filterSelection),
          },
        })

        setTasks(response.data)
      } catch (error) {
        console.error(error)
      }
    }, 500)

    return () => {
      if (filterRef.current) {
        clearTimeout(filterRef.current)
      }
    }
  }, [projectId, currentDate, filterSelection])

  const getTasksForDay = (day: number) => {
    return tasks?.filter((task) => {
      const createdDate = new Date(task.createdAt)
      return createdDate.getDate() === day
    })
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    setIsModalOpen(true)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!taskTitle.trim() || !selectedDay) return

    try {
      const taskData = {
        title: taskTitle,
        description: taskDescription,
        assignee: selectedAssignee,
        priority: taskPriority,
        status: taskStatus,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay),
        createdAt: new Date(),
      }

      const response = await axios.post(`/tasks/${projectId}`, taskData)
      setTasks((prev) => [...prev, response.data])

      // Reset form
      setTaskTitle("")
      setTaskDescription("")
      setSelectedAssignee("")
      setTaskPriority("medium")
      setTaskStatus("todo")

      setIsModalOpen(false)
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTaskTitle("")
    setTaskDescription("")
    setSelectedAssignee("")
    setTaskPriority("medium")
    setTaskStatus("todo")
  }

  const formattedDate = selectedDay
    ? new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div key={day} className="p-4 text-center font-medium text-muted-foreground bg-muted/50">
              {day}
            </div>
          ))}
        </div>

        <TaskFilterView
          members={members ?? []}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          filterSelection={filterSelection}
          setFilterSelection={setFilterSelection}
        />

        <div className="grid grid-cols-7">
          {days?.map((day, index) => {
            const tasksForDay = day ? getTasksForDay(day) : []
            const isToday = day === new Date().getDate()

            return (
              <div
                key={index}
                className="min-h-32 border-r border-b border-border p-3 bg-card hover:bg-muted transition-colors cursor-pointer"
                onClick={() => day && handleDayClick(day)}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium mb-2 text-start flex items-center justify-between">
                      <span className={`${isToday ? "bg-blue-500 text-white w-6 h-6 rounded px-2" : ""}`}>{day}</span>
                      <span>+</span>
                    </div>

                    <div className="space-y-2">
                      {tasksForDay && (
                        <>
                          {(tasksForDay?.length <= 2 ? tasksForDay : tasksForDay.slice(0, 1)).map((task) => (
                            <div key={task.taskId} className="space-y-1">
                              <div
                                className={` flex items-center gap-2 p-2 bg-muted/50 rounded text-xs ${getBorderColor(task.status)}`}
                              >
                                <Checkbox
                                  checked={true}
                                  className={`h-4 w-4 appearance-none ${getCheckboxColor(task.status)}`}
                                />
                                <span className="flex-1 truncate">{task.title}</span>
                                {task.assignee && <ColoredAvatar name={task.assignee} size="sm" />}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {tasksForDay.length > 2 && (
                        <div>
                          <div
                            className="text-xs text-muted-foreground hover:bg-muted hover:border hover:rounded cursor-pointer"
                            onClick={() => setOpenTaskList(!openTaskList)}
                          >
                            <p className="p-2">{!openTaskList ? `${tasksForDay.length - 1} more` : "Close"}</p>
                          </div>
                          {openTaskList && (
                            <div className="absolute z-50 mt-2 w-38 bg-card border rounded-lg shadow-lg">
                              <TaskList tasks={tasksForDay} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">What needs to be done?</h2>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseModal} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="p-4 space-y-4">
              {/* Task Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  placeholder="Enter task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              {/* Task Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Add task description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Assignee Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignee</label>
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee">
                      {selectedAssignee && (
                        <div className="flex items-center gap-2">
                          <ColoredAvatar name={selectedAssignee} size="sm" />
                          <span>{selectedAssignee}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem key={member.userId} value={member.name}>
                        <div className="flex items-center gap-2">
                          <ColoredAvatar name={member.name} size="sm" />
                          <span>{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={taskStatus} onValueChange={setTaskStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={!taskTitle.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
