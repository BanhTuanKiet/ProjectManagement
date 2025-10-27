"use client"

import { useEffect, useState } from "react"
import { Check, Lock, ArrowRight } from 'lucide-react'
import PricingTable from "@/components/pricing-table"
import { PlanDetail } from "@/utils/IPlan"
import axios from "@/config/axiosConfig"
import { useSearchParams } from "next/navigation"

const paymentMethods = [
    {
        id: "vnpay",
        name: "VNPay",
        description: "Bank card, e-wallet",
        logo: (
            <img
                src="/vn-pay.png"
                alt="VNPay"
                className="h-10 w-auto object-contain"
            />
        ),
    },
    {
        id: "paypal",
        name: "PayPal",
        description: "Your PayPal account",
        logo: (
            <img
                src="/pay-pal.png"
                alt="PayPal"
                className="h-10 w-auto object-contain"
            />
        ),
    },
]

export default function PlanPaymentPage() {
    const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "paypal">("vnpay")
    const [selectedPlan, setSelectedPlan] = useState<PlanDetail | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const searchParams = useSearchParams()

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const status = searchParams.get("status")
                const token = searchParams.get("token")
                const order = {
                    orderId: token,
                    amount: selectedPlan?.price,
                    name: selectedPlan?.name,
                    description: `Payment for ${selectedPlan?.name} Plan`,
                }
                if (status) await axios.post("/payments/capture-order", order)
            } catch (error) {
                console.log(error)
            } finally {
                window.history.replaceState({}, document.title, window.location.pathname)
            }
        }

        verifyPayment()
    }, [searchParams, selectedPlan])

    const handlePayment = async () => {
        setIsLoading(true)
        const order = {
            amount: selectedPlan?.price,
            currency: "USD",
            // planId: selectedPlan?.id,
            description: `Payment for ${selectedPlan?.name} Plan`,
            returnUrl: "http://localhost:3000/plan-payment?status=true",
            cancelUrl: "http://localhost:3000/plan-payment?status=false"
        }

        try {
            const response = await axios.post(`/payments/checkout/paypal`, order)
            const links = response.data.links ?? []
            window.open(links[1].href)
            console.log(response)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-600 shadow-lg">
                                <span className="text-lg font-bold text-white">P</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                                ProjectHub
                            </span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                                Features
                            </a>
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                                Pricing
                            </a>
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                                Support
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                {/* Section Title */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Choose Your Plan</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Upgrade to unlock powerful features and boost your productivity.
                    </p>
                </div>

                <div className="mb-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <PricingTable selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Method</h2>
                                <p className="text-sm text-slate-600">Choose how you want to pay</p>
                            </div>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => {
                                    const isSelected = selectedMethod === method.id

                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id as "vnpay" | "paypal")}
                                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${isSelected
                                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-50 shadow-md"
                                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center transition-all ${isSelected ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-blue-100"
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

                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Lock className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-900 text-sm">Secure Payment</p>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            256-bit SSL encryption. No card information is stored.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Continue to Payment
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Order Summary</h3>

                            <div className="space-y-6">
                                <div className="space-y-4 pb-4 mb-4 border-b border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-3">
                                            <p className="text-sm text-slate-600">Monthly Billing</p>
                                        </div>
                                        <p className="font-semibold text-slate-900 mt-auto">{selectedPlan?.price}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Base Price</span>
                                        <span className="text-slate-900 font-medium">{selectedPlan?.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Tax (0%)</span>
                                        <span className="text-slate-900 font-medium">0</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl mb-4 p-4 border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-900">Total</span>
                                        <span className="text-3xl font-bold text-blue-600">{selectedPlan?.price}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2">You will be charged on December 15</p>
                                </div>

                                <div className="pt-4 border-t border-slate-200 mb-4">
                                    <p className="text-sm font-semibold text-slate-900 mb-4">{`You'll get:`}</p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                                        {selectedPlan?.features?.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-sm text-slate-700">
                                                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                                <span>{feature?.featureName}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <p className="text-sm text-amber-900">
                                        <span className="font-semibold">30-day money-back guarantee.</span>
                                        {`If you're not satisfied, we'll refund your payment.`}
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