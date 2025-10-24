"use client"

import { useState } from "react"
import { Check, Lock, ArrowRight } from "lucide-react"
import PricingTable from "@/components/pricing-table"

export default function PlanPaymentPage() {
    const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "paypal">("vnpay")
    const [isLoading, setIsLoading] = useState(false)

    const paymentMethods = [
        {
            id: "vnpay",
            name: "VNPay",
            description: "Thẻ ngân hàng, ví điện tử",
            logo: (
                <img
                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png"
                    alt="VNPay"
                    className="h-10 w-auto object-contain"
                />
            ),
        },
        {
            id: "paypal",
            name: "PayPal",
            description: "Tài khoản PayPal của bạn",
            logo: (
                <img
                    src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
                    alt="PayPal"
                    className="h-10 w-auto object-contain"
                />
            ),
        },
    ]

    const handlePayment = async () => {
        setIsLoading(true)
        const paymentUrl = `/checkout?method=${selectedMethod}`
        setTimeout(() => {
            window.location.href = paymentUrl
        }, 500)
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                                <span className="text-lg font-bold text-white">P</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                ProjectHub
                            </span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                                Tính năng
                            </a>
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                                Giá
                            </a>
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                                Hỗ trợ
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                {/* Section Title */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Chọn gói của bạn</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Nâng cấp để mở khóa các tính năng mạnh mẽ và tăng năng suất của bạn
                    </p>
                </div>

                <div className="mb-16 bg-white rounded-2xl border border-slate-200 py-6 shadow-sm">
                    <PricingTable />
                </div>

                {/* Payment Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Methods Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Phương thức thanh toán</h2>
                                <p className="text-sm text-slate-600">Chọn cách bạn muốn thanh toán</p>
                            </div>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => {
                                    const isSelected = selectedMethod === method.id

                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id as "vnpay" | "paypal")}
                                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${isSelected
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${isSelected ? "bg-white" : "bg-slate-100 group-hover:bg-blue-100"
                                                        }`}
                                                >
                                                    {method.logo}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-900">{method.name}</p>
                                                    <p className="text-xs text-slate-600">{method.description}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Security Info */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-green-900 text-sm">Thanh toán an toàn</p>
                                        <p className="text-xs text-green-700 mt-1">Mã hóa SSL 256-bit. Không lưu thông tin thẻ.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        Tiếp tục thanh toán
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8">Tóm tắt đơn hàng</h3>

                            <div className="space-y-6">
                                {/* Order Items */}
                                <div className="space-y-4 pb-6 border-b border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900">Gói Professional</p>
                                            <p className="text-sm text-slate-600">Thanh toán hàng tháng</p>
                                        </div>
                                        <p className="font-semibold text-slate-900">$79.00</p>
                                    </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Giá gốc</span>
                                        <span className="text-slate-900 font-medium">$79.00</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Thuế (0%)</span>
                                        <span className="text-slate-900 font-medium">$0.00</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-900">Tổng cộng</span>
                                        <span className="text-3xl font-bold text-blue-600">$79.00</span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2">Bạn sẽ được tính phí vào ngày 15 tháng 12</p>
                                </div>

                                {/* Features List */}
                                <div className="pt-6 border-t border-slate-200">
                                    <p className="text-sm font-semibold text-slate-900 mb-4">Bạn sẽ nhận được:</p>
                                    <ul className="space-y-3">
                                        {[
                                            "Dự án không giới hạn",
                                            "500GB lưu trữ",
                                            "Hỗ trợ ưu tiên 24/7",
                                            "API truy cập",
                                            "Tích hợp tùy chỉnh",
                                        ].map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-sm text-slate-700">
                                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Guarantee */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <p className="text-sm text-amber-900">
                                        <span className="font-semibold">Đảm bảo hoàn tiền 30 ngày.</span> Nếu bạn không hài lòng, chúng tôi
                                        sẽ hoàn lại tiền của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
