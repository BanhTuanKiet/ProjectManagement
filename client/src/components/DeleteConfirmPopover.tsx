"use client"

import { Trash2, AlertTriangle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteConfirmPopoverProps {
    taskCount: number
    subtaskCount?: number // Optional vì TrashView không cần đếm subtask
    onConfirmDelete: () => void
    open: boolean
    setOpen: (open: boolean) => void
    isPermanent?: boolean // Prop mới để xác định loại xóa
}

export default function DeleteConfirmPopover({
    taskCount,
    subtaskCount = 0,
    onConfirmDelete,
    open,
    setOpen,
    isPermanent = false // Mặc định là xóa thường (soft delete)
}: DeleteConfirmPopoverProps) {

    const handleConfirm = () => {
        onConfirmDelete()
        setOpen(false)
    }

    if (!open) return null

    return (
        // Giữ nguyên vị trí hiển thị góc trên phải như bạn muốn
        <div className="fixed top-24 right-8 w-96 z-[60] animate-in slide-in-from-right-5 fade-in duration-300">
            <div className="rounded-lg shadow-2xl border border-red-200 bg-white overflow-hidden">
                {/* Header */}
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${isPermanent ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    {isPermanent ? <Ban className="h-5 w-5 text-red-600" /> : <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    <span className={`font-bold ${isPermanent ? 'text-red-700' : 'text-gray-800'}`}>
                        {isPermanent ? "Permanently delete" : "Confirm deletion"}
                    </span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4 text-gray-700 text-sm">
                    <p>
                        You are selecting to delete <span className="font-bold text-lg mx-1">{taskCount}</span> task(s).
                    </p>

                    {/* Logic hiển thị cảnh báo dựa trên loại xóa */}
                    {isPermanent ? (
                        // Cảnh báo cho Trash View (Xóa vĩnh viễn)
                        <div className="bg-red-100 border border-red-200 text-red-800 p-3 rounded-md flex gap-3 items-start text-xs">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>
                                <strong>WARNING:</strong> This action will permanently delete data from the system and <strong>CAN NOT</strong> be recovered. Please be sure before proceeding.
                            </span>
                        </div>
                    ) : (
                        // Cảnh báo cho List View (Xóa mềm & Subtask)
                        <>
                            {subtaskCount > 0 ? (
                                <div className="bg-orange-50 border border-orange-100 text-orange-800 p-3 rounded-md flex gap-3 items-start text-xs">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>
                                        Yes <strong>{subtaskCount}</strong> subtasks will be permanently deleted. The parent task can be restored from the trash, but the subtasks cannot.
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-100 text-blue-700 p-3 rounded-md flex gap-3 items-start text-xs">
                                    <span className="shrink-0">ℹ️</span>
                                    <span>This task will be moved to the trash and can be restored later.</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="bg-white hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className={`flex items-center gap-1.5 ${isPermanent ? 'bg-red-700 hover:bg-red-800' : ''}`}
                        onClick={handleConfirm}
                    >
                        <Trash2 className="h-4 w-4" />
                        {isPermanent ? "Permanently delete" : "Delete now"}
                    </Button>
                </div>
            </div>
        </div>
    )
}