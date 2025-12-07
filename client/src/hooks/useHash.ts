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
