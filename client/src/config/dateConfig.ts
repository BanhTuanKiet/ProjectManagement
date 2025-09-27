export const getDeadlineStyle = (task: { dueDate?: string; status?: string }) => {
  if (!task.dueDate) {
    return { className: "text-gray-400", icon: null, container: "border border-gray-200" }
  }

  const due = new Date(task.dueDate) // có cả giờ phút giây
  const now = new Date()

  // ✅ Done
  if (task.status === "Done") {
    return {
      className: "text-green-600 font-medium flex items-center gap-1",
      icon: "✅",
      container: "border border-green-300 bg-green-50 rounded px-2 py-0.5"
    }
  }

  // ❌ Quá hạn (so full date-time)
  if (due.getTime() < now.getTime()) {
    return {
      className: "text-red-600 font-semibold flex items-center gap-1",
      icon: "⚠️",
      container: "border border-red-500 bg-red-50 rounded px-2 py-0.5"
    }
  }

  // ⚠️ Sắp hết hạn (≤ 2 ngày nữa)
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60) // số giờ còn lại
  if (diffHours <= 48) {
    return {
      className: "text-yellow-600 font-medium flex items-center gap-1",
      icon: "⚠️",
      container: "border border-yellow-400 bg-yellow-50 rounded px-2 py-0.5"
    }
  }

  // 🟢 Bình thường
  return {
    className: "flex items-center gap-1",
    icon: null,
  }
}
