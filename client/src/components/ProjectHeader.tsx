"use client"

import { Search, Plus, Bell, Settings, User, Users, LogOut, Sun, Moon, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { Checkbox } from '@/components/ui/checkbox'
import { useNotification } from '@/app/(context)/Notfication'
import { useUser } from '@/app/(context)/UserContext'
import { useRouter } from 'next/navigation'
import ColoredAvatar from './ColoredAvatar'
import type { Notification } from '@/utils/INotifications'
import axios from '@/config/axiosConfig'

    const planGradients = {
        "Free": "from-gray-400 to-gray-600",
        "Pro": "from-blue-400 to-blue-600",
        "Enterprise": "from-purple-400 to-purple-600"
    }
        
export function ProjectHeader({ sidebarTrigger }: { sidebarTrigger: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [plan, setPlan] = useState("Pro")
    const gradientColor = planGradients[plan as keyof typeof planGradients] || planGradients["Pro"]
    const [isUserOpen, setIsUserOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [theme, setTheme] = useState(false)
    const { handleSignout, user } = useUser()
    const { connection, setData, notifications } = useNotification()
    const router = useRouter()
    const taskNotifications: Notification[] = notifications.task ?? []
    
    // const unreadCount = taskNotifications.filter(n => !n.read).length

    // // Handler đánh dấu notification đã đọc
    // const handleMarkRead = (id: string) => {
    //     setData(
    //         taskNotifications.map(n => (n.notificationId === id ? { ...n, read: true } : n)),
    //         'task'
    //     )
    // }

    useEffect(() => {
        if (!connection) return

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`/notifications/${"task"}`)
                const data: Notification[] = response.data
                setData(data, "task")
            } catch (error) {
                console.error(error)
            }
        }

        fetchNotifications()
    }, ["task", connection])

    return (
        <>
            <header className="relative flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-50 w-full overflow-hidden">
                {/* Animated background effect */}
                <div className="absolute inset-0 opacity-0 hover:opacity-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-opacity duration-300 pointer-events-none" />

                <div className="relative flex items-center gap-6 flex-1">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                        {sidebarTrigger}
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-md flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">J</span>
                        </div>
                        <span className="text-gray-900 font-semibold text-lg">Jira</span>
                    </div>
                    <span className="text-gray-900 font-medium">Jira</span>
                </div>

                <div className="relative flex items-center gap-4">
                    <Button id="create-project" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-shadow">
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                    </Button>

                    {/* Plan Button with Flip/Wave Animation */}
                    <Button 
                        className={`bg-gradient-to-r ${gradientColor} hover:shadow-lg text-white font-medium shadow-md transition-all duration-500`}
                    >
                        <style>{`
                            @keyframes flip {
                                0% {
                                    transform: rotateY(0deg) rotateX(0deg);
                                    opacity: 1;
                                }
                                50% {
                                    transform: rotateY(180deg) rotateX(5deg);
                                }
                                100% {
                                    transform: rotateY(360deg) rotateX(0deg);
                                    opacity: 1;
                                }
                            }

                            @keyframes wave {
                                0%, 100% {
                                    transform: translateY(0);
                                }
                                25% {
                                    transform: translateY(-3px);
                                }
                                50% {
                                    transform: translateY(0);
                                }
                                75% {
                                    transform: translateY(-3px);
                                }
                            }

                            @keyframes waveLetters {
                                0%, 100% {
                                    transform: translateY(0);
                                }
                                50% {
                                    transform: translateY(-4px);
                                }
                            }

                            /* Dùng flip animation */
                            .plan-flip {
                                display: inline-block;
                                animation: flip 3s ease-in-out infinite;
                                transform-style: preserve-3d;
                            }

                            /* Dùng wave animation */
                            .plan-wave {
                                display: inline-block;
                                animation: wave 2s ease-in-out infinite;
                            }

                            /* Wave letters (từng chữ lên xuống) */
                            .plan-wave-letters {
                                display: inline-flex;
                                gap: 2px;
                            }

                            .plan-wave-letters span {
                                display: inline-block;
                                animation: waveLetters 1s ease-in-out infinite;
                            }

                            .plan-wave-letters span:nth-child(1) { animation-delay: 0s; }
                            .plan-wave-letters span:nth-child(2) { animation-delay: 0.1s; }
                            .plan-wave-letters span:nth-child(3) { animation-delay: 0.2s; }
                            .plan-wave-letters span:nth-child(4) { animation-delay: 0.3s; }
                            .plan-wave-letters span:nth-child(5) { animation-delay: 0.4s; }
                        `}</style>
                        
                        {/* CHỌN MỘT TRONG CÁC HIỆU ỨNG SAU: */}
                        
                        {/* Option 1: Flip Animation */}
                        <span className="plan-flip">{plan} Plan</span>

                        {/* Option 2: Wave Animation */}
                        {/* <span className="plan-wave">{plan} Plan</span> */}

                        {/* Option 3: Wave Letters (từng chữ) */}
                        {/* <span className="plan-wave-letters">
                            {(plan + " Plan").split("").map((char, i) => (
                                <span key={i}>{char}</span>
                            ))}
                        </span> */}
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-colors"
                    >
                        <Bell className="h-4 w-4" />
                    </Button>

                    <div className="relative">
                        <Avatar 
                            className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all" 
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">BK</AvatarFallback>
                        </Avatar>

                        {isOpen && (
                            <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-blue-200">
                                            <AvatarFallback className="bg-blue-600 text-white font-bold">BK</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Benjamin King</h3>
                                            <p className="text-sm text-gray-600">benjamin@example.com</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2 space-y-1">
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors">
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors">
                                        <Settings className="h-4 w-4" />
                                        <span>Account settings</span>
                                    </button>
                                </div>

                                <div className="py-2 border-t border-gray-100 space-y-1">
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 text-gray-700 transition-colors">
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
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