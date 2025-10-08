'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Calendar, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react"
import { Member } from "@/utils/IUser"
import { getPriorityBadge, getRoleBadge, getTaskStatusBadge } from "@/utils/statusUtils"
import ColoredAvatar from "./ColoredAvatar"
import { capitalizeFirstLetter } from "@/utils/stringUitls"
import { BasicTask } from "@/utils/ITask"
import { useTask } from "@/app/.context/Task"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const statusOptions = ["all", "Todo", "In Progress", "Done", "Cancel", "Expired"]
const priorityOptions = {
    all: 0,
    high: 1,
    medium: 2,
    low: 3,
}

export default function TaskFilterView({
    members,
    currentDate,
    setCurrentDate,
    setMockTasks
}: {
    members: Member[]
    currentDate: Date
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
    setMockTasks: React.Dispatch<React.SetStateAction<BasicTask[]>>
}) {
    const [filters, setFilters] = useState({
        search: "",
        assignee: "",
        status: "",
        priority: ""
    })
    const { tasks } = useTask()

    useEffect(() => {
        console.log("🔍 Filtering mockTasks with:", filters)

        const isEmptyFilter =
            (!filters.search || filters.search.trim() === "") &&
            (!filters.assignee || filters.assignee === "all" || filters.assignee === "") &&
            (!filters.status || filters.status === "all" || filters.status === "") &&
            (!filters.priority || filters.priority === "all" || filters.priority === "")

        if (isEmptyFilter) {
            setMockTasks(tasks)
            return
        }

        let filtered = [...tasks]

        if (filters.assignee && filters.assignee !== "all")
            filtered = filtered.filter(task => task.assigneeId === filters.assignee)

        if (filters.status && filters.status !== "all")
            filtered = filtered.filter(task => task.status === filters.status)

        if (filters.priority && filters.priority !== "all")
            filtered = filtered.filter(task => task.priority === Number(filters.priority))

        if (filters.search && filters.search.trim() !== "")
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(filters.search.toLowerCase())
            )

        setMockTasks(filtered)
    }, [filters, tasks])

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

    const handleFilter = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    return (
        <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search calendar"
                        value={filters?.search || ""}
                        onChange={(e) => handleFilter("search", e.target.value)}
                        className="pl-10 w-64"
                    />
                </div>

                <Select
                value={filters.assignee ?? "all"}
                onValueChange={(val) => handleFilter("assignee", val)}
                >
                    <SelectTrigger className="w-28">
                        <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem key={"all"} value="all">
                            All
                        </SelectItem>
                        {members && members?.map(member => (
                            <SelectItem key={member.userId} value={member.userId}>
                                <ColoredAvatar id={member.userId} name={member.name} />
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
                  value={filters.status ?? "all"}
                  onValueChange={(val) => handleFilter("status", val)}
                >
                    <SelectTrigger className="w-28">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                                <span className={`${getTaskStatusBadge(opt)}`}>
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                  value={filters.priority ?? '0'}
                  onValueChange={(val) => handleFilter("priority", val)}
                >
                    <SelectTrigger className="w-28">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(priorityOptions).map(([key, value], i) => (
                            <SelectItem key={i} value={String(value)}>
                                <span className={getPriorityBadge(key)}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </span>
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
    )
}