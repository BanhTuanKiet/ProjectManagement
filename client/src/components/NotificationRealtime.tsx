import React from 'react'
import { Button } from './ui/button'
import { Check, Users } from 'lucide-react'
import { Notification } from '@/utils/INotifications'

export default function NotificationRealtime({
    notifications,
    unreadCount,
    setNotifications
}: {
    notifications: Notification[]
    unreadCount: number
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
}) {
    const markAsRead = (id: number) => {
        setNotifications((prev) => prev.map((notif) => (notif.NotificationId === id ? { ...notif, isRead: true } : notif)))
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    }
    return (
        <>

            <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 text-xs"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No notifications</div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.NotificationId}
                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notification.IsRead ? "bg-blue-50" : ""
                                    }`}
                                onClick={() => markAsRead(notification.NotificationId)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4
                                                className={`text-sm font-medium ${!notification.IsRead ? "text-gray-900" : "text-gray-700"
                                                    }`}
                                            >
                                                {notification.Message}
                                            </h4>
                                            {!notification.IsRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{notification.Message}</p>
                                        <p className="text-xs text-gray-400 mt-2">{notification.CreatedAt?.toLocaleDateString()}</p>
                                    </div>
                                    {/* <div className="flex items-center gap-1 ml-2">
                                        {notification.type === "task" && (
                                            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                        )}
                                        {notification.type === "comment" && (
                                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                                <span className="text-blue-600 text-xs">💬</span>
                                            </div>
                                        )}
                                        {notification.type === "sprint" && (
                                            <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                                                <span className="text-purple-600 text-xs">🏃</span>
                                            </div>
                                        )}
                                        {notification.type === "team" && (
                                            <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                                                <Users className="h-3 w-3 text-orange-600" />
                                            </div>
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t border-gray-100">
                    <Button variant="ghost" className="w-full text-sm text-blue-600 hover:text-blue-700">
                        View all notifications
                    </Button>
                </div>
            </div>

        </>
    )
}
