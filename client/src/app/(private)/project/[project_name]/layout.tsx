"use client"

import { TaskProvider } from "@/app/(context)/TaskContext"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <TaskProvider>
            <main className="flex-1 overflow-auto p-0">{children}</main>
        </TaskProvider>
    )
}
