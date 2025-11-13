import React from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { getDeadlineStyle } from "@/utils/dateUtils";
import { format } from "date-fns"


function DueDateCell({ task, handleCellEdit }: { task: any; handleCellEdit: Function }) {
    const style = getDeadlineStyle(task)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
        task.dueDate ? new Date(task.dueDate) : undefined
    )
    const [time, setTime] = React.useState(
        task.dueDate ? new Date(task.dueDate).toISOString().substring(11, 16) : "12:00"
    )
    const [open, setOpen] = React.useState(false)

    const handleSave = () => {
        if (!selectedDate) return
        const [hours, minutes] = time.split(":").map(Number)
        const finalDate = new Date(selectedDate)
        finalDate.setHours(hours, minutes, 0, 0)

        handleCellEdit(task.id, "dueDate", finalDate.toISOString())
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div id="EditList" className={`${style.container} inline-flex items-center cursor-pointer`}>
                    {style.icon && <span>{style.icon}</span>}
                    <span className={style.className}>
                        {task.dueDate
                            ? format(new Date(task.dueDate), "MMM dd, yyyy HH:mm")
                            : "Set date"}
                    </span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-3 space-y-3">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                />
                <div className="flex justify-end">
                    <Button size="sm" onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default DueDateCell
