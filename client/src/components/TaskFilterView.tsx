'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react"
import { getPriorityBadge, getRoleBadge, getTaskStatusBadge, getPriorityIcon, taskStatus } from "@/utils/statusUtils"
import ColoredAvatar from "./ColoredAvatar"
import { capitalizeFirstLetter } from "@/utils/stringUitls"
import type { BasicTask } from "@/utils/ITask"
import { useProject } from "@/app/(context)/ProjectContext"

const priorities = [
    { name: "All", value: 0 },
    { name: "High", value: 1 },
    { name: "Medium", value: 2 },
    { name: "Low", value: 3 },
]

interface TaskFilterViewProps {
    tasks: BasicTask[];
    onFilterComplete: (filteredTasks: BasicTask[]) => void;
}

export default function TaskFilterView({ tasks, onFilterComplete }: TaskFilterViewProps) {
    const [filters, setFilters] = useState({
        search: "",
        assignee: "all",
        status: "all",
        priority: "0"
    })
    const { members } = useProject()

    useEffect(() => {
        if (!tasks) {
            onFilterComplete([]);
            return;
        }

        const isEmptyFilter =
            (!filters.search || filters.search.trim() === "") &&
            (!filters.assignee || filters.assignee === "all") &&
            (!filters.status || filters.status === "all") &&
            (!filters.priority || filters.priority === "0")

        if (isEmptyFilter) {
            onFilterComplete(tasks)
            return
        }

        let filtered = [...tasks]

        if (filters.assignee && filters.assignee !== "all")
            filtered = filtered.filter(task => task.assigneeId === filters.assignee)

        if (filters.status && filters.status !== "all")
            filtered = filtered.filter(task => task.status === filters.status)

        if (filters.priority && filters.priority !== "0")
            filtered = filtered.filter(task => task.priority === Number(filters.priority))

        if (filters.search && filters.search.trim() !== "")
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(filters.search.toLowerCase())
            )

        onFilterComplete(filtered)
    }, [filters, tasks, onFilterComplete])


    const handleFilter = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            search: "",
            assignee: "all",
            status: "all",
            priority: "0"
        })
    }

    const currentPriorityName = priorities.find(p => String(p.value) === filters.priority)?.name || "Priority"

    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => handleFilter("search", e.target.value)}
                    className="pl-10 w-64"
                />
            </div>

            <Select
                value={filters.assignee}
                onValueChange={(val) => handleFilter("assignee", val)}
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {members?.map(member => (
                        <SelectItem key={member.userId} value={member.userId}>
                            <div className="flex items-center gap-2">
                                <ColoredAvatar id={member.userId} name={member.name} />
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

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 w-40 justify-start">
                        {filters.status && filters.status !== 'all' ? (
                            <span className={`flex items-center gap-2 ${getTaskStatusBadge(filters.status)}`}>
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                        backgroundColor: taskStatus.find((s) => s.name === filters.status)?.color,
                                    }}
                                />
                                {filters.status}
                            </span>
                        ) : (
                            "Status"
                        )}
                        <ChevronDown className="h-4 w-4 ml-auto" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44">
                    <DropdownMenuItem onSelect={() => handleFilter("status", "all")}>All</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {taskStatus.map((status) => (
                        <DropdownMenuItem
                            key={status.id}
                            onSelect={() => handleFilter("status", status.name)}
                        >
                            <div className={`flex items-center gap-2 ${getTaskStatusBadge(status.name)}`}>
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
                                <span>{status.name}</span>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 w-40 justify-start">
                        {filters.priority && filters.priority !== '0' ? (
                            <div className="flex items-center gap-2">
                                {getPriorityIcon(currentPriorityName)}
                                <span className={getPriorityBadge(currentPriorityName.toLowerCase())}>{currentPriorityName}</span>
                            </div>
                        ) : (
                            "Priority"
                        )}
                        <ChevronDown className="h-4 w-4 ml-auto" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44">
                    {priorities.map((priority) => (
                        <DropdownMenuItem
                            key={priority.value}
                            onSelect={() => handleFilter("priority", String(priority.value))}
                        >
                            <div className="flex items-center gap-2">
                                {/* {getPriorityIcon(priority.name)} */}
                                <span className={getPriorityBadge(priority.name.toLowerCase())}>{priority.name}</span>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-red-500"
            >
                Clear Filters
            </Button>
        </div>
    )
}