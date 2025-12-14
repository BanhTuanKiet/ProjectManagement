import { ArrowUpRight, Plus, Check } from 'lucide-react'
import React, { useEffect, useState } from 'react'

type Plan = {
    id: string
    name: string
    price: number
    currency: string
    features: string[]
    active_subscribers: number
    isActive: boolean
}

const mockPlans: Plan[] = [
    {
        id: 'p1',
        name: 'Basic',
        price: 199000,
        currency: 'VND',
        features: ['5 Users', '50GB Storage', 'Email Support'],
        active_subscribers: 300,
        isActive: true
    },
    {
        id: 'p2',
        name: 'Premium',
        price: 499000,
        currency: 'VND',
        features: ['Unlimited Users', '1TB Storage', '24/7 Support', 'API Access'],
        active_subscribers: 150,
        isActive: true
    },
    {
        id: 'p3',
        name: 'Enterprise',
        price: 999000,
        currency: 'VND',
        features: ['Custom Solutions', 'Dedicated Server', 'Account Manager'],
        active_subscribers: 20,
        isActive: false
    }
]

export default function Plan() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setPlans(mockPlans)
            setLoading(false)
        }, 500)
    }, [])

    return (
        <div className="bg-white border rounded-xl shadow-sm">

            {/* HEADER */}
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                    Subscription Plans
                </h2>

                <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <Plus className="w-4 h-4" />
                    Add plan
                </button>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="py-20 text-center text-gray-500 animate-pulse text-sm">
                    Đang tải gói dịch vụ...
                </div>
            )}

            {/* EMPTY */}
            {!loading && plans.length === 0 && (
                <div className="py-20 text-center text-gray-400 text-sm">
                    No plans found
                </div>
            )}

            {/* TABLE */}
            {!loading && plans.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-left text-gray-500">
                                <th className="px-4 py-3 font-medium">Plan</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Features</th>
                                <th className="px-4 py-3 font-medium">Subscribers</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {plans.map(plan => (
                                <tr key={plan.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {plan.name}
                                        {plan.name === 'Premium' && (
                                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md">
                                                Popular
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-gray-700">
                                        {new Intl.NumberFormat('vi-VN').format(plan.price)} {plan.currency}
                                        <div className="text-xs text-gray-400">/ month</div>
                                    </td>

                                    <td className="px-4 py-3 text-gray-600">
                                        <ul className="space-y-1">
                                            {plan.features.slice(0, 2).map((f, i) => (
                                                <li key={i} className="flex gap-1 items-center">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                    {f}
                                                </li>
                                            ))}
                                            {plan.features.length > 2 && (
                                                <li className="text-xs text-gray-400">
                                                    +{plan.features.length - 2} more
                                                </li>
                                            )}
                                        </ul>
                                    </td>

                                    <td className="px-4 py-3 text-gray-700">
                                        {plan.active_subscribers}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full font-medium
                                                ${plan.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <button className="text-blue-600 hover:underline text-xs flex items-center gap-1 ml-auto">
                                            Edit
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
