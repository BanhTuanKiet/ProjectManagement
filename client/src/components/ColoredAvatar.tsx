"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ColoredAvatar({
  name = "",
  src,
  initials,
  size = "sm",
}: {
  name?: string;
  src?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
}) {
  const fallbackInitials =
    initials ||
    (name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?");

  // Luôn tạo ra 1 màu ổn định cho từng user, không cần cache
  const bgColor = stringToColor(name || "?");

  const sizeClasses =
    size === "sm"
      ? "h-6 w-6 text-xs"
      : size === "md"
      ? "h-8 w-8 text-sm"
      : "h-12 w-12 text-base";

  return (
    <Avatar className={sizeClasses}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback style={{ backgroundColor: bgColor, color: "white" }}>
        {fallbackInitials}
      </AvatarFallback>
    </Avatar>
  );
}
