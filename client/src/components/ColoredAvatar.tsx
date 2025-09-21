"use client"

import { usePresence } from "@/app/.context/OnlineMembers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Tạo màu từ string bằng cách hash vào mảng màu
const stringToColor = (str: string) => {
  const colors = [
    "#E57373",
    "#64B5F6",
    "#81C784",
    "#FFD54F",
    "#BA68C8",
    "#4DB6AC",
    "#FF8A65",
    "#9575CD",
    "#F06292",
    "#7986CB",
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export default function ColoredAvatar({
  id,
  name = "",
  src,
  initials,
  size = "sm",
  showOnlineStatus = true,
}: {
  id: string
  name?: string
  src?: string
  initials?: string
  size?: "sm" | "md" | "lg"
  showOnlineStatus?: boolean
}) {
  const { onlineUsers } = usePresence()

  const isOnline = onlineUsers?.includes(id) || false

  const fallbackInitials =
    initials ||
    (name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?")

  // Luôn tạo ra 1 màu ổn định cho từng user, không cần cache
  const bgColor = stringToColor(name || "?")

  const sizeClasses = size === "sm" ? "h-6 w-6 text-xs" : size === "md" ? "h-8 w-8 text-sm" : "h-12 w-12 text-base"

  const indicatorSize = "h-2.5 w-2.5"

  const indicatorPosition =
    size === "sm" ? "-top-0.5 -right-0.5" : size === "md" ? "-top-0.5 -right-0.5" : "-top-1 -right-1"

  return (
    <div className="relative inline-block" title={`${name} is ${isOnline ? "online" : "offline"}`}>
      <Avatar className={sizeClasses}>
        {src && <AvatarImage src={src || "/placeholder.svg"} alt={name} />}
        <AvatarFallback style={{ backgroundColor: bgColor, color: "white" }}>{fallbackInitials}</AvatarFallback>
      </Avatar>

      {showOnlineStatus && isOnline && (
        <div
          className={`absolute ${indicatorPosition} ${indicatorSize} bg-green-500 border-2 border-white rounded-full`}
        />
      )}
    </div>
  )
}
