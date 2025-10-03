import { createContext, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import type { BasicTask } from "../../utils/ITask"
import axios from "../../config/axiosConfig"

type TaskContextType = {
    connection: signalR.HubConnection | null
    tasks: BasicTask[]
    setTasks: React.Dispatch<React.SetStateAction<BasicTask[]>>
    connectTaskSignalR: (token: string) => void
}

const TaskContext = createContext<TaskContextType>({
    connection: null,
    tasks: [],
    setTasks: () => { },
    connectTaskSignalR: (_token: string) => { }
})

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [tasks, setTasks] = useState<BasicTask[]>([])
    const [selectedTask, setSelectedTask] = useState<number | null>(null)

    const connectTaskSignalR = (token: string) => {
        const conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5144/hubs/task", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build()

        setConnection(conn)
    }

    useEffect(() => {
        if (!connection) return

        connection.start().then(async () => {
            console.log("Connected to TaskHub")

            // const response = await axios.get(`/notifications/${7}`)
            // setTasks(response.data)
        }).catch(error => console.log(error))

        return () => {
            connection?.stop()
        }
    }, [connection])

    return (
        <TaskContext.Provider value={{ connection, tasks, setTasks, connectTaskSignalR }}>
            {children}
        </TaskContext.Provider>
    )
}

export const useTask = () => useContext(TaskContext)
