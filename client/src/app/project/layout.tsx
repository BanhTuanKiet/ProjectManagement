import { ProjectHeader } from "@/components/ProjectHeader";
import { SidebarCustom } from "@/components/SidebarCustom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen">
      <SidebarProvider>
        <div className="flex h-full">
          <SidebarCustom />
          <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto w-full">
            <ProjectHeader sidebarTrigger={<SidebarTrigger />} />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
