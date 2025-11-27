"use client"
import { useState } from "react"
import { X, CreditCard, Wallet } from 'lucide-react'

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    planName: string
    planPrice: string
}

export default function PaymentModal({ isOpen, onClose, planName, planPrice }: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "paypal" | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handlePayment = (method: "vnpay" | "paypal") => {
        setIsLoading(true)
        setSelectedMethod(method)
        const paymentUrl =
            method === "vnpay"
                ? `/checkout?plan=${planName}&method=vnpay&price=${planPrice}`
                : `/checkout?plan=${planName}&method=paypal&price=${planPrice}`
        setTimeout(() => {
            window.location.href = paymentUrl
        }, 500)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-white">Chọn phương thức thanh toán</h2>
                    <p className="text-blue-100 text-sm mt-1">Hoàn tất thanh toán của bạn</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Plan Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Gói của bạn</p>
                        <div className="flex items-baseline justify-between mt-3">
                            <p className="text-2xl font-bold text-gray-900">{planName}</p>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-blue-600">{planPrice}</p>
                                <p className="text-xs text-gray-600 mt-1">một lần</p>
                            </div>
                        </div>
                    </div>

                    {/* PayPal Option */}
                    <button
                        onClick={() => handlePayment("paypal")}
                        disabled={isLoading}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${selectedMethod === "paypal"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900">PayPal</p>
                            <p className="text-sm text-gray-600">Tài khoản PayPal của bạn</p>
                        </div>
                        {selectedMethod === "paypal" && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                        )}
                    </button>
                </div>

                {/* Security Info */}
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                    <div className="text-lg">🔒</div>
                    <p>Thanh toán của bạn được bảo vệ bởi mã hóa SSL</p>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Hủy
                </button>
                <button
                    onClick={() => selectedMethod && handlePayment(selectedMethod)}
                    disabled={!selectedMethod || isLoading}
                    className={`flex-1 px-4 py-2.5 font-medium rounded-lg transition-all duration-200 ${selectedMethod && !isLoading
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                </button>
            </div>
        </div>
    )
}