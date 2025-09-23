"use client"

import { SWRConfig } from "swr"
import { fetcher } from "@/config/fetchConfig"
import { PresenceProvider } from "./OnlineMembers";
import { NotificationProvider } from "./Notfication";

type FetcherError = Error & {
    status?: number
    info?: unknown
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                onError: (error, key) => {
                    console.error(`SWR Error in ${key}:`, error)

                    //   if ((error as FetcherError).status === 401) {
                    //     setTimeout(() => {
                    //       window.location.href = '/'
                    //     }, 1500)
                    //   }
                },
                onSuccess: (data) => {
                    // console.log(data)
                }
            }}
        >
            {/* <AuthProvider> */}
            <PresenceProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </PresenceProvider>
            {/* </AuthProvider> */}
        </SWRConfig>
    )
}
