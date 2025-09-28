import { createContext, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"

type PresenceContextType = {
    connection: signalR.HubConnection | null
    onlineUsers: string[]
    tokenStored: string
    connectSignalR: (token: string) => void
}

const PresenceContext = createContext<PresenceContextType>({
    connection: null,
    onlineUsers: [],
    tokenStored: "",
    connectSignalR: (_token: string) => { }
})

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
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

            connection.on("OnlineUsers", (users: string[]) => {
                setOnlineUsers(users)
            })

            connection.on("UserOnline", (userId: string) => {
                setOnlineUsers(prev => [...prev, userId])
            })

            connection.on("UserOffline", (userId: string) => {
                setOnlineUsers(prev => prev.filter(u => u !== userId))
            })
        })

        connection.on("OnlineUsers", (users) => {
            console.log(users)
            setOnlineUsers(users)
        })

        return () => {
            connection?.stop()
        }
    }, [connection])

    return (
        <PresenceContext.Provider value={{ connection, onlineUsers, tokenStored, connectSignalR }}>
            {children}
        </PresenceContext.Provider>
    )
}

export const usePresence = () => useContext(PresenceContext)
