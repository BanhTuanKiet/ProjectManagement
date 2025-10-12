"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import axios from "../../config/axiosConfig"
import { Notification } from "@/utils/INotifications"
import { useUser } from "./UserContext"

type NotificationContextType = {
    connection: signalR.HubConnection | null
    notifications: Notification[]
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
    selectedTask: number | null
    setSelectedTask: React.Dispatch<React.SetStateAction<number | null>>
}

const NotificationContext = createContext<NotificationContextType>({
    connection: null,
    notifications: [],
    setNotifications: () => { },
    selectedTask: null,
    setSelectedTask: () => { }
})

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [selectedTask, setSelectedTask] = useState<number | null>(null)
    const { user } = useUser()

    useEffect(() => {
        if (!user?.token) return

        try {
            const connectNotificationSignalR = () => {
                const conn = new signalR.HubConnectionBuilder()
                    .withUrl("http://localhost:5144/hubs/notification", {
                        accessTokenFactory: () => user?.token
                    })
                    .withAutomaticReconnect()
                    .build()

                setConnection(conn)
            }

            connectNotificationSignalR()
        } catch (error) {
            console.log(error)
        }
    })

    useEffect(() => {
        if (!connection) return

        connection.start().then(async () => {
            console.log("Connected to NotificationHub")

            const response = await axios.get(`/notifications/${7}`)
            setNotifications(response.data)
        }).catch(error => console.log(error))

        connection.on("NotifyTaskAssigned", (notification: Notification) => {
            setNotifications(prev => [notification, ...prev])
        })

        return () => {
            connection?.stop()
        }
    }, [connection])

    return (
        <NotificationContext.Provider value={{ connection, notifications, setNotifications, selectedTask, setSelectedTask }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotification = () => useContext(NotificationContext)
