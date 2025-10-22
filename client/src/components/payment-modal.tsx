"use client"
import { useState } from "react"
import { X } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  planPrice: string
}

export default function PaymentModal({ isOpen, onClose, planName, planPrice }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "paypal" | null>(null)

  const handlePayment = (method: "vnpay" | "paypal") => {
    setSelectedMethod(method)
    // Redirect to payment page or process payment
    const paymentUrl =
      method === "vnpay"
        ? `/checkout?plan=${planName}&method=vnpay&price=${planPrice}`
        : `/checkout?plan=${planName}&method=paypal&price=${planPrice}`
    window.location.href = paymentUrl
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Chọn phương thức thanh toán</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Gói</p>
            <p className="text-2xl font-bold text-gray-900">{planName}</p>
            <p className="text-lg font-semibold text-blue-600 mt-2">{planPrice}</p>
          </div>

          {/* VNPay Option */}
          <button
            onClick={() => handlePayment("vnpay")}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-3"
          >
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">VNPay</p>
              <p className="text-sm text-gray-600">Thanh toán qua VNPay</p>
            </div>
            <div className="text-2xl">💳</div>
          </button>

          {/* PayPal Option */}
          <button
            onClick={() => handlePayment("paypal")}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-3"
          >
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">PayPal</p>
              <p className="text-sm text-gray-600">Thanh toán qua PayPal</p>
            </div>
            <div className="text-2xl">🅿️</div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}
