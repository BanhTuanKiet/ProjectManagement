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
