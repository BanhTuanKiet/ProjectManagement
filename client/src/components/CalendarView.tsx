"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { getDaysInMonth } from "@/utils/dateUtils"
import type { BasicTask } from "@/utils/ITask"
import TaskList from "./TaskList"
import TaskFilterView from "./TaskFilterView"
import AddTaskViewModal from "./AddTaskViewModal"
import { useNotification } from "@/app/(context)/Notfication"
import TaskDetailModal from "./TaskDetailModal"
import { useParams } from "next/navigation"
import TaskCalendar from "./TaskCalendar"
import { useTask } from "@/app/(context)/TaskContext"
import { useProject } from "@/app/(context)/ProjectContext"

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function CalendarView() {
    const [mockTasks, setMockTasks] = useState<BasicTask[]>([])
    const { tasks, currentDate } = useTask()
    const [openTaskList, setOpenTaskList] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const { selectedTask, setSelectedTask } = useNotification()
    const { project_name } = useParams<{ project_name: string }>()
    const { members } = useProject()
    const [days, setDays] = useState<(number | null)[] | undefined>()

    useEffect(() => {
        if (tasks && tasks.length > 0) {
            setMockTasks([...tasks])
            setDays(getDaysInMonth(currentDate))
        }
    }, [tasks, currentDate])

    const getTasksForDay = (day: number) => {
        return mockTasks?.filter(task => {
            const date = new Date(task.deadline)
            return (
                date.getMonth() === currentDate.getMonth() &&
                date.getFullYear() === currentDate.getFullYear() &&
                date.getDate() === day
            )
        })
    }

    const handleDayClick = (day: number) => {
        setSelectedDay(day)
        setIsModalOpen(true)
    }

    return (
        <div className="p-6 bg-background min-h-screen bg-dynamic">
            <TaskFilterView setMockTasks={setMockTasks} />

            <div className="border border-border rounded-lg overflow-hidden bg-card bg-dynamic">
                <div className="grid grid-cols-7 border-b border-border">
                    {weekDays.map(day => (
                        <div
                            key={day}
                            className="p-1 text-center font-medium text-muted-foreground bg-muted/50"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {days?.map((day, index) => {
                        const tasksForDay = day ? getTasksForDay(day) : []
                        const isToday = day === new Date().getDate()

                        return (
                            <div
                                key={index}
                                className="min-h-32 border-r border-b border-border p-3 bg-card"
                            >
                                {day && (
                                    <>
                                        <div className="text-sm font-medium mb-2 text-start flex items-center justify-between">
                                            <span
                                                className={`w-6 h-6 ${
                                                    isToday
                                                        ? "bg-blue-500 text-white rounded flex items-center justify-center"
                                                        : ""
                                                }`}
                                            >
                                                {day}
                                            </span>
                                            <span
                                                className="px-1 hover:bg-gray-200 hover:rounded transition-colors cursor-pointer"
                                                onClick={() => handleDayClick(day)}
                                            >
                                                +
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {(tasksForDay?.length <= 2
                                                ? tasksForDay
                                                : tasksForDay.slice(0, 1)
                                            ).map(task => (
                                                <TaskCalendar
                                                    key={task.taskId}
                                                    task={task}
                                                    setSelectedTask={setSelectedTask}
                                                />
                                            ))}

                                            {tasksForDay.length > 2 && (
                                                <div>
                                                    <div
                                                        className="text-xs text-muted-foreground hover:bg-muted hover:border hover:rounded cursor-pointer"
                                                        onClick={() =>
                                                            setOpenTaskList(!openTaskList)
                                                        }
                                                    >
                                                        <p className="p-2">
                                                            {!openTaskList
                                                                ? `${tasksForDay.length - 1} more`
                                                                : "Close"}
                                                        </p>
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
                <AddTaskViewModal
                    isModalOpen={isModalOpen}
                    members={members ?? []}
                    currentDate={currentDate}
                    selectedDay={selectedDay ?? currentDate.getDay()}
                    setIsModalOpen={setIsModalOpen}
                    setTasks={setMockTasks}
                />
            )}

            {selectedTask && (
                <TaskDetailModal
                    projectId={parseInt(project_name)}
                    taskId={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    )
}