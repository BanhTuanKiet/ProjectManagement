"use client"

import { useEffect, useState } from "react"
import { Check, X, ArrowRight, Home, RefreshCw } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "@/config/axiosConfig"

interface PaymentResult {
    status: "true" | "false" | "loading"
    orderId: string
    amount: string
    planName: string
    billingPeriod: "monthly" | "yearly"
    message: string
}

export default function PaymentResultPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [paymentResult, setPaymentResult] = useState<PaymentResult>({
        status: "loading",
        orderId: "",
        amount: "",
        planName: "",
        billingPeriod: "monthly",
        message: "",
    })

    useEffect(() => {
        const verifyPayment = async () => {
            const status = searchParams.get("status")
            const token = searchParams.get("token")
            const planStored = searchParams.get("order")
                
            if (!status || !token || !planStored) {
                setPaymentResult((prev) => ({
                    ...prev,
                    status: "false",
                    message: "Payment information not found. Please try again.",
                }))
                return
            }

            try {
                const paymentData = JSON.parse(atob(planStored) )
                console.log(paymentData)
                if (status) {
                    const order = {
                        orderId: token,
                        amount: paymentData.Amount,
                        name: paymentData.Name,
                        description: paymentData.Description,
                        billingPeriod: paymentData.BillingPeriod,
                    }
                    console.log(order)

                    await axios.post("/payments/capture-order", order)

                    setPaymentResult({
                        status: "true",
                        orderId: token,
                        amount: paymentData.Amount,
                        planName: paymentData.Name,
                        billingPeriod: paymentData.BillingPeriod,
                        message: "Your payment has been processed successfully! Your plan is now active.",
                    })
                } else {
                    setPaymentResult({
                        status: "false",
                        orderId: token,
                        amount: paymentData.Amount,
                        planName: paymentData.name,
                        billingPeriod: paymentData.typePlan,
                        message: "Your payment was declined. Please try again or contact support.",
                    })
                }
            } catch (error) {
                console.error("Payment verification error:", error)
                setPaymentResult((prev) => ({
                    ...prev,
                    status: "false",
                    message: "An error occurred while processing your payment. Please contact support.",
                }))
            }

            // window.history.replaceState({}, document.title, window.location.pathname)
        }

        verifyPayment()
    }, [searchParams])

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
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-2xl px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    {paymentResult.status === "loading" && (
                        <div className="flex flex-col items-center justify-center gap-6">
                            <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                            <h1 className="text-3xl font-bold text-slate-900">Processing Payment</h1>
                            <p className="text-lg text-slate-600">Please wait while we verify your payment...</p>
                        </div>
                    )}

                    {paymentResult.status === "true" && (
                        <div className="flex flex-col items-center justify-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                                <Check className="h-10 w-10 text-emerald-600" />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-4xl font-bold text-slate-900">Payment Successful!</h1>
                                <p className="text-lg text-slate-600 max-w-md mx-auto">{paymentResult.message}</p>
                            </div>
                        </div>
                    )}

                    {paymentResult.status === "false" && (
                        <div className="flex flex-col items-center justify-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-red-50 border-2 border-red-200 flex items-center justify-center">
                                <X className="h-10 w-10 text-red-600" />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-4xl font-bold text-slate-900">Payment Failed</h1>
                                <p className="text-lg text-slate-600 max-w-md mx-auto">{paymentResult.message}</p>
                            </div>
                        </div>
                    )}
                </div>

                {paymentResult.status !== "loading" && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
                        <div className="space-y-6">
                            <div className="space-y-4 pb-6 border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Order ID</span>
                                    <span className="font-mono text-sm font-semibold text-slate-900">{paymentResult.orderId}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Plan</span>
                                    <span className="font-semibold text-slate-900">{paymentResult.planName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Billing Period</span>
                                    <span className="font-semibold text-slate-900 capitalize">{paymentResult.billingPeriod}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl p-4 border border-blue-200">
                                <span className="font-semibold text-slate-900">Total Paid</span>
                                <span className="text-2xl font-bold text-blue-600">${paymentResult.amount}</span>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-sm text-slate-600">
                                    {paymentResult.status === "true" ? (
                                        <>
                                            A confirmation email has been sent to your registered email address. You now have full access to
                                            all features included in your plan.
                                        </>
                                    ) : (
                                        <>
                                            {"If you have any questions or need assistance, please contact our support team. We're here to help!"}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {paymentResult.status !== "loading" && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        {paymentResult.status === "true" ? (
                            <>
                                <button
                                    onClick={() => router.push("/project")}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="flex-1 bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-900 hover:text-blue-600 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Back Home
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push("/plan-payment")}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="flex-1 bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-900 hover:text-blue-600 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Back Home
                                </button>
                            </>
                        )}
                    </div>
                )}

                {paymentResult.status !== "loading" && (
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <p className="text-center text-sm text-slate-600">
                            Need help? Contact our support team at{" "}
                            <a href="mailto:support@projecthub.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                                support@projecthub.com
                            </a>
                        </p>
                    </div>
                )}
            </section>
        </main>
    )
}
