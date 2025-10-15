"use client"

import { useEffect, useState } from "react"
import WordOn from "@/components/ForYouTab/WordOn"
import Assign from "@/components/ForYouTab/Task"

interface MainTab {
    name: string
    tab: string
    count?: number
}

export default function Page() {
    const [activeTab, setActiveTab] = useState<string>("word")
    const tabs: MainTab[] = [
        { name: "Worked on", tab: "word" },
        { name: "Task", tab: "task", count: 2 },
        { name: "Projects", tab: "project", count: 3 },
        { name: "Mentions", tab: "mention", count: 4 },
        { name: "System", tab: "system", count: 2 },
    ]

    useEffect(() => {
        const hash = window.location.hash.replace("#", "")
        if (hash && tabs.some(t => t.name === hash)) {
            setActiveTab(hash)
        }
    }, [])

    useEffect(() => {
        if (activeTab === "work") {
            history.pushState(null, "", window.location.pathname)
        } else {
            history.pushState(null, "", `${window.location.pathname}#${activeTab}`)
        }
    }, [activeTab])

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace("#", "")
            if (hash && tabs.some(t => t.name === hash)) {
                setActiveTab(hash)
            } else if (!hash) {
                setActiveTab("word")
            }
        }

        window.addEventListener("hashchange", handleHashChange)
        return () => window.removeEventListener("hashchange", handleHashChange)
    }, [])

    const renderContent = () => {
        switch (activeTab) {
            case "word":
                return (
                    <WordOn />
                )

            case "task": 
                return (
                    <Assign activeTab={activeTab} />
                )

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
            <div className="max-w-[1400px] mx-auto px-6 py-4 space-y-10">
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
                                    <span className="flex items-center gap-2">
                                        {tab.name}
                                        {tab.count && (
                                            <span className="bg-secondary text-secondary-foreground py-0.5 px-2 rounded-full text-xs font-medium">
                                                {tab.count}
                                            </span>
                                        )}
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