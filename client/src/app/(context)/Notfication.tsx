"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import { Notification, NotificationGroups } from "@/utils/INotifications"
import { useUser } from "./UserContext"

type NotificationContextType = {
    connection: signalR.HubConnection | null
    notifications: NotificationGroups
    setNotifications: React.Dispatch<React.SetStateAction<NotificationGroups>>
    setData: (data: Notification[], type: string) => void
}

const NotificationContext = createContext<NotificationContextType>({
    connection: null,
    notifications: {
        task: [],
        mention: [],
        project: [],
        system: [],
        workedOn: [],
    },
    setNotifications: () => { },
    setData: () => { }
})

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [notifications, setNotifications] = useState<NotificationGroups>({
        task: [],
        mention: [],
        project: [],
        system: [],
        workedOn: [],
    })
    const { user } = useUser()

    useEffect(() => {
        if (!user) return

        const conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5144/hubs/notification", {
                accessTokenFactory: () => user.token,
            })
            .withAutomaticReconnect()
            .build()

        setConnection(conn)
    }, [user])

    useEffect(() => {
        if (!connection) return

        connection
            .start()
            .then(async () => {
                console.log("✅ Connected to NotificationHub")
            })
            .catch(error => console.log("❌ SignalR connection failed", error))

        connection.on("NotifyTaskAssigned", (notification: Notification) => {
            console.log(notification)
            setNotifications(prev => ({
                ...prev,
                task: [notification, ...prev.task],
            }))
        })

        connection.on("NotifyTaskChanged", (notification: Notification) => {
            setNotifications(prev => ({
                ...prev,
                task: [notification, ...prev.task]
            }))
        })

        connection.on("NotifyProject", (notification: Notification) => {
            setNotifications(prev => ({
                ...prev,
                project: [notification, ...prev.project],
            }))
        })

        connection.on("NotifyMention", (notification: Notification) => {
            setNotifications(prev => ({
                ...prev,
                mention: [notification, ...prev.mention],
            }))
        })

        connection.on("NotifySystem", (notification: Notification) => {
            setNotifications(prev => ({
                ...prev,
                system: [notification, ...prev.system],
            }))
        })

        return () => {
            connection.stop()
        }
    }, [connection])

    const setData = (data: Notification[], type: string) => {
        setNotifications(prev => ({
            ...prev, [type]: data
        }))
    }

    return (
        <NotificationContext.Provider
            value={{ connection, notifications, setNotifications, setData }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotification = () => useContext(NotificationContext)
