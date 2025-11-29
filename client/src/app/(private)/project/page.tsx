"use client"

import type { ReactNode } from "react"
import { useHash } from "@/hooks/useHash"
import WorkOn from "@/components/ForYouTab/WorkOn"
import Assign from "@/components/ForYouTab/Task"
import { UpcomingDeadline } from "@/components/UpcomingDeadline"
import {
    Clock,
    CalendarDays,
    UserCheck,
    ListTodo,
    FolderKanban,
    AtSign,
    Bell
} from "lucide-react"

interface MainTab {
    name: string
    tab: string
    icon: ReactNode
}

export default function Page() {
    const { hash: activeTab, setHash: setActiveTab } = useHash("")

    const tabs: MainTab[] = [
        { name: "Worked on", tab: "", icon: <UserCheck size={16} /> },
        { name: "Upcoming deadline", tab: "deadline", icon: <Clock size={16} /> },
        // { name: "Task today", tab: "today", icon: <ListTodo size={16} /> },
        // { name: "Task", tab: "task", icon: <ListTodo size={16} /> },
        // { name: "Projects", tab: "project", icon: <FolderKanban size={16} /> },
        // { name: "Mentions", tab: "mention", icon: <AtSign size={16} /> },
        // { name: "System", tab: "system", icon: <Bell size={16} /> },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case "":
                return <WorkOn />
            case "deadline":
                return <UpcomingDeadline type="deadline" />
            case "today":
                return <UpcomingDeadline type="today" />
            case "task":
                return <Assign activeTab={activeTab} />
            case "project":
                return <Assign activeTab={activeTab} />
            default:
                return (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">
                            No notifications in <strong>{activeTab}</strong>
                        </p>
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1400px] mx-auto px-12 py-4 space-y-10">
                <section className="space-y-6">
                    <div className="border-b border-border">
                        <nav className="flex flex-wrap gap-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.tab}
                                    onClick={() => setActiveTab(tab.tab)}
                                    className={`relative py-3 px-1 font-medium text-sm whitespace-nowrap transition-colors
                                            ${activeTab === tab.tab
                                            ? "text-blue-600"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <span className="flex items-center gap-2 cursor-pointer">
                                        {tab.icon}
                                        {tab.name}
                                    </span>

                                    {activeTab === tab.tab && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {renderContent()}
                </section>
            </div>
        </div>
    )
}
