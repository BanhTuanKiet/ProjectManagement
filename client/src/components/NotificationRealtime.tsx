"use client"

import type React from "react"
import { Button } from "./ui/button"
import { Bell } from "lucide-react"
import type { Notification } from "@/utils/INotifications"
import ColoredAvatar from "./ColoredAvatar"
import { formatSentTime } from "@/utils/dateUtils"
import { useRef } from "react"
import axios from "@/config/axiosConfig"
import { useParams, useRouter } from "next/navigation"
import { useNotification } from "@/app/.context/Notfication"

export default function NotificationRealtime({
    notifications,
    unreadCount,
    setNotifications,
}: {
    notifications: Notification[]
    unreadCount: number
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
}) {
    const { proejct_name } = useParams()
    const notificationsRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { setSelectedTask } = useNotification()
    const router = useRouter()

    const markAsRead = (notification: Notification) => {
        if (notificationsRef.current) clearTimeout(notificationsRef.current)

        notificationsRef.current = setTimeout(async () => {
            try {
                const response = await axios.put(`/notifications/read/${notification.notificationId}`)
                setNotifications((prev) => prev.map((notif) => (notif.notificationId === notification.notificationId ? { ...notif, isRead: true } : notif)))
                console.log(response.data)
                if (typeof response.data === "string" && response.data.startsWith("/tasks/")) {
                    const taskId = parseInt(response.data.split("/")[2])
                    if (!isNaN(taskId)) {
                        setSelectedTask(taskId)
                    }
                    console.log(taskId)
                }
                
                router.push(`/project/${notification.projectId}`)
            } catch (error) {
                console.log(error)
            }
        }, 500)
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    }

    return (
        <>
            <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-gray-700" />
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-xs font-medium px-3 py-1 h-auto rounded-full"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No notifications yet</p>
                            <p className="text-gray-400 text-sm mt-1">Well notify you when something happens</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.notificationId}
                                className={`
                                    relative p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors duration-200 
                                    ${!notification.isRead ? "bg-blue-50/50" : ""}
                                `}
                                onClick={() => markAsRead(notification)}
                            >
                                {!notification.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}

                                <div className="flex items-start gap-3">
                                    <div className="relative flex-shrink-0">
                                        <ColoredAvatar id={"50792e5f-96fb-41ac-868c-ac81c0fad2ce"} name="BanhTuanKiet" />
                                        {/* <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-gray-200 flex items-center justify-center">
                                            {getNotificationIcon(notification.type ?? "Sprint")}
                                        </div> */}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-2">
                                                    <h4
                                                        className={`
                                                            text-sm font-medium leading-tight flex-1 
                                                            ${!notification.isRead ? "text-gray-900" : "text-gray-700"
                                                            }`}
                                                    >
                                                        {notification.message}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-500 mt-2">{formatSentTime(notification?.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-100 font-medium py-2 rounded-lg transition-colors duration-200"
                    >
                        View all notifications
                    </Button>
                </div>
            </div>
        </>
    )
}
