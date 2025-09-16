'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Calendar, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { capitalizeFirstLetter } from "@/utils/dataUtils"
import React from "react"
import { FilterSelection } from "@/utils/IFilterSelection"
import { Member } from "@/utils/IUser"
import { getRoleBadge } from "@/utils/statusUtils"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const statusOptions = ["all", "Todo", "In Progress", "Done", "Cancel", "Expired"]
const priorityOptions = ["all", "high", "medium", "low"]

export default function TaskFilterView({
  members,
  currentDate,
  setCurrentDate,
  filterSelection,
  setFilterSelection
}: {
  members: Member[]
  currentDate: Date
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
  filterSelection: FilterSelection
  setFilterSelection: React.Dispatch<React.SetStateAction<FilterSelection>>
}) {
  const updateFilter = (key: keyof FilterSelection, value: string) => {
    setFilterSelection((prev) => ({ ...prev, [key]: value }))
  }

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

  return (
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
          value={filterSelection.assignee ?? "all"}
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
          value={filterSelection.status ?? "all"}
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
          value={filterSelection.priority ?? 'all'}
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
  )
}
