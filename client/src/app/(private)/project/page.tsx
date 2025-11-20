"use client"

import { useHash } from "@/hooks/useHash"
import WorkOn from "@/components/ForYouTab/WorkOn"
import Assign from "@/components/ForYouTab/Task"

interface MainTab {
  name: string
  tab: string
  count?: number
}

export default function Page() {
  const { hash: activeTab, setHash: setActiveTab } = useHash("")

  const tabs: MainTab[] = [
    { name: "Worked on", tab: "" },
    { name: "Task", tab: "task", count: 2 },
    { name: "Projects", tab: "project", count: 3 },
    { name: "Mentions", tab: "mention", count: 4 },
    { name: "System", tab: "system", count: 2 },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "":
        return <WorkOn />
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
