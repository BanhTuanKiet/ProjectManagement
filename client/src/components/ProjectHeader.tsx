"use client"

import { Plus, Bell, User, LogOut, Sun, Moon, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useRef, useState } from "react"
import { useNotification } from "@/app/(context)/Notfication"
import { useUser } from "@/app/(context)/UserContext"
import { useRouter } from "next/navigation"
import ColoredAvatar from "./ColoredAvatar"
import type { Notification } from "@/utils/INotifications"
import axios from "@/config/axiosConfig"
import { cn } from "@/lib/utils"

const planGradients = {
    Free: "from-slate-400 to-slate-600",
    Pro: "from-blue-500 via-indigo-500 to-blue-600",
    Enterprise: "from-violet-500 via-purple-500 to-fuchsia-600",
}

export function ProjectHeader({ sidebarTrigger }: { sidebarTrigger: React.ReactNode }) {
    const [isUserOpen, setIsUserOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [theme, setTheme] = useState(false)
    const [plan, setPlan] = useState<keyof typeof planGradients | null>(null)
    const { handleSignout, user } = useUser()
    const { connection, setData, notifications } = useNotification()
    const router = useRouter()
    const fetchedRef = useRef(false)

    const taskNotifications: Notification[] = (notifications.task ?? []).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const notificationRef = useRef<HTMLDivElement>(null)
    const userRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false)
            }
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setIsUserOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (!connection) return
        if (fetchedRef.current) return
        fetchedRef.current = true

        axios.get(`/notifications/task`).then(res => setData(res.data, "task"))
        axios.get(`/notifications/project`).then(res => setData(res.data, "project"))
    }, [connection])

    const handleNotificationOpen = async () => {
        setIsNotificationOpen(!isNotificationOpen)
        setIsUserOpen(false)
        if (!isNotificationOpen) {
            try {
                const { data } = await axios.get<Notification[]>(`/notifications/myNotifications`)
                setData(data, "task")
            } catch (error) {
                console.error("Failed to load notifications:", error)
            }
        }
    }

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await axios.get(`/users/subscription`)
                console.log(response.data)
                if (response.data === "") setPlan("Free")
                else
                    setPlan(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchSubscription()
    }, [])

    const hasUnread = taskNotifications.length > 0

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 w-full transition-all">
            <div className="flex items-center gap-4 lg:gap-6">
                <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-foreground">
                    {sidebarTrigger}
                </Button>

                <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => router.push("/")}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 shadow-sm ring-1 ring-black/5">
                        <span className="text-white text-lg font-bold">J</span>
                    </div>
                    <span className="hidden font-bold text-lg tracking-tight text-foreground md:inline-block">JiraClone</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button className="hidden h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm sm:flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Create</span>
                </Button>

                <div className="relative" ref={notificationRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={handleNotificationOpen}
                    >
                        <Bell className="h-5 w-5" />
                        {hasUnread && (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                        )}
                    </Button>

                    {isNotificationOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 origin-top-right rounded-xl border bg-popover text-popover-foreground shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 slide-in-from-top-2 z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                                <h4 className="font-semibold text-sm">Notifications</h4>
                                <span className="text-xs text-muted-foreground hover:text-blue-600 cursor-pointer">Mark all read</span>
                            </div>

                            <div className="max-h-[24rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                {taskNotifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <Bell className="h-8 w-8 mb-3 opacity-20" />
                                        <p className="text-sm">No new notifications</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {taskNotifications.map((n) => (
                                            <div key={n.notificationId} className="group relative flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                                                <div className="mt-1">
                                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none text-foreground">
                                                        {n.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{n.createdBy}</span>
                                                        <span>•</span>
                                                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {n.link && (
                                                        <a href={`http://localhost:3000/project/1#list?${n.link}`} className="mt-2 inline-flex items-center text-xs text-blue-600 font-medium hover:underline">
                                                            View task <ArrowRight className="ml-1 h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative ml-1" ref={userRef}>
                    <Avatar
                        className={cn(
                            "h-9 w-9 cursor-pointer transition-all ring-2 ring-transparent hover:ring-blue-400/50",
                            isUserOpen && "ring-blue-400"
                        )}
                        onClick={() => {
                            setIsUserOpen(!isUserOpen)
                            setIsNotificationOpen(false)
                        }}
                    >
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium text-sm">
                            {user?.name?.slice(0, 2).toUpperCase() ?? "ME"}
                        </AvatarFallback>
                    </Avatar>

                    {isUserOpen && user && (
                        <div className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-xl border bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-top-2 z-50 overflow-hidden">
                            <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                                <ColoredAvatar id={user.id} name={user.name} size="md" />
                                <div className="flex flex-col space-y-0.5 overflow-hidden">
                                    <p className="text-sm font-semibold truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="p-2">
                                <div className={cn(
                                    "relative overflow-hidden rounded-lg bg-gradient-to-r p-3 text-white shadow-sm transition-all",
                                    planGradients[(plan ?? "Free") as keyof typeof planGradients]
                                )}>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Current Plan</p>
                                            <p className="font-bold text-sm">{plan ?? "Free"} Plan</p>
                                        </div>
                                        <Button size="sm" variant="secondary" className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                                            onClick={() => router.push("/plan")}>
                                            Upgrade
                                        </Button>
                                    </div>
                                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                                    <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-black/5 blur-xl" />
                                </div>
                            </div>

                            <div className="p-1">
                                <button
                                    onClick={() => router.push("/profile")}
                                    className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>Profile settings</span>
                                </button>
                                <button
                                    onClick={() => setTheme(!theme)}
                                    className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    {theme ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                                    <span>{theme ? "Dark mode" : "Light mode"}</span>
                                </button>
                            </div>

                            <div className="h-px bg-border my-1" />

                            <div className="p-1 pb-2">
                                <button
                                    onClick={handleSignout}
                                    className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
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