"use client"

import { ProjectCard } from "@/components/ProjectCard"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useProject } from "@/app/(context)/ProjectContext"

export default function Page() {
    const { projects } = useProject()
    const tabs = [
        { name: "Worked on", active: false, count: null },
        { name: "Viewed", active: true, count: null },
        { name: "Assigned to me", active: false, count: 2 },
        { name: "Boards", active: false, count: null },
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-foreground tracking-tight">For you</h1>
                    <p className="text-muted-foreground">Your personalized project dashboard</p>
                </div>

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-foreground">Recent projects</h2>
                            <p className="text-sm text-muted-foreground">{"Projects you've worked on recently"}</p>
                        </div>
                    </div>

                    <div className="relative -mx-6 px-6">
                        <div className="overflow-x-auto scrollbar-custom pb-4">
                            <div className="flex gap-4 min-w-max">
                                {projects?.map((p) => (
                                    <div key={p.projectId} className="flex-none w-80">
                                        <ProjectCard project={p} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="border-b border-border">
                        <nav className="flex gap-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    className={`relative py-3 px-1 font-medium text-sm whitespace-nowrap transition-colors ${tab.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
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
                                    {tab.active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">No items to display</p>
                    </div>
                </section>
            </div>
        </div>
    )
}