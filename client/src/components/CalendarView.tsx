
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ColoredAvatar from "@/components/ColoredAvatar";
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Calendar, Grid3X3 } from "lucide-react"
import { getDaysInMonth } from "@/utils/dateUtils"
import { BasicTask } from "@/utils/ITask"
import TaskList from "./TaskList"
import { getBorderColor, getCheckboxColor, getRoleBadge } from "@/utils/statusUtils"
import axios from "@/config/axiosConfig"
import { ParamValue } from "next/dist/server/request/params"
import { FilterSelection } from "@/utils/IFilterSelection"
import { Member } from "@/utils/IUser"
import { capitalizeFirstLetter } from "@/utils/dataUtils"

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function CalendarView({
  projectId,
  currentDate,
  setCurrentDate
}: {
  projectId: ParamValue,
  currentDate: Date,
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
}) {
  const [tasks, setTasks] = useState<BasicTask[]>([])
  const [filterSelection, setFilterSelection] = useState<FilterSelection>({})
  const days = getDaysInMonth(currentDate)
  const [openTaskList, setOpenTaskList] = useState(false)
  const filterRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [members, setMembers] = useState<Member[]>()

  const statusOptions = ["all", "Todo", "In Progress", "Done", "Cancel", "Expired"]
  const priorityOptions = ["all", "high", "medium", "low"]

  const updateFilter = (key: keyof FilterSelection, value: string) => {
    setFilterSelection((prev) => ({ ...prev, [key]: value }))
  }

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

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTasksForDay = (day: number) => {
    return tasks?.filter((task) => {
      const createdDate = new Date(task.createdAt);
      return createdDate.getDate() === day;
    });
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search calendar"
              value={filterSelection?.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select
            value={filterSelection.assignee}
            onValueChange={(val) => updateFilter("assignee", val)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={"all"} value="all">
                All
              </SelectItem>
              {members && members?.map(member => (
                <SelectItem key={member.userId} value={member.userId}>
                  <div className="flex items-center gap-2">
                    <span>{capitalizeFirstLetter(member.name)}</span>
                    {member.role && (
                      <span className={getRoleBadge(member.role)}>
                        {member.role}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterSelection.status}
            onValueChange={(val) => updateFilter("status", val)}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterSelection.priority}
            onValueChange={(val) => updateFilter("priority", val)}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-24 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("next")}
            >
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

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-4 text-center font-medium text-muted-foreground bg-muted/50"
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
                className="min-h-32 border-r border-b border-border p-3 bg-card hover:bg-muted/20 transition-colors"
              >
                {day && (
                  <>
                    <div className="text-sm font-medium mb-2 text-start flex items-center justify-between">
                      <span className={`${isToday ? "bg-blue-500 text-white w-6 h-6 rounded px-2" : ""}`}>
                        {day}
                      </span>
                      <span>+</span>
                    </div>

                    <div className="space-y-2">
                      {tasksForDay.length > 0 && (
                        <>
                          <div
                            key={tasksForDay[0].taskId}
                            className="space-y-1"
                          >
                            <div
                              className={`
                                flex items-center gap-2 p-2 bg-muted/50 rounded text-xs
                                ${getBorderColor(tasksForDay[0].status)}
                              `}
                            >
                              <Checkbox
                                checked={true}
                                className={`h-4 w-4 appearance-none ${getCheckboxColor(
                                  tasksForDay[0].status
                                )}`}
                              />
                              <span className="flex-1 truncate">
                                {tasksForDay[0].title}
                              </span>
                              {tasksForDay[0].assignee && (
                                <ColoredAvatar
                                  name={tasksForDay[0].assignee}
                                  size="sm"
                                />
                              )}
                            </div>
                          </div>

                          {tasksForDay.length > 1 && (
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
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
