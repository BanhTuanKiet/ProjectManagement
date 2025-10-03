"use client"

import type React from "react"

import { Search, Plus, Bell, Settings, User, Users, LogOut, Sun, Moon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { usePresence } from "../app/.context/OnlineMembers"
import axios from "@/config/axiosConfig"
import { useSearchParams } from "next/navigation"
import { SuccessNotify, WarningNotify } from "@/utils/toastUtils"
import { useRouter } from "next/navigation"
import NotificationRealtime from "@/components/NotificationRealtime"
import { useNotification } from "@/app/.context/Notfication"

export function ProjectHeader({
    sidebarTrigger,
}: {
    sidebarTrigger: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [theme, setTheme] = useState(false)
    const { connectSignalR } = usePresence()
    const { connectNotificationSignalR, notifications, setNotifications } = useNotification()
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const success = searchParams.get("success")

        if (success === "false") return WarningNotify("Signin via Google failed")
        if (success === "true") SuccessNotify("Signin via Google successful")

        const fetchToken = async () => {
            try {
                const reponse = await axios.get(`/users/token`)
                const token: string = reponse.data ?? ""
                if (reponse.data) {
                    connectSignalR(token)
                    connectNotificationSignalR(token)
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchToken()
        router.replace("/project")
    }, [])

    const signinGG = async () => {
        window.location.href = "http://localhost:5144/users/signin-google"
    }

    const unreadCount = notifications?.filter(n => !n.isRead).length

    return (
        <>
            <header className="flex items-end justify-between px-4 py-2 bg-white border-b border-gray-200 z-50 relative max-w-7xl mx-auto w-full bg-dynamic">
                {" "}
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
                <div className="flex-1 w-lg mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-6" />
                        <Input
                            placeholder="Search"
                            className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-5 relative">
                    <Button className="bg-red-500 hover:bg-red-700 text-white" onClick={signinGG}>
                        Google
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <span className="text-sm">Premium trial</span>
                    </Button>
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>

                        {isNotificationOpen && (
                            <NotificationRealtime notifications={notifications} unreadCount={unreadCount} setNotifications={setNotifications} />
                        )}
                    </div>
                    <div className="relative">
                        <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                            <AvatarFallback className="bg-blue-600 text-white text-sm">BK</AvatarFallback>
                        </Avatar>

                        {isOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-purple-600 text-white text-lg font-semibold">BK</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Bành Tuấn Kiệt</h3>
                                            <p className="text-sm text-gray-600">kiett5153@gmail.com</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700">
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700">
                                        <Settings className="h-4 w-4" />
                                        <span>Account settings</span>
                                    </button>
                                    <button
                                        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                                        onClick={() => setTheme(!theme)}
                                    >
                                        <div className="flex items-center gap-3">
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
                                        </div>
                                    </button>
                                </div>

                                <div className="py-2 border-t border-gray-100">
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700">
                                        <Users className="h-4 w-4" />
                                        <span>Switch account</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700">
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    )
}
