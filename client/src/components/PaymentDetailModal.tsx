import { AdminPayment } from '@/utils/IPlan'
import { X } from 'lucide-react'


interface PaymentDetailModalProps {
    payment: AdminPayment | null
    open: boolean
    onClose: () => void
}


export function PaymentDetailModal({ payment, open, onClose }: PaymentDetailModalProps) {
    if (!open || !payment) return null


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Payment detail</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>


                {/* Content */}
                <div className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-medium">
                            {payment.amount.toLocaleString()} {payment.currency}
                        </span>
                    </div>


                    <div className="flex justify-between">
                        <span className="text-gray-500">Gateway</span>
                        <span>{payment.gateway}</span>
                    </div>


                    <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className="font-medium">{payment.status}</span>
                    </div>


                    <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ref</span>
                        <span className="text-right break-all">{payment.gatewayRef ?? '-'}</span>
                    </div>


                    <div className="flex justify-between">
                        <span className="text-gray-500">Created at</span>
                        <span>{new Date(payment.createdAt).toLocaleString()}</span>
                    </div>


                    {payment.description && (
                        <div>
                            <div className="text-gray-500 mb-1">Description</div>
                            <div className="bg-gray-50 border rounded-lg p-3 text-sm">
                                {payment.description}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}