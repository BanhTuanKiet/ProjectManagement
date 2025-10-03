"use client"

import { useRouter } from "next/dist/client/components/navigation"
import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  backgroundColor: string
  changeBackgroundColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const router = useRouter()

  // Load từ localStorage khi app mở lại
  useEffect(() => {
    const saved = localStorage.getItem("projectBackground")
    if (saved) {
      setBackgroundColor(saved)
      // document.body.style.backgroundColor = saved
      document.documentElement.style.setProperty(
      "--app-background",
      saved,
      "important" // <- thêm !important
    )
    }
  }, [])

  const changeBackgroundColor = (color: string) => {
    setBackgroundColor(color)
    // document.body.style.backgroundColor = color
    document.documentElement.style.setProperty(
    "--app-background",
    color,
    "!important"
  )
    localStorage.setItem("projectBackground", color)
    router.refresh()
  }

  return (
    <ThemeContext.Provider value={{ backgroundColor, changeBackgroundColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
