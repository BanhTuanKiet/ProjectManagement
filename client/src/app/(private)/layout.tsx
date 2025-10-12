import { ThemeProvider } from '../(context)/ThemeContext'
import { ProjectProvider } from '../(context)/ProjectContext'
import { PresenceProvider } from '../(context)/OnlineMembers'
import { NotificationProvider } from '../(context)/Notfication'

export default function layout({ children }: { children: React.ReactNode }) {
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
