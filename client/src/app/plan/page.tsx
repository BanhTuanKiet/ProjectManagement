"use client"

import { useEffect, useState } from "react"
import { Check, Lock, ArrowRight, AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react"
import PricingTable from "@/components/pricing-table"
import type { PlanDetail } from "@/utils/IPlan"
import { useRouter } from "next/navigation"
import axiosConfig from "@/config/axiosConfig"
import { useUser } from "../(context)/UserContext"
import axios from "axios"

const paymentMethods = [
    {
        id: "paypal",
        name: "PayPal",
        description: "Your PayPal account",
        logo: <img src="/pay-pal.png" alt="PayPal" className="h-10 w-auto object-contain" />,
    },
]

interface FxRate {
    vndRate: number
    usdRate: number
}

interface Price {
    displayPrice: number
    originalPrice: number // Giá gốc USD để thanh toán
}

export default function PlanPaymentPage() {
    const [selectedMethod, setSelectedMethod] = useState<"paypal">("paypal")
    const [selectedPlan, setSelectedPlan] = useState<PlanDetail | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const [price, setPrice] = useState<Price | null>(null)
    const [fxRates, setFxRates] = useState<FxRate | null>(null)
    const [currency, setCurrency] = useState<"USD" | "VND">("USD") // State quản lý đơn vị tiền tệ
    const { user, signinGG } = useUser()
    const router = useRouter()

    // Hàm format tiền tệ linh hoạt
    const formatCurrency = (amount: number, currencyType: "USD" | "VND") => {
        if (currencyType === "USD") {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            }).format(amount)
        } else {
            // Làm tròn số tiền VND cho đẹp (ví dụ: 253450 -> 253.450)
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
            }).format(amount)
        }
    }

    // Effect lấy tỷ giá
    useEffect(() => {
        const fetchLatestFxRates = async () => {
            try {
                const response = await axios.get("https://api.fxratesapi.com/latest")
                const rates = response.data.rates
                // Lấy tỷ giá VND và USD từ API (Base có thể là EUR hoặc USD tùy API, nên lấy tỉ lệ an toàn)
                const vndRate = rates['VND']
                const usdRate = rates['USD']
                setFxRates({
                    vndRate,
                    usdRate,
                })
            } catch (error) {
                console.log("Error fetching rates:", error)
            }
        }

        fetchLatestFxRates()
    }, [])

    // Effect tính toán giá hiển thị khi Plan, Currency hoặc Tỷ giá thay đổi
    useEffect(() => {
        const originalUsdPrice = Number(selectedPlan?.price) || 0
        let displayAmount = originalUsdPrice

        if (currency === "VND" && fxRates) {
            // Tính tỷ giá quy đổi: 1 USD = (VND_Rate / USD_Rate)
            const conversionRate = fxRates.vndRate / fxRates.usdRate
            displayAmount = originalUsdPrice * conversionRate
        }

        setPrice({
            displayPrice: displayAmount,
            originalPrice: originalUsdPrice
        })
    }, [selectedMethod, selectedPlan?.price, currency, fxRates])

    const handlePayment = async () => {
        if (!selectedPlan) return
        if (selectedPlan.id === 1) {
            if (user) {
                return router.push("/project")
            }

            try {
                await signinGG()
            } catch (error) {
                console.error("Google sign-in error", error)
            }
            return
        }
        setIsLoading(true)

        // Lưu ý: Luôn gửi giá USD (originalPrice) đi thanh toán
        const order = {
            planId: selectedPlan.id,
            amount: selectedPlan?.price, // Giá gốc từ plan (USD)
            name: selectedPlan.name,
            currency: "USD",
            billingPeriod: "monthly",
            returnUrl: "",
            cancelUrl: "",
        }

        try {
            if (selectedMethod === "paypal") {
                const response = await axiosConfig.post(`/payments/checkout/paypal`, order)
                const links = response.data.links ?? []
                if (links[1]?.href) {
                    window.open(links[1].href)
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    const showBackButton =
        !isLoading &&
        (
            (!selectedPlan || !user) || (selectedPlan && user && selectedPlan.id > Number(user.planId))
        )

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="cursor-pointer flex items-center gap-2" onClick={() => router.push("/")}>
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
                                            onClick={() => setSelectedMethod(method.id as "paypal")}
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

                            {selectedMethod === "paypal" && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-900 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-amber-900 text-sm">Payment in USD</p>
                                            <p className="text-xs text-amber-700 mt-1">
                                                PayPal transactions will be processed in US Dollars (USD).
                                                {currency === 'VND' && " The VND price shown is for reference only."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-900 text-sm">Secure Payment</p>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            256-bit SSL encryption. No card information is stored.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:gap-4 gap-3">
                                <button
                                    onClick={handlePayment}
                                    disabled={isLoading}
                                    className={`
            w-full md:flex-1
            cursor-pointer bg-blue-600 hover:from-blue-700 hover:to-blue-700
            text-white font-semibold py-3 px-4 rounded-xl
            transition-all duration-200 shadow-lg hover:shadow-xl
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 group
        `}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {selectedPlan && user ? (
                                                selectedPlan.id <= Number(user.planId)
                                                    ? "Go to your Projects"
                                                    : "Upgrade"
                                            ) : (
                                                "Continue to Payment"
                                            )}
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                {showBackButton && (
                                    <button
                                        onClick={() => router.push('/')}
                                        className="
                                            w-full md:flex-1
                                            cursor-pointer bg-green-600 hover:from-blue-700 hover:to-blue-700
                                            text-white font-semibold py-3 px-4 rounded-xl
                                            transition-all duration-200 shadow-lg hover:shadow-xl
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            flex items-center justify-center gap-2 group
                                        "
                                    >
                                        Back to Home
                                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <h3 className="text-2xl font-bold text-slate-900">Order Summary</h3>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-500 font-medium">Currency:</span>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setCurrency("USD")}
                                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${currency === "USD"
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                                }`}
                                        >
                                            USD
                                        </button>
                                        <button
                                            onClick={() => setCurrency("VND")}
                                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${currency === "VND"
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                                }`}
                                        >
                                            VND
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            Plan Price
                                        </span>
                                        <span className="text-slate-900 font-medium">
                                            {price && formatCurrency(price.displayPrice, currency)} / Monthly
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl mb-4 p-4 border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">Total</span>
                                            {currency === 'VND' && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Approx.</span>
                                            )}
                                        </div>
                                        <span className="text-3xl font-bold text-blue-600">
                                            {price && formatCurrency(price.displayPrice, currency)}
                                        </span>
                                    </div>
                                    {currency === "VND" && fxRates && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                            <RefreshCcw className="w-3 h-3" />
                                            <span>
                                                Exchange rate: 1 USD ≈ {formatCurrency(fxRates.vndRate / fxRates.usdRate, "VND")}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-600 mt-1">
                                        You will be charged on December 15
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-200 mb-4">
                                    <p className="text-sm font-semibold text-slate-900 mb-4">{`You'll get:`}</p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                                        {selectedPlan?.features
                                            ?.filter((feature) => feature.value !== "false")
                                            .map((feature, idx) => (
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