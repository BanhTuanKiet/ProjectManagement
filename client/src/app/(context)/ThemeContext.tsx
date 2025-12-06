"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  backgroundColor: string
  changeBackgroundColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")

  useEffect(() => {
    const saved = localStorage.getItem("projectBackground")
    const color = saved || "#ffffff"

    setBackgroundColor(color)
    document.documentElement.style.setProperty("--app-background", color)
  }, [])

  const changeBackgroundColor = (color: string) => {
    setBackgroundColor(color)
    document.documentElement.style.setProperty("--app-background", color)
    localStorage.setItem("projectBackground", color)
  }

  return (
    <ThemeContext.Provider value={{ backgroundColor, changeBackgroundColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
