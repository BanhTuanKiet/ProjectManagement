import { useMemo } from "react"
import { differenceInDays } from "date-fns"
import { BasicTask } from "@/utils/ITask"

const parseLocalDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return new Date() // fallback ngày hiện tại
    const [y, m, d] = dateStr.split("T")[0].split("-")
    return new Date(Number(y), Number(m) - 1, Number(d))
}

const useTimelineDates = (tasks: BasicTask[]) => {
    return useMemo(() => {
        if (!tasks || tasks.length === 0) return { startDate: new Date(), endDate: new Date(), totalDays: 7 }

        const allDates = tasks.flatMap((t) => [
            parseLocalDate(t.createdAt),
            parseLocalDate(t.deadline)
        ])

        const startDate = new Date(Math.min(...allDates.map((d) => d.getTime())))
        const endDate = new Date(Math.max(...allDates.map((d) => d.getTime())))
        const days = differenceInDays(endDate, startDate) + 1

        return {
            startDate,
            endDate,
            totalDays: Math.max(days, 7)
        }
    }, [tasks])
}

export default useTimelineDates