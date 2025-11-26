"use client"

import { useEffect, useState } from "react"
import {
    AlertCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    Sun,
    CalendarCheck
} from "lucide-react"
import { BasicTask } from "@/utils/ITask"
import TaskOverview from "./TaskOverview"
import axios from "@/config/axiosConfig"

const ITEMS_PER_PAGE = 6

export function UpcomingDeadline({ type }: { type: "deadline" | "today" }) {
    const [currentPage, setCurrentPage] = useState(1)
    const [tasks, setTasks] = useState<BasicTask[]>()

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`/tasks/upcoming/${type}`)
                setTasks(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchTasks()
    }, [type])

    const totalPages = tasks ? Math.ceil(tasks.length / ITEMS_PER_PAGE) : 0;

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTasks = tasks && tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (tasks?.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-3 rounded-full bg-muted p-3">
                    <Clock size={24} className="text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No urgent tasks</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    {"Great! You've completed the tasks scheduled to the limit."}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        {type === "deadline" ? (
                            <AlertCircle size={20} className="text-destructive" />
                        ) : (
                            <CalendarCheck size={20} className="text-blue-500" />
                        )}

                        {type === "deadline" && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        )}
                    </div>

                    <h2 className="text-sm font-bold uppercase tracking-tight text-foreground">
                        {type === "deadline" ? "Upcoming Deadlines" : "Tasks today"}
                        <span className="ml-1 text-muted-foreground font-normal">({tasks?.length})</span>
                    </h2>
                </div>

                {totalPages > 1 && (
                    <span className="text-xs text-muted-foreground">
                        Page {currentPage}/{totalPages}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {currentTasks?.map((task) => (
                    <TaskOverview key={task.taskId} task={task} type={type} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-border mt-4">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Previous Page"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`
                        w-7 h-7 flex items-center justify-center text-xs rounded-md transition-all
                        ${currentPage === page
                                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                                        : "text-muted-foreground hover:bg-muted"
                                    }
                    `}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Next Page"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    )
}
