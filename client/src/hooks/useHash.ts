// "use client"

// import { useEffect, useState } from "react"

// export function useHash(defaultValue: string = "") {
//     const [hash, setHash] = useState<string>("")

//     useEffect(() => {
//         const currentHash = window.location.hash.replace("#", "")
//         setHash(currentHash || defaultValue)
//     }, [defaultValue])

//     useEffect(() => {
//         const handleHashChange = () => {
//             const newHash = window.location.hash.replace("#", "")
//             setHash(newHash || defaultValue)
//         }
        
//         window.addEventListener("hashchange", handleHashChange)
//         return () => window.removeEventListener("hashchange", handleHashChange)
//     }, [defaultValue])

//     const updateHash = (newHash: string) => {
//         if (!newHash) {
//             history.pushState(null, "", window.location.pathname)
//         } else {
//             history.pushState(null, "", `${window.location.pathname}#${newHash}`)
//         }
//         setHash(newHash)
//     }

//     return { hash, setHash: updateHash }
// }

"use client"

import { useEffect, useState } from "react"

export function useHash(defaultValue: string = "") {
  const [hash, setHashState] = useState<string>("")
  const [params, setParams] = useState<Record<string, string>>({})

  const parseHash = () => {
    const rawHash = decodeURIComponent(window.location.hash.replace("#", "")) || defaultValue
    const [tab, queryString] = rawHash.split("?")
    const paramObj: Record<string, string> = {}

    if (queryString) {
      const searchParams = new URLSearchParams(queryString)
      searchParams.forEach((value, key) => {
        paramObj[key] = value
      })
    }

    setHashState(tab)
    setParams(paramObj)
  }

  useEffect(() => {
    parseHash()
  }, [defaultValue])

  useEffect(() => {
    const handleHashChange = () => {
      parseHash()
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const setHash = (tab: string, newParams?: Record<string, string>) => {
    const paramString = newParams
      ? Object.entries(newParams)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
      : ""
    const fullHash = paramString ? `${tab}?${paramString}` : tab
    history.pushState(null, "", `${window.location.pathname}#${fullHash}`)
    setHashState(tab)
    setParams(newParams || {})
  }

  return { hash, params, setHash }
}
