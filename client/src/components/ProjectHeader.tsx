"use client";

import { Search, Plus, Bell, Settings, User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "@/app/(context)/Notfication";
import { useUser } from "@/app/(context)/UserContext";
import { useRouter } from "next/navigation";
import ColoredAvatar from "./ColoredAvatar";
import type { Notification } from "@/utils/INotifications";
import axios from "@/config/axiosConfig";

const planGradients = {
    Free: "from-gray-400 to-gray-600",
    Pro: "from-blue-400 to-blue-600",
    Enterprise: "from-purple-400 to-purple-600",
};

export function ProjectHeader({ sidebarTrigger }: { sidebarTrigger: React.ReactNode }) {
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [theme, setTheme] = useState(false);
    const [plan, setPlan] = useState<keyof typeof planGradients | null>(null)
    const { handleSignout, user } = useUser();
    const { connection, setData, notifications } = useNotification();
    const router = useRouter();
    const fetchedRef = useRef(false)
    const taskNotifications: Notification[] = notifications.task ?? [];

    useEffect(() => {
        if (!connection) return;
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        axios.get(`/notifications/task`).then(res => {
            setData(res.data, "task");
        });
        axios.get(`/notifications/project`).then(res => {
            setData(res.data, "project");
        });

    }, [connection]);

    const handleNotificationOpen = async () => {
        try {
            const { data } = await axios.get<Notification[]>(`/notifications/myNotifications`)
            setData(data, "task")
        } catch (error) {
            console.error("Failed to load notifications:", error)
        }
    }

    // useEffect(() => {
    //     const fetchSubscription = async () => {
    //         try {
    //             // const response = await axios.get(`/users/subscription`)
    //             // setPlan(response.data)
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }

    //     fetchSubscription()
    // }, [])

    return (
        <>
            <header className="relative flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-50 w-full">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-0 hover:opacity-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-opacity duration-300 pointer-events-none" />

                {/* Left side */}
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
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Create button */}
                    <Button id="create-project" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                    </Button>

                    {/* Plan Button with Flip/Wave Animation */}
                    <Button
                        className={`bg-gradient-to-r ${planGradients[(plan ?? "Free") as keyof typeof planGradients]} hover:shadow-lg text-white font-medium shadow-md transition-all duration-500`}
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
                        {/* <span className="plan-flip">{plan} Plan</span> */}
                    </Button>

                    {/* Notifications */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
                            onClick={() => {
                                setIsNotificationOpen(!isNotificationOpen)
                                handleNotificationOpen();
                            }}
                        >
                            <Bell className="h-5 w-5" />
                            {/* {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )} */}
                        </Button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                                <div className="p-4 border-b border-gray-100 font-semibold text-gray-700 flex justify-between items-center">
                                    Notifications
                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                        Clear all
                                    </Button>
                                </div>

                                <div className="max-h-96 overflow-y-auto p-2 space-y-3">
                                    {taskNotifications.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">No notifications</p>
                                    ) : (
                                        taskNotifications.map((n, idx) => (
                                            <div key={n.notificationId} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                    <span>#{n.notificationId}</span>
                                                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-800">{n.message}</p>
                                                <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-3">
                                                    <span>From: {n.createdBy}</span>
                                                    <span>To: {n.assignee ?? "All"}</span>
                                                    {n.projectId && <span>Project: #{n.projectId}</span>}
                                                </div>
                                                {n.link && (
                                                    <a href={`http://localhost:3000/project/1#list?${n.link}`} rel="noopener noreferrer" className="text-primary text-xs hover:underline mt-2 inline-block">
                                                        View details →
                                                    </a>
                                                )}
                                                {idx < taskNotifications.length - 1 && <hr className="mt-3 border-gray-200" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User dropdown */}
                    <div className="relative">
                        <Avatar
                            className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-blue-400 transition-all"
                            onClick={() => setIsUserOpen(!isUserOpen)}
                        >
                            <AvatarImage src="/placeholder.svg?height=36&width=36" />
                            <AvatarFallback className="bg-blue-600 text-white font-semibold">
                                {user?.name?.slice(0, 2).toUpperCase() ?? "BK"}
                            </AvatarFallback>
                        </Avatar>

                        {isUserOpen && user && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
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
                                        onClick={() => router.push("/profile")}
                                    >
                                        <User className="h-4 w-4" />
                                        Profile
                                    </button>

                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                                        onClick={() => setTheme(!theme)}
                                    >
                                        {theme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                        <span>{theme ? "Dark mode" : "Light mode"}</span>
                                    </button>
                                </div>

                                <div className="py-2 border-t border-gray-100">
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 text-gray-700"
                                        onClick={handleSignout}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}