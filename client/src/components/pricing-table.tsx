"use client"
import { useEffect, useState } from "react"
import { Check, X } from 'lucide-react'
import axios from "@/config/axiosConfig"
import { PlanDetail } from "@/utils/IPlan"

export default function PricingTable({
    selectedPlan,
    setSelectedPlan,
}: {
    selectedPlan: PlanDetail | undefined
    setSelectedPlan: React.Dispatch<React.SetStateAction<PlanDetail | undefined>>
}) {
    const [plans, setPlans] = useState<PlanDetail[]>([])

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`/plans`)
                setPlans(response.data)
                if (response.data.length > 0) setSelectedPlan(response.data[1])
            } catch (error) {
                console.error(error)
            }
        }
        fetchPlans()
    }, [])

    const allFeatures = Array.from(
        new Set(plans.flatMap(p => p.features.map(f => f.featureName)))
    )
console.log(plans)
    return (
        <section className="mx-auto max-w-7xl">
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <th className="px-8 py-6 text-left font-semibold text-slate-900">
                                Feature
                            </th>
                            {plans && plans?.map(plan => (
                                <th
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`px-8 py-6 text-center font-semibold cursor-pointer transition-all duration-200 ${selectedPlan?.name === plan.name
                                        ? "bg-gradient-to-b from-blue-50 to-blue-100 text-blue-700"
                                        : "text-slate-900 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <span>{plan.name}</span>
                                        {plan.badge && (
                                            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                {plan.description}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {allFeatures.map((featureName, idx) => (
                            <tr
                                key={idx}
                                className={`border-b border-slate-200 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                    }`}
                            >
                                <td className="px-8 py-4 font-medium text-slate-900">
                                    {featureName}
                                </td>

                                {plans.map(plan => {
                                    const feature = plan.features.find(
                                        f => f.featureName === featureName
                                    )
                                    const value = feature ? feature.value : "-"
                                    const isBoolean =
                                        feature?.valueType === "boolean" &&
                                        (value === "true" || value === "false")

                                    return (
                                        <td
                                            key={`${plan.name}-${featureName}`}
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`px-8 py-4 text-center cursor-pointer transition-colors ${selectedPlan?.name === plan.name ? "bg-blue-50/50" : ""
                                                }`}
                                        >
                                            {isBoolean ? (
                                                value === "true" ? (
                                                    <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                                                ) : (
                                                    <X className="h-5 w-5 text-slate-300 mx-auto" />
                                                )
                                            ) : (
                                                <span className="text-slate-700 font-medium">
                                                    {value}
                                                </span>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}

                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
                            <td className="px-8 py-6 font-semibold text-slate-900">Giá</td>
                            {plans.map(plan => (
                                <td
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`px-8 py-6 text-center font-bold cursor-pointer transition-all duration-200 ${selectedPlan?.name === plan.name
                                        ? "text-blue-700 bg-gradient-to-b from-blue-50 to-blue-100"
                                        : "text-slate-900"
                                        }`}
                                >
                                    {plan.price}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-4">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 ${selectedPlan?.name === plan.name
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3
                                    className={`text-xl font-bold ${selectedPlan?.name === plan.name
                                        ? "text-blue-700"
                                        : "text-slate-900"
                                        }`}
                                >
                                    {plan.name}
                                </h3>
                                {plan.badge && (
                                    <p className="text-xs font-medium text-blue-600 mt-1">
                                        {plan.description}
                                    </p>
                                )}
                            </div>
                            {selectedPlan?.name === plan.name && (
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>
                        <p
                            className={`text-3xl font-bold mb-6 ${selectedPlan?.name === plan.name ? "text-blue-700" : "text-slate-900"
                                }`}
                        >
                            {plan.price}
                        </p>

                        <div className="space-y-3">
                            {plan.features.map(feature => {
                                const value = feature.value
                                const isBoolean =
                                    feature.valueType === "boolean" &&
                                    (value === "true" || value === "false")

                                return (
                                    <div
                                        key={feature.featureId}
                                        className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0"
                                    >
                                        <span className="text-slate-700 text-sm">
                                            {feature.featureName}
                                        </span>
                                        <div>
                                            {isBoolean ? (
                                                value === "true" ? (
                                                    <Check className="h-5 w-5 text-emerald-500" />
                                                ) : (
                                                    <X className="h-5 w-5 text-slate-300" />
                                                )
                                            ) : (
                                                <span className="font-semibold text-slate-900 text-sm">
                                                    {value}
                                                </span>
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