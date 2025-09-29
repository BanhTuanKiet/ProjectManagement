"use client"

import type React from "react"
import { Button } from "./ui/button"
import { Bell, Check, Trash2, Sparkles } from "lucide-react"
import type { Notification } from "@/utils/INotifications"
import ColoredAvatar from "./ColoredAvatar"
import { formatSentTime } from "@/utils/dateUtils"
import { useRef, useState } from "react"
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
  const [hoveredNotification, setHoveredNotification] = useState<number | null>(null)

  const markAsRead = (notification: Notification) => {
    if (notificationsRef.current) clearTimeout(notificationsRef.current)

    notificationsRef.current = setTimeout(async () => {
      try {
        const response = await axios.put(`/notifications/read/${notification.notificationId}`)
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.notificationId === notification.notificationId ? { ...notif, isRead: true } : notif,
          ),
        )

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
    }, 500)
  }

  const markAsReadOnly = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()

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

  const deleteNotification = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      await axios.delete(`/notifications/${notification.notificationId}`)
      setNotifications((prev) => prev.filter((notif) => notif.notificationId !== notification.notificationId))
    } catch (error) {
      console.log(error)
    }
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  return (
    <>
      <div className="absolute right-0 top-full mt-3 w-[420px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden ring-1 ring-black/5">
        <div className="relative p-3 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5 text-foreground" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">Notifications</h3>
                <p className="text-xs text-muted-foreground">Stay updated with your projects</p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                  {unreadCount}
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10 text-xs font-medium px-3 py-1.5 h-auto rounded-full border border-primary/20 hover:border-primary/30 transition-all duration-200"
                onClick={markAllAsRead}
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="relative mx-auto mb-4 w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10"></div>
              </div>
              <h4 className="text-foreground font-medium mb-1">No notifications yet</h4>
              <p className="text-muted-foreground text-sm">{"We\'ll notify you when something happens"}</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={notification.notificationId}
                className={`
                  group relative p-4 border-b border-border/30 hover:bg-accent/30 cursor-pointer transition-all duration-300 
                  ${!notification.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"}
                  ${index === notifications.length - 1 ? "border-b-0" : ""}
                `}
                onClick={() => markAsRead(notification)}
                onMouseEnter={() => setHoveredNotification(notification.notificationId)}
                onMouseLeave={() => setHoveredNotification(null)}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-primary/50 shadow-lg shadow-primary/20"></div>
                )}

                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`rounded-full p-0.5 ${!notification.isRead ? "bg-gradient-to-br from-primary to-primary/50" : ""}`}
                    >
                      <ColoredAvatar id={"50792e5f-96fb-41ac-868c-ac81c0fad2ce"} name="BanhTuanKiet" />
                    </div>
                    {!notification.isRead && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card shadow-sm animate-pulse"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <h4
                          className={`
                          text-sm font-medium leading-relaxed text-balance
                          ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}
                        `}
                        >
                          {notification.message}
                        </h4>

                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground/80">{formatSentTime(notification?.createdAt)}</p>
                          {!notification.isRead && <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>}
                        </div>
                      </div>

                      <div
                        className={`
                        flex items-center gap-1 transition-all duration-200
                        ${hoveredNotification === notification.notificationId ? "opacity-100 translate-x-0" : "opacity-60 translate-x-1"}
                      `}
                      >
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-full transition-all duration-200 hover:scale-110"
                            onClick={(e) => markAsReadOnly(notification, e)}
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-full transition-all duration-200 hover:scale-110"
                          onClick={(e) => deleteNotification(notification, e)}
                          title="Delete notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="relative p-4 bg-gradient-to-r from-muted/30 to-muted/10 border-t border-border/50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-50"></div>
          <Button
            variant="ghost"
            className="relative w-full text-sm text-primary hover:text-primary hover:bg-primary/10 font-medium py-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-primary/20"
          >
            View all notifications
          </Button>
        </div>
      </div>
    </>
  )
}
