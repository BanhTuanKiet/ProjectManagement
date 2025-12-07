"use client"

import { Trash2, AlertTriangle, ArrowDownToLine } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteSprintPopoverProps {
    sprintCount: number
    onConfirmDelete: () => void
    open: boolean
    setOpen: (open: boolean) => void
}

export default function DeleteSprintPopover({
    sprintCount,
    onConfirmDelete,
    open,
    setOpen,
}: DeleteSprintPopoverProps) {

    const handleConfirm = () => {
        onConfirmDelete()
        setOpen(false)
    }

    if (!open) return null

    return (
        <div className="fixed top-24 right-8 w-96 z-[60] animate-in slide-in-from-right-5 fade-in duration-300">
            <div className="rounded-lg shadow-2xl border border-red-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b bg-red-50 border-red-200">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-700">Xóa Sprint</span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4 text-gray-700 text-sm">
                    <p>
                        Bạn đang chọn xóa <span className="font-bold text-lg mx-1">{sprintCount}</span> sprint.
                    </p>

                    <div className="space-y-3">
                        {/* Cảnh báo xóa vĩnh viễn Sprint */}
                        <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-md flex gap-3 items-start text-xs">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>
                                <strong>Sprint này sẽ bị xóa vĩnh viễn.</strong> Bạn không thể khôi phục lại Sprint sau khi xóa.
                            </span>
                        </div>

                        {/* Thông báo chuyển task về Backlog */}
                        <div className="bg-blue-50 border border-blue-100 text-blue-700 p-3 rounded-md flex gap-3 items-start text-xs">
                            <ArrowDownToLine className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>
                                Các <strong>Work Items (Tasks)</strong> trong Sprint sẽ <strong>KHÔNG</strong> bị xóa. Chúng sẽ được chuyển tự động về <strong>Backlog</strong>.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="bg-white hover:bg-gray-100"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700"
                        onClick={handleConfirm}
                    >
                        <Trash2 className="h-4 w-4" />
                        Xóa Sprint
                    </Button>
                </div>
            </div>
        </div>
    )
}