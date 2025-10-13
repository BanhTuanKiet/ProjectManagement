"use client"

import { createContext, useContext, useEffect, useState } from "react"
import axios from "../../config/axiosConfig"
import { useSearchParams, useRouter } from "next/navigation"
import { SuccessNotify, WarningNotify } from "@/utils/toastUtils"
import type { User } from "@/utils/IUser"

type UserContextType = {
    user: User | null
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    signinGG: () => void
    handleSignout: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => { },
    signinGG: () => { },
    handleSignout: async () => { },
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()
    
    useEffect(() => {
        const success = searchParams.get("success")

        if (success === "false") return WarningNotify("Signin via Google failed")
        if (success === "true") SuccessNotify("Signin via Google successful")

        const fetchUser = async () => {
            try {
                const response = await axios.get(`/users/infor`)
                console.log(response.data)
                if (response.data) {
                    setUser(response.data)
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchUser()
        router.replace("/project")
    }, [router, searchParams])

    const signinGG = () => {
        console.log("signin")
        window.location.href = "http://localhost:5144/users/signin-google"
    }

    const handleSignout = async () => {
        try {
            await axios.get(`/users/signout`)
            setUser(null)
            setTimeout(() => {
                window.location.href = "/"
            }, 500)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                signinGG,
                handleSignout,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)
