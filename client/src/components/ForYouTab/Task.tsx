'use client'

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { useNotification } from '@/app/(context)/Notfication'
import axios from '@/config/axiosConfig'
import type { Notification, NotificationGroups } from '@/utils/INotifications'

export default function Assign({ activeTab }: { activeTab: string }) {
    const { connection, setData, notifications } = useNotification()
    const [mockNotifications, setMockNotifications] = useState<Notification[]>([])

    useEffect(() => {
        if (!connection || !activeTab) return

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`/notifications/${activeTab}`)
                const data: Notification[] = response.data
                setData(data, activeTab)
            } catch (error) {
                console.error(error)
            }
        }

        fetchNotifications()
    }, [activeTab, connection])

    useEffect(() => {
        if (notifications && activeTab) {
            const key = activeTab as keyof NotificationGroups
            const taskNotifications = [...(notifications[key] || [])]
            setMockNotifications(taskNotifications)
        }
    }, [notifications, activeTab])

    return (
        <div className="w-full max-w-5xl mx-auto p-6 space-y-3">
            {mockNotifications.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                    No notifications found.
                </p>
            ) : (
                mockNotifications.map((n) => (
                    <div
                        key={n.notificationId}
                        className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors space-y-3"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md border text-xs ${n.isRead ? "opacity-70" : "bg-muted/30"
                                        }`}
                                >
                                    <Checkbox
                                        checked={n.isRead}
                                        // onCheckedChange={() => handleMarkRead(n.notificationId)}
                                        className="h-3 w-3"
                                    />
                                    <span className="font-mono text-[11px]">#{n.notificationId}</span>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(n.createdAt).toLocaleString()}
                            </span>
                        </div>

                        <p className="text-sm font-medium text-foreground leading-relaxed">
                            {n.message}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-2 text-xs text-muted-foreground">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <span className="flex items-center gap-1">
                                    <strong className="font-semibold">From:</strong>
                                    <span>{n.createdBy}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <strong className="font-semibold">To:</strong>
                                    <span>{n.assignee ?? "All"}</span>
                                </span>
                                {n.projectId && (
                                    <span className="flex items-center gap-1">
                                        <strong className="font-semibold">Project:</strong>
                                        <span>#{n.projectId}</span>
                                    </span>
                                )}
                            </div>
                            {n.link && (
                                <a
                                    href={`http://localhost:3000/project/1#list?${n.link}`}
                                    className="inline-flex items-center gap-1 text-primary hover:underline sm:ml-auto"
                                    rel="noopener noreferrer"
                                >
                                    View details →
                                </a>
                            )}
                        </div>

                    </div>
                ))
            )}
        </div>
    )
}