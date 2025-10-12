"use client"

import { PresenceProvider } from "./OnlineMembers";
import { NotificationProvider } from "./Notfication";
import { ProjectProvider } from "./ProjectContext"
import { ThemeProvider } from "@/app/.context/ThemeContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ProjectProvider>
                <PresenceProvider>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                </PresenceProvider>
            </ProjectProvider>
        </ThemeProvider >
    )
}
