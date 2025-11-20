'use client'

import { useState } from 'react'
import { Plus, Bell, User, LogOut, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { useNotification } from '@/app/(context)/Notfication'
import { useUser } from '@/app/(context)/UserContext'
import { useRouter } from 'next/navigation'
import ColoredAvatar from './ColoredAvatar'
import type { Notification } from '@/utils/INotifications'

export function ProjectHeader({ sidebarTrigger }: { sidebarTrigger: React.ReactNode }) {
    const [isUserOpen, setIsUserOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [theme, setTheme] = useState(false)

    const { handleSignout, user } = useUser()
    const { notifications, setData } = useNotification()
    const router = useRouter()

    const taskNotifications: Notification[] = notifications.task ?? []
    // const unreadCount = taskNotifications.filter(n => !n.read).length

    // Handler đánh dấu notification đã đọc
    // const handleMarkRead = (id: string) => {
    //     setData(
    //         taskNotifications.map(n => (n.notificationId === id ? { ...n, read: true } : n)),
    //         'task'
    //     )
    // }

    return (
        <header className="flex items-end justify-between px-4 py-2 bg-white border-b border-gray-200 z-50 relative w-full">
            {/* Left */}
            <div className="flex items-center gap-5">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    {sidebarTrigger}
                </Button>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">J</span>
                    </div>
                    <span className="text-gray-900 font-medium">Jira</span>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-5 relative">
                <Button id="create-project" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                </Button>

                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <span className="text-sm">{user?.planName} Plan</span>
                </Button>

                {/* Bell */}
                <div id="notification" className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                        <Bell className="h-5 w-5" />
                        {/* {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                                {unreadCount}
                            </span>
                        )} */}
                    </Button>

                    {isNotificationOpen && (
                        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                            <div className="p-4 border-b border-gray-100 font-semibold text-gray-700 flex justify-between items-center">
                                Notifications
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                    onClick={() => {
                                        // TODO: mark all read
                                    }}
                                >
                                    Clear all
                                </Button>
                            </div>

                            <div className="max-h-150 overflow-y-auto space-y-2 p-2">
                                {taskNotifications.length === 0 ? (
                                    <p className="text-muted-foreground text-sm text-center py-4 border-4">No notifications</p>
                                ) : (
                                    taskNotifications.map((n, index) => (
                                        <div
                                            key={n.notificationId}
                                        // className={`p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors space-y-2 ${
                                        //     !n.read ? 'bg-gray-50' : ''
                                        // }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 p-2">
                                                <div className="flex items-center gap-2">
                                                    {/* <Checkbox
                                                        // checked={n.read}
                                                        // onCheckedChange={() => handleMarkRead(n.notificationId)}
                                                        className="h-3 w-3"
                                                    /> */}
                                                    <span className="text-xs font-mono">#{n.notificationId}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="text-sm font-medium text-gray-800 leading-relaxed">{n.message}</p>

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-1 text-xs text-muted-foreground pb-4 ">
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                    <span className="flex items-center gap-1">
                                                        <strong className="font-semibold">From:</strong>
                                                        <span>{n.createdBy}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <strong className="font-semibold">To:</strong>
                                                        <span>{n.assignee ?? 'All'}</span>
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
                                                        href={n.link}
                                                        className="inline-flex items-center gap-1 text-primary hover:underline sm:ml-auto"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View details →
                                                    </a>
                                                )}
                                            </div>
                                            {index < taskNotifications.length - 1 && (
                                                <div className="border-b border-gray-300 mb-2"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User */}
                <div className="relative">
                    <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setIsUserOpen(!isUserOpen)}>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback className="bg-blue-600 text-white text-sm">BK</AvatarFallback>
                    </Avatar>

                    {isUserOpen && user && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <ColoredAvatar id={user.id} name={user.name} size="lg" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                                    onClick={() => router.push('/profile')}
                                >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </button>
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                                    onClick={() => setTheme(!theme)}
                                >
                                    {!theme ? (
                                        <>
                                            <Sun className="h-4 w-4" />
                                            <span>Light mode</span>
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="h-4 w-4" />
                                            <span>Dark mode</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="py-2 border-t border-gray-100">
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                                    onClick={() => handleSignout()}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
