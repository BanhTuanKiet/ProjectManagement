import { ThemeProvider } from '../(context)/ThemeContext'
import { ProjectProvider } from '../(context)/ProjectContext'
import { PresenceProvider } from '../(context)/OnlineMembers'
import { NotificationProvider } from '../(context)/Notfication'
import DriverManager from '@/components/DriverJS/DriverManager'
import { Toaster } from 'sonner'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ProjectProvider>
                <PresenceProvider>
                    <NotificationProvider>
                        <DriverManager />
                        {children}
                        <Toaster position="top-right" richColors closeButton />
                    </NotificationProvider>
                </PresenceProvider>
            </ProjectProvider>
        </ThemeProvider >
    )
}
