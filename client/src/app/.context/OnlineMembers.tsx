import { createContext, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"

type OnlineUser = {
    userId: string
    projects: string[]   // danh sách project mà user này đang tham gia
}

type PresenceContextType = {
    connection: signalR.HubConnection | null
    onlineUsers: Record<string, OnlineUser>
    tokenStored: string
    connectSignalR: (token: string) => void
}

const PresenceContext = createContext<PresenceContextType>({
    connection: null,
    onlineUsers: {},
    tokenStored: "",
    connectSignalR: (_token: string) => { }
})

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({})
    const [tokenStored, setTokenStored] = useState<string>("")

    const connectSignalR = (token: string) => {
        const conn = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5144/hubs/presence", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build()

        setConnection(conn)
        setTokenStored(token)
    }

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


    console.log(onlineUsers)
    return (
        <PresenceContext.Provider value={{ connection, onlineUsers, tokenStored, connectSignalR }}>
            {children}
        </PresenceContext.Provider>
    )
}

export const usePresence = () => useContext(PresenceContext)