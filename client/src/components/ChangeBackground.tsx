"use client"

import { useState } from "react"
import { useTheme } from "@/app/(context)/ThemeContext"
import { Button } from "@/components/ui/button"

const colors49 = [
  // Gray
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b",
  // Red
  "#fff5f5", "#ffe3e3", "#ffc9c9", "#ffa8a8", "#ff8787", "#ff6b6b", "#fa5252",
  // Orange
  "#fff4e6", "#ffe8cc", "#ffd8a8", "#ffc078", "#ffa94d", "#ff922b", "#fd7e14",
  // Yellow
  "#fff9db", "#fff3bf", "#ffec99", "#ffe066", "#ffd43b", "#fcc419", "#fab005",
  // Green
  "#ebfbee", "#d3f9d8", "#b2f2bb", "#8ce99a", "#69db7c", "#51cf66", "#40c057",
  // Blue
  "#e7f5ff", "#d0ebff", "#a5d8ff", "#74c0fc", "#4dabf7", "#339af0", "#228be6",
  // Purple
  "#f3f0ff", "#e5dbff", "#d0bfff", "#b197fc", "#9775fa", "#845ef7", "#7950f2",
]

export default function BackgroundPicker({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { backgroundColor, changeBackgroundColor } = useTheme()

  // user chọn tạm
  const [selectedColor, setSelectedColor] = useState(backgroundColor)

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold">Choose background color (49 colors)</h2>

      {/* Grid 7 x 7 */}
      <div className="grid grid-cols-7 gap-2">
        {colors49.map((color) => (
          <button
            key={color}
            className={`
              h-10 w-10 rounded-full border transition-all hover:scale-110
              ${selectedColor === color
                ? "border-blue-600 ring-2 ring-blue-300"
                : "border-gray-300"
              }
            `}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
            type="button"
          />
        ))}
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
        <div
          className="h-20 rounded-md border transition-colors"
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      <Button
        className="w-full rounded-lg mt-4"
        onClick={() => {
          changeBackgroundColor(selectedColor)
          setOpen(false)
        }}
      >
        Accept
      </Button>
    </div>
  )
}

