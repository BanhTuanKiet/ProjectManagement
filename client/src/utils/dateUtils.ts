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
