"use client"

import { useEffect, useState } from "react"
import { Check, Lock, ArrowRight, AlertCircle } from "lucide-react"
import PricingTable from "@/components/pricing-table"
import type { PlanDetail } from "@/utils/IPlan"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/utils/stringUitls"
import axiosConfig from "@/config/axiosConfig"
import axios from "axios"
import { useUser } from "../(context)/UserContext"

const paymentMethods = [
    {
        id: "vnpay",
        name: "VNPay",
        description: "Bank card, e-wallet",
        logo: <img src="/vn-pay.png" alt="VNPay" className="h-10 w-auto object-contain" />,
    },
    {
        id: "paypal",
        name: "PayPal",
        description: "Your PayPal account",
        logo: <img src="/pay-pal.png" alt="PayPal" className="h-10 w-auto object-contain" />,
    },
]

interface FxRate {
    vndRate: number;
    usdRate: number;
}

interface Price {
    price: number
    discountPrice: number
}

export default function PlanPaymentPage() {
    const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "paypal">("vnpay")
    const [selectedPlan, setSelectedPlan] = useState<PlanDetail | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
    const [fxRates, setFxRates] = useState<FxRate | null>(null)
    const [price, setPrice] = useState<Price | null>(null)
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        let price = 0
        let discountPrice = 0

        if (selectedMethod === 'vnpay') {
            price = Number(selectedPlan?.price) || 0
        } else {
            const vndRate = fxRates?.vndRate
            const planPrice = Number(selectedPlan?.price) || 0
            price = vndRate ? planPrice / vndRate : 0
        }

        if (billingPeriod === 'monthly') {
            discountPrice = 0
        } else {
            const totalPrice = price * 12
            price = totalPrice * 0.95
            discountPrice = totalPrice - price
        }

        setPrice({
            price: price,
            discountPrice: discountPrice
        })
    }, [selectedMethod, billingPeriod, fxRates, selectedPlan?.price])

    useEffect(() => {
        if (selectedMethod !== 'paypal') return

        const fetchLatestFxRates = async () => {
            try {
                const response = await axios.get("https://api.fxratesapi.com/latest")
                const fxRates = response.data.rates
                const vndRate = fxRates['VND']
                const usdRate = fxRates['USD']
                setFxRates({
                    vndRate,
                    usdRate,
                })
            } catch (error) {
                console.log(error)
            }
        }

        fetchLatestFxRates()
    }, [selectedMethod])

    const usdPrice = (fxRates && selectedPlan) ? (Number(selectedPlan.price) / fxRates.vndRate) : null

    const handlePayment = async () => {
        if (!selectedPlan) return
        if (selectedPlan.id === 1) {
            if (user) {
                return router.push("/project")
            }

            return router.push("/login")
        }
        setIsLoading(true)

        const order = {
            planId: selectedPlan.id,
            amount: selectedPlan.price,
            name: selectedPlan.name,
            currency: "USD",
            billingPeriod: billingPeriod,
            returnUrl: "",
            cancelUrl: "",
        }

        try {
            // const response = await axiosConfig.post(`/payments/checkout/paypal`, order)
            // const links = response.data.links ?? []
            // window.open(links[1].href)
            if (selectedMethod === "paypal") {
                const response = await axiosConfig.post(`/payments/checkout/paypal`, order)
                const links = response.data.links ?? []
                window.open(links[1].href)
            }
            else if (selectedMethod === "vnpay") {
                const response = await axiosConfig.post(`/payments/create-vnpay`, order)
                const payUrl = response.data?.paymentUrl
                if (payUrl) window.location.href = payUrl
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    const isVnpay = selectedMethod === 'vnpay' ? true : false

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

                            {selectedMethod === "paypal" && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-900 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-amber-900 text-sm">Payment in USD</p>
                                            <p className="text-xs text-amber-700 mt-1">
                                                PayPal transactions will be processed in US Dollars (USD).
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
                                        {selectedPlan && user ? (
                                            selectedPlan.id <= Number(user.planId)
                                                ? "Go to your Projects"
                                                : "Upgrade to this plan"
                                        ) : (
                                            "Continue to Payment"
                                        )}
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-slate-900">Order Summary</h3>

                                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
                                    <button
                                        onClick={() => setBillingPeriod("monthly")}
                                        className={`cursor-pointer px-4 py-2 rounded-md font-medium transition-all ${billingPeriod === "monthly"
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900"
                                            }`}
                                    >
                                        Monthly
                                    </button>

                                    <button
                                        onClick={() => setBillingPeriod("yearly")}
                                        className={`cursor-pointer px-4 py-2 rounded-md font-medium transition-all relative ${billingPeriod === "yearly"
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900"
                                            }`}
                                    >
                                        Yearly
                                        {billingPeriod === "yearly" && (
                                            <span className="absolute -top-2 -right-5 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                -5%
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            {billingPeriod === "yearly" ? "Base Price (12 months)" : "Base Price"}
                                        </span>
                                        <span className="text-slate-900 font-medium">
                                            {formatPrice(price?.price, isVnpay)}
                                        </span>
                                    </div>
                                    {selectedPlan?.id !== 1 && billingPeriod === "yearly" && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-emerald-600 font-medium">Discount (5%)</span>
                                            <span className="text-emerald-600 font-medium">
                                                -{formatPrice(price?.discountPrice, isVnpay)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl mb-4 p-4 border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-900">Total</span>
                                        <span className="text-3xl font-bold text-blue-600">
                                            {price && formatPrice(price?.price - price?.discountPrice, isVnpay)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2">
                                        You will be charged on December 15
                                        {billingPeriod === "yearly" && " for 12 months"}
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
