import React, { createContext, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import axios from "../../config/axiosConfig"
import { Notification } from "@/utils/INotifications"
import { BasicTask } from "@/utils/ITask"

type NotificationContextType = {
    connection: signalR.HubConnection | null
    notifications: Notification[]
    connectNotificationSignalR: (token: string) => void
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
    // selectedTask: BasicTask | null
    selectedTask: number | null
    // setSelectedTask: React.Dispatch<React.SetStateAction<BasicTask | null>>
    setSelectedTask: React.Dispatch<React.SetStateAction<number | null>>
}

const NotificationContext = createContext<NotificationContextType>({
    connection: null,
    notifications: [],
    connectNotificationSignalR: (_token: string) => { },
    setNotifications: () => { },
    selectedTask: null,
    setSelectedTask: () => {}
})

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [selectedTask, setSelectedTask] = useState<number | null>(null)

    const connectNotificationSignalR = (token: string) => {
        const conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5144/hubs/notification", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build()

        setConnection(conn)
    }

    useEffect(() => {
        if (!connection) return

        connection.start().then(async () => {
            console.log("Connected to NotificationHub")

            const response = await axios.get(`/notifications`)
            setNotifications(response.data)
        }).catch(error => console.log(error))

        connection.on("NotifyTaskAssigned", (notification: Notification) => {
            setNotifications(prev => [notification, ...prev])
        })

        // connection.on("TaskAssigned", (basicTask: BasicTask) => {
        //     setSelectedTask(basicTask)
        // })

        return () => {
            connection?.stop()
        }
    }, [connection])
console.log(selectedTask)
    return (
        <NotificationContext.Provider value={{ connection, notifications, setNotifications, selectedTask, setSelectedTask, connectNotificationSignalR }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotification = () => useContext(NotificationContext)
