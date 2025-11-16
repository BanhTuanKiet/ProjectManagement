"use client"

import { TaskProvider } from "@/app/(context)/TaskContext"
import { ThemeProvider } from '@/app/(context)/ThemeContext'
import { ProjectProvider } from '@/app/(context)/ProjectContext'
import { PresenceProvider } from '@/app/(context)/OnlineMembers'
import { NotificationProvider } from '@/app/(context)/Notfication'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ProjectProvider>
                <PresenceProvider>
                    <NotificationProvider>
                        <TaskProvider>
                            <main className="flex-1 overflow-auto p-0">{children}</main>
                        </TaskProvider>
                    </NotificationProvider>
                </PresenceProvider>
            </ProjectProvider>
        </ThemeProvider >
    )
}
