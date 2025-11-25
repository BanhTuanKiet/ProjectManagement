// "use client"

// import { useState, useEffect } from "react"
// import axios from "axios"
// import type { BasicTask } from "@/utils/ITask"

// type Props = {
//     open: boolean
//     onClose: () => void
//     projectId: number | string
//     task?: BasicTask | null
//     currentUserEmail?: string // optional if you want show sender
// }

// export default function TaskSupport({ open, onClose, projectId, task, currentUserEmail }: Props) {
//     const [content, setContent] = useState("")
//     const [sending, setSending] = useState(false)
//     const [result, setResult] = useState<string | null>(null)

//     useEffect(() => {
//         if (!open) {
//             setContent("")
//             setResult(null)
//         } else {
//             setResult(null)
//         }
//     }, [open])

//     if (!open || !task) return null

//     const now = new Date()
//     const deadline = task.deadline ? new Date(task.deadline) : null
//     const daysLeft = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
//     const isExpired = deadline ? deadline < now : false
//     const isNear = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0

//     const severityStyle = isExpired ? "text-red-700 bg-red-50 p-2 rounded" : isNear ? "text-yellow-800 bg-yellow-50 p-2 rounded" : "text-gray-700"

//     const handleSend = async () => {
//         if (!task) return
//         setSending(true)
//         setResult(null)
//         try {
//             // NOTE: user asked axios.post("tasks/support/${projectId}/${taskId}/{email}")
//             // We'll POST to our backend endpoint, payload contains content and optional from.
//             const toEmail = task.assignee ? task.assignee : "" // assumes Assignee field contains email or name; adjust accordingly
//             const url = `/api/tasks/support/${projectId}/${task.taskId}/${encodeURIComponent(toEmail)}`
//             const payload = { content }
//             const res = await axios.post(url, payload)
//             setResult("Gửi thành công")
//         } catch (err: any) {
//             console.error(err)
//             setResult(err?.response?.data?.message ?? "Lỗi khi gửi")
//         } finally {
//             setSending(false)
//         }
//     }

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//             <div className="relative max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 z-10">
//                 <div className="flex items-start justify-between gap-4">
//                     <div>
//                         <h3 className="text-lg font-semibold">{task.title}</h3>
//                         <p className="text-sm text-gray-500">{task.description}</p>
//                     </div>
//                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
//                 </div>

//                 <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
//                     <div>
//                         <div className="text-xs text-gray-500">Assignee</div>
//                         <div className="font-medium">{task.assignee ?? task.assigneeId ?? "Không có"}</div>
//                     </div>
//                     <div>
//                         <div className="text-xs text-gray-500">Priority</div>
//                         <div className="font-medium">{task.priority}</div>
//                     </div>

//                     <div>
//                         <div className="text-xs text-gray-500">Deadline</div>
//                         <div className={severityStyle}>
//                             {task.deadline ? new Date(task.deadline).toLocaleString() : "Không có hạn"}
//                             {isExpired ? " — Đã quá hạn" : isNear ? ` — Còn ~${daysLeft} ngày` : ""}
//                         </div>
//                     </div>

//                     <div>
//                         <div className="text-xs text-gray-500">Created by</div>
//                         <div className="font-medium">{task.createdName ?? task.createdBy}</div>
//                     </div>
//                 </div>

//                 <div className="mt-4">
//                     <div className="text-xs text-gray-500">Nội dung</div>
//                     <textarea
//                         value={content}
//                         onChange={(e) => setContent(e.target.value)}
//                         rows={6}
//                         className="mt-1 w-full border rounded p-2 text-sm"
//                         placeholder={isExpired ? "Ghi rõ vấn đề và yêu cầu hỗ trợ (ví dụ: nguyên nhân, ảnh, log...)" : "Viết nội dung muốn gửi..."}
//                     />
//                 </div>

//                 <div className="mt-4 flex items-center justify-between">
//                     <div className="text-sm text-gray-500">
//                         {isExpired ? <span className="text-red-600 font-medium">Task đã hết hạn</span> : isNear ? <span className="text-yellow-700 font-medium">Gần hết hạn</span> : <span>Không khẩn cấp</span>}
//                     </div>

//                     <div className="flex items-center gap-2">
//                         {result && <div className="text-sm text-gray-600">{result}</div>}
//                         <button
//                             onClick={handleSend}
//                             disabled={sending || content.trim().length === 0}
//                             className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//                         >
//                             {sending ? "Đang gửi..." : "Send"}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }


