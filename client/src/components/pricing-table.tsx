"use client"
import { useState } from "react"
import { Check, X } from "lucide-react"

export default function PricingTable() {
    const [selectedPlan, setSelectedPlan] = useState<string>("Pro")

    const handleSelectPlan = (planName: string) => {
        setSelectedPlan(planName)
    }

    const features = [
        { name: "Số dự án", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Số thành viên/team", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Gantt chart", free: false, pro: true, enterprise: true },
        { name: "Advanced reports", free: false, pro: true, enterprise: true },
        { name: "File upload (GB)", free: "1GB", pro: "50GB", enterprise: "Unlimited" },
        { name: "Integrations (Slack, Drive)", free: false, pro: true, enterprise: true },
        { name: "API access", free: false, pro: true, enterprise: true },
        { name: "Priority support", free: false, pro: false, enterprise: true },
        { name: "Custom workflows", free: false, pro: true, enterprise: true },
    ]

    const plans = [
        { name: "Free", price: "Miễn phí" },
        { name: "Pro", price: "99.000đ/tháng" },
        { name: "Enterprise", price: "Liên hệ" },
    ]

    return (
        <section className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Phạm vi sử dụng các gói</h2>
                <p className="text-gray-600 text-lg">Chọn gói phù hợp với nhu cầu của bạn</p>
            </div>

            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">Tính năng</th>
                            {plans.map((plan) => (
                                <th
                                    key={plan.name}
                                    onClick={() => handleSelectPlan(plan.name)}
                                    className={`px-6 py-4 text-center font-semibold cursor-pointer transition 
                                        ${selectedPlan === plan.name ? "bg-blue-50 text-blue-600" : "text-gray-900 hover:bg-blue-50"}`}
                                >
                                    {plan.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((feature, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-6 py-4 font-medium text-gray-900">{feature.name}</td>

                                <td
                                    onClick={() => handleSelectPlan("Free")}
                                    className={`px-6 py-4 text-center cursor-pointer transition ${selectedPlan === "Free" ? "bg-blue-50" : ""}`}
                                >
                                    {typeof feature.free === "boolean" ? (
                                        feature.free ? (
                                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                            <X className="h-5 w-5 text-red-500 mx-auto" />
                                        )
                                    ) : (
                                        <span className="text-gray-700">{feature.free}</span>
                                    )}
                                </td>

                                <td
                                    onClick={() => handleSelectPlan("Pro")}
                                    className={`px-6 py-4 text-center cursor-pointer transition ${selectedPlan === "Pro" ? "bg-blue-50" : ""}`}
                                >
                                    {typeof feature.pro === "boolean" ? (
                                        feature.pro ? (
                                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                            <X className="h-5 w-5 text-red-500 mx-auto" />
                                        )
                                    ) : (
                                        <span className="text-gray-700 font-semibold">{feature.pro}</span>
                                    )}
                                </td>

                                <td
                                    onClick={() => handleSelectPlan("Enterprise")}
                                    className={`px-6 py-4 text-center cursor-pointer transition ${selectedPlan === "Enterprise" ? "bg-blue-50" : ""}`}
                                >
                                    {typeof feature.enterprise === "boolean" ? (
                                        feature.enterprise ? (
                                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                            <X className="h-5 w-5 text-red-500 mx-auto" />
                                        )
                                    ) : (
                                        <span className="text-gray-700">{feature.enterprise}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                            <td className="px-6 py-4 font-semibold text-gray-900">Giá</td>
                            {plans.map((plan) => (
                                <td
                                    key={plan.name}
                                    onClick={() => handleSelectPlan(plan.name)}
                                    className={`px-6 py-4 text-center font-semibold cursor-pointer transition 
                                        ${selectedPlan === plan.name ? "bg-blue-50 text-blue-600" : "text-gray-900"}`}
                                >
                                    {plan.price}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-6">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        onClick={() => handleSelectPlan(plan.name)}
                        className={`rounded-lg border p-6 cursor-pointer transition 
                            ${selectedPlan === plan.name ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-blue-50"}`}
                    >
                        <h3 className={`text-xl font-bold mb-2 ${selectedPlan === plan.name ? "text-blue-600" : "text-gray-900"}`}>
                            {plan.name}
                        </h3>
                        <p className={`text-2xl font-bold mb-4 ${selectedPlan === plan.name ? "text-blue-600" : "text-gray-900"}`}>
                            {plan.price}
                        </p>

                        <div className="space-y-3">
                            {features.map((feature, idx) => {
                                const value =
                                    plan.name === "Free"
                                        ? feature.free
                                        : plan.name === "Pro"
                                            ? feature.pro
                                            : feature.enterprise

                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                                    >
                                        <span className="text-gray-700">{feature.name}</span>
                                        <div>
                                            {typeof value === "boolean" ? (
                                                value ? (
                                                    <Check className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <X className="h-5 w-5 text-red-500" />
                                                )
                                            ) : (
                                                <span className="font-semibold text-gray-900">{value}</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
