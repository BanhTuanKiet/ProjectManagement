"use client"

import { createContext, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import type { BasicTask } from "../../utils/ITask"
import axios from "../../config/axiosConfig"
import { useParams } from "next/navigation"
import { usePresence } from "./OnlineMembers"

type TaskContextType = {
    connection: signalR.HubConnection | null
    tasks: BasicTask[]
    setTasks: React.Dispatch<React.SetStateAction<BasicTask[]>>
    currentDate: Date
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
}

const TaskContext = createContext<TaskContextType>({
    connection: null,
    tasks: [],
    setTasks: () => { },
    currentDate: new Date(),
    setCurrentDate: () => { },
})

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [tasks, setTasks] = useState<BasicTask[]>([])
    const [selectedTask, setSelectedTask] = useState<number | null>(null)
    const { project_name } = useParams<{ project_name: string }>()
    const [currentDate, setCurrentDate] = useState(new Date())
    const { tokenStored } = usePresence()

    useEffect(() => {
        if (!tokenStored) return

        const conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5144/hubs/task", {
                accessTokenFactory: () => tokenStored
            })
            .withAutomaticReconnect()
            .build()

        setConnection(conn)
    }, [tokenStored])

    useEffect(() => {
        if (!connection) return

        connection.start().then(async () => {
            console.log("Connected to TaskHub")

            await connection.invoke("JoinProjectGroup", Number(project_name))

            await fetchTasks()
        }).catch(error => console.log(error))

        connection.on("TaskUpdated", (updatedTask: BasicTask) => {
            console.log("TaskUpdated received:", updatedTask)
            setTasks(prevTasks => {
                const filtered = prevTasks.filter(t => t.taskId !== updatedTask.taskId);
                return [...filtered, updatedTask];
            });
        })

        return () => {
            connection.off("TaskUpdated")
            connection?.stop()
        }
    }, [connection])

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`/tasks/${project_name}`, {
                params: {
                    month: null,
                    year: null,
                    filters: null,
                },
            })

            setTasks(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <TaskContext.Provider value={{ connection, tasks, setTasks, currentDate, setCurrentDate }}>
            {children}
        </TaskContext.Provider>
    )
}

export const useTask = () => useContext(TaskContext)
