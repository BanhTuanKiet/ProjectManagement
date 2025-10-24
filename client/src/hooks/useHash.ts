"use client"

import { useEffect, useState } from "react"

export function useHash(defaultValue: string = "") {
    const [hash, setHash] = useState<string>("")

    useEffect(() => {
        const currentHash = window.location.hash.replace("#", "")
        setHash(currentHash || defaultValue)
    }, [defaultValue])

    useEffect(() => {
        const handleHashChange = () => {
            const newHash = window.location.hash.replace("#", "")
            setHash(newHash || defaultValue)
        }
        
        window.addEventListener("hashchange", handleHashChange)
        return () => window.removeEventListener("hashchange", handleHashChange)
    }, [defaultValue])

    const updateHash = (newHash: string) => {
        if (!newHash) {
            history.pushState(null, "", window.location.pathname)
        } else {
            history.pushState(null, "", `${window.location.pathname}#${newHash}`)
        }
        setHash(newHash)
    }

    return { hash, setHash: updateHash }
}
