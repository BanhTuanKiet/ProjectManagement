"use client"

import { useState } from "react"
import PricingTable from "@/components/pricing-table"

export default function PlanPaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "paypal">("vnpay")

  const paymentMethods = [
    {
      id: "vnpay",
      name: "VNPay",
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
      logo: (
        <img 
          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
          alt="PayPal" 
          className="h-10 w-auto object-contain"
        />
      ),
    },
  ]

  const getButtonText = () => {
    if (selectedMethod === "vnpay") return "Pay with VNPay"
    if (selectedMethod === "paypal") return "Pay with PayPal"
    return "Proceed to Payment"
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-xl font-bold text-slate-900">ProjectHub</span>
            </div>

            <div className="flex items-center gap-4">
              {/* <a href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                Quay lại
              </a> */}
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Phương thức thanh toán</h2>

              <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-white">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id

                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => setSelectedMethod(method.id as "vnpay" | "paypal")}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-900 flex-1">{method.name}</span>
                      <div className="flex-shrink-0">{method.logo}</div>
                    </label>
                  )
                })}
              </div>

              {/* Payment Info */}
              <div className="mt-8 rounded-xl bg-blue-50 border border-blue-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Thông tin thanh toán</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Thanh toán an toàn và bảo mật
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Không lưu thông tin thẻ
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Hoàn tiền trong 30 ngày
                  </li>
                </ul>
              </div>

              <button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                {getButtonText()}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white border border-slate-200 shadow-sm py-8">
              <PricingTable />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}