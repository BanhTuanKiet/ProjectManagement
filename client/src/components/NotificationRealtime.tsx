"use client"

import type React from "react"
import { Button } from "./ui/button"
import { Bell, X, ArrowRight } from 'lucide-react'
import type { Notification } from "@/utils/INotifications"
import ColoredAvatar from "./ColoredAvatar"
import { formatSentTime } from "@/utils/dateUtils"
import axios from "@/config/axiosConfig"
import { useNotification } from "@/app/.context/Notfication"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NotificationRealtime({
  notifications,
  unreadCount,
  setNotifications,
}: {
  notifications: Notification[]
  unreadCount: number
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
}) {
  const { setSelectedTask } = useNotification()
  const router = useRouter()
  const [hoveredNotification, setHoveredNotification] = useState<number | null>(null)

  const markAsRead = async (notification: Notification) => {
    if (notification.isRead) return

    try {
      await axios.put(`/notifications/${notification.notificationId}`)
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notification.notificationId ? { ...notif, isRead: true } : notif,
        ),
      )
    } catch (error) {
      console.log(error)
    }
  }

  const navigateToTask = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      if (!notification.isRead) {
        await axios.put(`/notifications/${notification.notificationId}`)
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.notificationId === notification.notificationId ? { ...notif, isRead: true } : notif,
          ),
        )
      }

      const response = await axios.put(`/notifications/read/${notification.notificationId}`)
      
      if (typeof response.data === "string" && response.data.startsWith("/tasks/")) {
        const taskId = Number.parseInt(response.data.split("/")[2])
        if (!isNaN(taskId)) {
          setSelectedTask(taskId)
        }
      }

      router.push(`/project/${notification.projectId}`)
    } catch (error) {
      console.log(error)
    }
  }

  const deleteNotification = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      await axios.delete(`/notifications/${notification.notificationId}`)
      setNotifications((prev) => prev.filter((notif) => notif.notificationId !== notification.notificationId))
    } catch (error) {
      console.log(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // await axios.put('/notifications/read-all')
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-[440px] bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium bg-primary text-primary-foreground rounded">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{"You\'re all caught up"}</p>
            <p className="text-xs text-muted-foreground text-center">
              No new notifications at the moment
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.notificationId}
                className={`
                  group relative px-4 py-3 cursor-pointer transition-colors
                  ${!notification.isRead ? "bg-primary/5" : "bg-background"}
                  hover:bg-muted/50
                `}
                onClick={() => markAsRead(notification)}
                onMouseEnter={() => setHoveredNotification(notification.notificationId)}
                onMouseLeave={() => setHoveredNotification(null)}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                )}

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <ColoredAvatar 
                      id={"50792e5f-96fb-41ac-868c-ac81c0fad2ce"} 
                      name="BanhTuanKiet" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm leading-relaxed text-pretty ${!notification.isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {notification.message}
                      </p>
                      
                      <div className={`
                        flex flex-col items-center gap-0.5 flex-shrink-0 transition-opacity
                        ${hoveredNotification === notification.notificationId ? "opacity-100" : "opacity-0"}
                      `}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => navigateToTask(notification, e)}
                          title="Go to task"
                        >
                          <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-muted"
                          onClick={(e) => deleteNotification(notification, e)}
                          title="Delete"
                        >
                          <X className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatSentTime(notification?.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-border">
          <Button
            variant="ghost"
            className="w-full h-10 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-none"
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  )
}