export const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
        days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day)
    }

    return days
}

export const formattedDate = (selectedDay: number, currentDate: Date) => {
    return selectedDay
        ? new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : ""
}

export const setDefaultDeadline = () => {
    const defaultDeadline = new Date()
    defaultDeadline.setHours(defaultDeadline.getHours() + 7);
    return defaultDeadline
}

export const formatSentTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
}

export function getDeadlineFromSelectedDay(selectedDay: number, currentDate: Date): Date {
    const baseDate = new Date(currentDate)
    baseDate.setDate(selectedDay)
    baseDate.setHours(16, 0, 0, 0)
    return baseDate
}

export const isTaskOverdue = (deadline: string | Date) => {
    if (!deadline) return false
    const now = new Date()
    const taskDeadline = new Date(deadline)
    return taskDeadline < now
}

export const getDeadlineStyle = (task: { dueDate?: string; status?: string }) => {
  if (!task.dueDate) {
    return { className: "text-gray-400", icon: null, container: "border border-gray-200" }
  }

  const due = new Date(task.dueDate) 
  const now = new Date()

  if (task.status === "Done") {
    return {
      className: "text-green-600 font-medium flex items-center gap-1",
      icon: "✅",
      container: "border border-green-300 bg-green-50 rounded px-2 py-0.5"
    }
  }

  if (due.getTime() < now.getTime()) {
    return {
      className: "text-red-600 font-semibold flex items-center gap-1",
      icon: "⚠️",
      container: "border border-red-500 bg-red-50 rounded px-2 py-0.5"
    }
  }

  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (diffHours <= 48) {
    return {
      className: "text-yellow-600 font-medium flex items-center gap-1",
      icon: "⚠️",
      container: "border border-yellow-400 bg-yellow-50 rounded px-2 py-0.5"
    }
  }

  return {
    className: "flex items-center gap-1",
    icon: null,
  }
}
