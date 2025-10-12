"use client"

import { createContext, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import { useUser } from "./UserContext"

type OnlineUser = {
    userId: string
    projects: string[] 
}

type PresenceContextType = {
    connection: signalR.HubConnection | null
    onlineUsers: Record<string, OnlineUser>
}

const PresenceContext = createContext<PresenceContextType>({
    connection: null,
    onlineUsers: {},
})

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({})
    const { user } = useUser()

    useEffect(() => {
        if (!user?.token) return

        try {
            const connectSignalR = () => {
                const conn = new signalR.HubConnectionBuilder()
                    .withUrl("http://localhost:5144/hubs/presence", {
                        accessTokenFactory: () => user.token
                    })
                    .withAutomaticReconnect()
                    .build()

                setConnection(conn)
            }

            connectSignalR()
        } catch (error) {
            console.log(error)
        }
    })

    useEffect(() => {
        if (!connection) return

        connection.start().then(() => {
            console.log("Connected to PresenceHub")

            connection.on("OnlineUsers", (users: OnlineUser[]) => {
                const map: Record<string, OnlineUser> = {}
                users.forEach(u => { map[u.userId] = u })
                setOnlineUsers(map)
            })

            connection.on("UserOnline", (user: OnlineUser) => {
                setOnlineUsers(prev => ({
                    ...prev,
                    [user.userId]: user
                }))
            })

            connection.on("UserOffline", (userId: string) => {
                setOnlineUsers(prev => {
                    const newMap = { ...prev }
                    delete newMap[userId]
                    return newMap
                })
            })
        })

        return () => {
            connection?.stop()
        }
    }, [connection])

    return (
        <PresenceContext.Provider value={{ connection, onlineUsers }}>
            {children}
        </PresenceContext.Provider>
    )
}

export const usePresence = () => useContext(PresenceContext)