"use client"

import { createContext, useContext, useEffect, useState } from "react"
import axios from "../../config/axiosConfig"
import { useSearchParams, useRouter } from "next/navigation"
import { SuccessNotify, WarningNotify } from "@/utils/toastUtils"
import { User } from "@/utils/IUser"

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
console.log(user)
    useEffect(() => {
        const success = searchParams.get("success")

        if (success === "false") {
            WarningNotify("Signin via Google failed")
            return
        }

        if (success === "true") {
            SuccessNotify("Signin via Google successful")
            router.replace("/project")
            return
        }

        const fetchUser = async () => {
            try {
                const response = await axios.get(`/users/infor`)
                if (response.data) {
                    setUser(response.data)
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchUser()
    }, [searchParams])

    const signinGG = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get("email");
        const projectId = urlParams.get("projectId")

        let apiUrl = "http://localhost:5144/users/signin-google";
        if (email) {
            apiUrl += `?email=${email}&projectId=${projectId}`;
        }

        window.location.href = apiUrl;
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