"use client"

import { useState, useEffect } from "react"
import axios from '@/config/axiosConfig'
import type { BasicTask } from "@/utils/ITask"

type Props = {
    open: boolean
    onClose: () => void
    projectId: number | string
    task?: BasicTask | null
    // Cần truyền thông tin User hiện tại nếu backend cần để xác định Role
    currentUserId: string // Giả định ID của người gửi (Leader/PM)
}

export default function TaskSupport({ open, onClose, projectId, task, currentUserId }: Props) {
    const [content, setContent] = useState("")
    const [sending, setSending] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    useEffect(() => {
        if (!open) {
            setContent("")
            setResult(null)
        } else {
            setResult(null)
        }
    }, [open])

    if (!open || !task) return null

    const now = new Date()
    const deadline = task.deadline ? new Date(task.deadline) : null
    // Tính toán lại daysLeft để tránh lỗi khi deadline bị null
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    const isExpired = deadline ? deadline < now : false
    const isNear = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0

    const severityStyle = isExpired
        ? "text-red-700 bg-red-50 p-2 rounded font-semibold"
        : isNear
            ? "text-yellow-800 bg-yellow-50 p-2 rounded font-semibold"
            : "text-gray-700 font-medium"

    const handleSend = async () => {
        if (!task || content.trim().length === 0) return
        setSending(true)
        setResult(null)
        try {
            // Cấu trúc URL được sửa thành: /api/tasks/support/{projectId}/{taskId}
            // Thông tin người nhận và nội dung sẽ được gửi trong Payload.
            const url = `/tasks/support/${projectId}/${task.taskId}`

            // Payload gửi lên Backend, sử dụng cấu trúc tương ứng với SupportRequestModel
            const payload = {
                content: content,
                assigneeId: task.assigneeId ?? "", // ID của người được giao task
                assignee: task.assignee ?? "", // Tên/Email hiển thị của người được giao
            }

            const res = await axios.post(url, payload)

            setResult("Gửi thành công!")
            // Đóng dialog sau khi gửi thành công (tùy chọn)
            // setTimeout(onClose, 1500) 
        } catch (err) {
            console.error("Lỗi gửi email hỗ trợ:", err)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative max-w-2xl w-full bg-white rounded-lg shadow-2xl p-6 z-10 animate-fade-in">
                <div className="flex items-start justify-between gap-4 border-b pb-3 mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-blue-600">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Hàng 1 */}
                    <div>
                        <div className="text-xs text-gray-500">Assignee</div>
                        <div className="font-medium text-gray-800">{task.assignee ?? task.assigneeId ?? "Không có"}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Priority</div>
                        <div className="font-medium text-gray-800">{task.priority}</div>
                    </div>

                    {/* Hàng 2 */}
                    <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Deadline</div>
                        <div className={severityStyle}>
                            {task.deadline ? new Date(task.deadline).toLocaleString() : "Không có hạn"}
                            {isExpired ? " — ĐÃ QUÁ HẠN" : isNear ? ` — CÒN ~${daysLeft} NGÀY` : ""}
                        </div>
                    </div>

                    {/* Hàng 3 */}
                    <div>
                        <div className="text-xs text-gray-500">Created by</div>
                        <div className="font-medium text-gray-800">{task.createdName ?? task.createdBy}</div>
                    </div>
                </div>

                <div className="mt-6 border-t pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Nội dung Góp ý/Yêu cầu Hỗ trợ</div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder={isExpired ? "Ghi rõ vấn đề, nguyên nhân quá hạn và yêu cầu hỗ trợ cụ thể..." : "Viết nội dung muốn gửi hỏi về tiến độ (ví dụ: Bạn có đang gặp khó khăn gì không?)..."}
                    />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                        {isExpired
                            ? <span className="text-red-600 font-bold">CẦN XỬ LÝ KHẨN</span>
                            : isNear ? <span className="text-yellow-700 font-bold">GẦN ĐẾN HẠN</span>
                                : <span className="text-gray-500">Bình thường</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        {result && <div className={`text-sm ${result.includes("thành công") ? 'text-green-600' : 'text-red-600'}`}>{result}</div>}
                        <button
                            onClick={handleSend}
                            disabled={sending || content.trim().length === 0}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {sending ? "Đang gửi..." : "Gửi"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
