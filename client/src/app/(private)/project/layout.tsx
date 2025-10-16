"use client"

import { ProjectHeader } from "@/components/ProjectHeader"
import { SidebarCustom } from "@/components/SidebarCustom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <SidebarProvider>
            <div className="flex flex-col w-full h-screen"> {/* ✅ dùng h-full + overflow-hidden */}
                <ProjectHeader sidebarTrigger={<SidebarTrigger />} />
                <div className="flex flex-1 overflow-hidden">
                    <SidebarCustom className="mt-13" />
                    <main className="flex-1 overflow-auto bg-gray-50 ">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
