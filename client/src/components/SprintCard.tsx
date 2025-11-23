"use client"
import { useState } from "react"
import axios from "@/config/axiosConfig"
import { useProject } from "@/app/(context)/ProjectContext"
import { CircleAlert, Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import error from "@/app/error"

interface SprintCardProps {
  onCreate: (name: string, startDate: string, endDate: string) => Promise<void>
  onClose: () => void
  showForm: boolean
}

// Chỉ cần truyền props vào, không cần logic API
export default function SprintCard({ onCreate, onClose, showForm }: SprintCardProps) {
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateClick = async () => {
    if (!name.trim()) return setError("Vui lòng nhập tên Sprint")
    if (!startDate) return setError("Vui lòng chọn ngày bắt đầu")
    if (!endDate) return setError("Vui lòng chọn ngày kết thúc")
    if (new Date(startDate) > new Date(endDate))
      return setError("Ngày kết thúc phải lớn hơn ngày bắt đầu")
    setLoading(true)
    setError(null)
    // Gọi hàm của cha
    await onCreate(name, startDate, endDate)

    // Reset local form
    setLoading(false)
    setName("")
    setStartDate("")
    setEndDate("")
  }

  if (!showForm) return null

  return (
    <div className="fixed top-24 right-10 bg-white shadow-lg rounded-md p-4 w-80 z-20 border">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3">
          {/* Chọn 1 trong 2 dòng dưới đây */}

          {/* Option 1: Dấu chấm than (Khuyên dùng cho lỗi nhập liệu) */}
          <CircleAlert className="w-5 h-5 text-red-600 shrink-0" />

          {/* Option 2: Dấu X (Dùng nếu muốn báo lỗi nghiêm trọng hơn) */}
          {/* <CircleX className="w-5 h-5 text-red-600 shrink-0" /> */}

          <span className="text-sm text-red-600 font-medium leading-tight">
            {error}
          </span>
        </div>
      )}
      <h3 className="text-sm font-semibold mb-2">Create new Sprint</h3>
      <input
        type="text"
        placeholder="Sprint name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded px-2 py-1 mb-2 text-sm"
      />
      <div className="flex gap-2 mb-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-1/2 border rounded px-2 py-1 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-1/2 border rounded px-2 py-1 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose} // Dùng hàm onClose từ props
          className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateClick} // Đổi tên hàm
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  )
}