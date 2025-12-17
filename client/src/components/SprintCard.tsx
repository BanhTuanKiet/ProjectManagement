"use client"
import { useState } from "react"
import { CircleAlert } from "lucide-react"

interface SprintCardProps {
  onCreate: (name: string, startDate: string, endDate: string) => Promise<void>
  onClose: () => void
  showForm: boolean
}

export default function SprintCard({ onCreate, onClose, showForm }: SprintCardProps) {
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateClick = async () => {
    if (!name.trim()) return setError("Sprint name is required.")
    if (!startDate) return setError("Start date is required.")
    if (!endDate) return setError("End date is required.")
    if (new Date(startDate) > new Date(endDate))
      return setError("The end date cannot be earlier than the start date.")

    setLoading(true)
    setError(null)

    try {
      await onCreate(name, startDate, endDate)

      setName("")
      setStartDate("")
      setEndDate("")
    } catch (err: any) {
      let message = "Failed to create sprint."

      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0]
        message = err.response.data.errors[firstKey][0]
      } else if (err.response?.data?.message) {
        message = err.response.data.message
      } else if (err.message) {
        message = err.message
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) return null

  return (
    <div className="fixed top-24 right-10 bg-white shadow-lg rounded-md p-4 w-80 z-20 border">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3">
          <CircleAlert className="w-5 h-5 text-red-600 shrink-0" />
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
          onClick={onClose}
          className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateClick}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  )
}