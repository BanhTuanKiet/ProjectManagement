"use client"

import React from "react"

interface NotificationTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

interface TabItem {
  id: string
  count: number
}

const NotificationTabs: React.FC<NotificationTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: TabItem[] = [
    { id: "All", count: 23 },
    { id: "Tasks", count: 5 },
    { id: "Projects", count: 3 },
    { id: "Mentions", count: 4 },
    { id: "System", count: 2 },
  ]

  return (
    <div className="flex border-b border-gray-200 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200
            ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
        >
          <span>{tab.id}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}

export default NotificationTabs
