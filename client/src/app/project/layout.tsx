"use client"

import { ProjectHeader } from "@/components/ProjectHeader"
import { SidebarCustom } from "@/components/SidebarCustom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Providers } from "@/app/.context/Provider"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="w-full h-screen flex flex-col">
                <ProjectHeader sidebarTrigger={<SidebarTrigger />} />
                <div className="flex flex-1 overflow-hidden">
                    <SidebarCustom className="mt-13" />
                    <main className="flex-1 overflow-auto bg-gray-50">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
