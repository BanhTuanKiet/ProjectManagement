"use client"

import { usePresence } from "@/app/(context)/OnlineMembers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const stringToColor = (str: string) => {
    const colors = [
        "#E57373", "#64B5F6", "#81C784", "#FFD54F",
        "#BA68C8", "#4DB6AC", "#FF8A65", "#9575CD",
        "#F06292", "#7986CB",
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
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
    size?: "sm" | "md" | "lg" | "xl" | "xxl"
    showOnlineStatus?: boolean
}) {
    const { onlineUsers } = usePresence()
    const isOnline = (onlineUsers[id] && onlineUsers[id].userId === id) || false

    const fallbackInitials =
        initials ||
        (name
            ? name.split(" ").map((n) => n[0]).join("").toUpperCase()
            : "?")

    const bgColor = stringToColor(name || "?")

    const sizeClasses =
        size === "sm" ? "h-6 w-6 text-xs" :
            size === "md" ? "h-8 w-8 text-sm" :
                size === "lg" ? "h-12 w-12 text-base" :
                    size === "xl" ? "h-16 w-16 text-lg" :
                        "h-24 w-24 text-xl" // xxl

    const indicatorSize =
        size === "sm" ? "h-2.5 w-2.5" :
            size === "md" ? "h-3.5 w-3.5" :
                size === "lg" ? "h-5 w-5" :
                    size === "xl" ? "h-6 w-6" :
                        "h-8 w-8" // xxl

    const indicatorPosition =
        size === "sm" ? "-top-0.5 -right-0.5" :
            size === "md" ? "-top-0.5 -right-0.5" :
                size === "lg" ? "-top-1 -right-1" :
                    size === "xl" ? "-top-1.5 -right-1.5" :
                        "-top-2.5 -right-2.5" // xxl

    return (
        <div
            className="relative inline-block shrink-0"
            title={`${name} is ${isOnline ? "online" : "offline"}`}
        >
            <Avatar className={`${sizeClasses} aspect-square`}>
                {src && (
                    <AvatarImage
                        src={src || "/placeholder.svg"}
                        alt={name}
                        // Thay đổi từ object-cover sang object-contain
                        // để ảnh không bị cắt và giữ nguyên tỉ lệ
                        // Background của AvatarFallback sẽ lấp đầy phần trống
                        className="h-full w-full object-cover"
                    />
                )}
                {/* Đặt AvatarFallback luôn hiển thị làm nền để lấp đầy khoảng trống khi object-contain */}
                <AvatarFallback
                    // Dùng màu nền để lấp đầy khoảng trống
                    style={{ backgroundColor: bgColor, color: "white" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {fallbackInitials}
                </AvatarFallback>
            </Avatar>

            {showOnlineStatus && isOnline && size !== "xxl" && (
                <div
                    className={`absolute ${indicatorPosition} ${indicatorSize} bg-green-500 border-2 border-white rounded-full`}
                />
            )}
        </div>
    )
}