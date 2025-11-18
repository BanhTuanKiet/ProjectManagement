"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { getDaysInMonth } from "@/utils/dateUtils"
import type { BasicTask } from "@/utils/ITask"
import { TaskList } from "../TaskList"
import TaskFilterView from "../TaskFilterView"
import AddTaskModal from "../AddTaskModal"
import TaskDetailModal from "../TaskDetail/TaskDetailModal";
import TaskCard from "../TaskCard"
import { useTask } from "@/app/(context)/TaskContext"
import { useProject } from "@/app/(context)/ProjectContext"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Grid3X3 } from "lucide-react"

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export default function CalendarView() {
    const [mockTasks, setMockTasks] = useState<BasicTask[]>([])
    const { tasks, currentDate, setCurrentDate } = useTask()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const [selectedTask, setSelectedTask] = useState<number | null>(null)
    const { members } = useProject()
    const [days, setDays] = useState<(number | null)[] | undefined>()
    const [openDay, setOpenDay] = useState<number | null>(null)

    useEffect(() => {
        setDays(getDaysInMonth(currentDate))
        console.log("Length: ", tasks.length)
        if (Array.isArray(tasks)) {
            setMockTasks([...tasks])
        } else {
            setMockTasks([])
        }
    }, [tasks, currentDate])

    const navigateMonth = (direction: "prev" | "next") => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev)
            if (direction === "prev") {
                newDate.setMonth(prev.getMonth() - 1)
            } else {
                newDate.setMonth(prev.getMonth() + 1)
            }
            return newDate
        })
    }

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
            <div className="flex items-center justify-between mb-6 gap-4">
                <TaskFilterView
                    tasks={tasks || []}    
                    onFilterComplete={setMockTasks} 
                />
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-medium min-w-24 text-center">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                            <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

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

                <div id="CalendarDays" className="grid grid-cols-7">
                    {days?.map((day, index) => {
                        const tasksForDay = day ? getTasksForDay(day) : []
                        const isToday = day === new Date().getDate()

                        return (
                            <div
                                key={index}
                                className="relative min-h-32 border-r border-b border-border p-2 bg-card"
                            >
                                {day && (
                                    <>
                                        <div className="text-sm font-medium mb-2 text-start flex items-center justify-between">
                                            <span
                                                className={`w-6 h-6 flex items-center justify-center ${isToday ? "bg-blue-500 text-white rounded" : ""}`}
                                            >
                                                {day}
                                            </span>
                                            <span id="AddTaskButton"
                                                className="px-1 hover:bg-gray-200 hover:rounded transition-colors cursor-pointer"
                                                onClick={() => {
                                                    handleDayClick(day)
                                                }}
                                            >
                                                +
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {(tasksForDay?.length < 2
                                                ? tasksForDay
                                                : tasksForDay.slice(0, 1)
                                            ).map(task => (
                                                <TaskCard
                                                    key={task.taskId}
                                                    task={task}
                                                    setSelectedTask={setSelectedTask}
                                                />
                                            ))}

                                            {tasksForDay.length > 1 && (
                                                <div>
                                                    <div
                                                        className="text-xs text-muted-foreground hover:bg-muted hover:border hover:rounded cursor-pointer"
                                                        onClick={() =>
                                                            setOpenDay(openDay === day ? null : day)
                                                        }
                                                    >
                                                        <p className="p-2">
                                                            {openDay === day
                                                                ? "Close"
                                                                : `${tasksForDay.length - 1} more`}
                                                        </p>
                                                    </div>

                                                    {openDay === day && (
                                                        <div className="absolute z-50 mt-2 w-40 bg-card border rounded-lg shadow-lg">
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
                <AddTaskModal
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
                    // projectId={project_name ? Number(project_name) : 0}
                    taskId={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    )
}
