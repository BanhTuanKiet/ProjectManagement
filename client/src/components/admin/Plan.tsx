import axios from '@/config/axiosConfig'
import { PlanDetail } from '@/utils/IPlan'
import { getActiveAccount, getSubscriptionBadge } from '@/utils/statusUtils'
import { formatPrice } from '@/utils/stringUitls'
import { number } from 'framer-motion'
import { ArrowUpRight, Plus, Check, ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Ban, Trash2, Search, ChevronLeft, ChevronRight, ChevronDown, X, Edit } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import PlanEditor from '../PlanEditor'

type Plan = {
    id: string
    name: string
    price: number
    currency: string
    features: string[]
    active_subscribers: number
    isActive: boolean
}

type SortConfig = {
    key: 'name'
    direction: 'asc' | 'desc'
} | null

export default function Plan() {
    const [plans, setPlans] = useState<PlanDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState<string>("")
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sortConfig, setSortConfig] = useState<SortConfig>(null)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const [openEditPlan, setOpenEditPlan] = useState<PlanDetail | null>(null)
    const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({})
    const menuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true)

            try {
                const response = await axios.get(`/admins/plans`, {
                    params: {
                        direction: sortConfig?.direction,
                        search: "",
                    }
                })
                console.log(response.data)
                setPlans(response.data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        fetchPlans()
    }, [sortConfig, debouncedSearch])

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search ?? '')
        }, 400)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const sorted = [...plans].sort((a, b) => {
        if (!sortConfig) return 0
        const res = a.name.localeCompare(b.name)
        return sortConfig.direction === 'asc' ? res : -res
    })

    const requestSort = () => {
        setSortConfig(prev => ({
            key: 'name',
            direction: prev?.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const getSortIcon = () =>
        !sortConfig ? <ArrowUpDown className="h-3 w-3" /> :
            sortConfig.direction === 'asc'
                ? <ArrowUp className="h-3 w-3" />
                : <ArrowDown className="h-3 w-3" />

    const toggleActive = async (plan: PlanDetail) => {
        if (!confirm(`Are you sure you want to ${plan.isActive ? 'ban' : 'unban'} this plan?`)) return

        try {
            await axios.put(`/admins/plans/${plan.id}/toggle-active`)
            setPlans(prev => 
                prev.map(p => p.id === plan.id ? { ...p, isActive: !p.isActive } : p)
            )
        } finally {
            setOpenMenuId(null)
        }
        // if (!confirm(`Are you sure you want to ${plan.isActive ? 'deactivate' : 'activate'} this plan?`)) return
        // setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
        // setOpenMenuId(null)
    }

    const deletePlan = (plan: PlanDetail) => {
        // if (!confirm('⚠️ Delete this plan permanently?')) return
        // setPlans(prev => prev.filter(p => p.id !== plan.id))
        // setOpenMenuId(null)
    }

    const editPlan = (plan: PlanDetail) => {
        setOpenEditPlan(plan)
    }

    const toggleExpand = (id: number) => {
        setExpandedPlans(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    return (
        <div className="bg-white">
            <div className="p-4 border-b flex flex-wrap gap-3 items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Subscription Plans</h2>

                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search ?? ''}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search plan..."
                            className="pl-9 pr-3 py-1.5 text-sm border rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {loading && (
                <div className="py-20 text-center text-gray-500 animate-pulse text-sm">
                    Loading plans...
                </div>
            )}

            {!loading && sorted.length === 0 && (
                <div className="py-20 text-center text-gray-400 text-sm">
                    No plans found
                </div>
            )}

            {!loading && sorted.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr className="text-left">
                                <th onClick={requestSort} className="px-6 py-3 cursor-pointer">
                                    <div className="flex gap-2 items-center">Plan {getSortIcon()}</div>
                                </th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Features</th>
                                <th className="px-4 py-3 font-medium">Subscribers</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {sorted.map(plan => (
                                <tr key={plan.id} className={`${!plan.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                                    <td className="px-6 py-3 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <span>{plan.name}</span>
                                            <span className={getSubscriptionBadge(plan.name)}>
                                                {plan.description}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-gray-700">
                                        {formatPrice(plan.price)}
                                        <span className="text-xs text-gray-500"> / Monthly</span>
                                    </td>

                                    <td className="px-4 py-3 text-gray-600">
                                        {(() => {
                                            const enabledFeatures = plan.features.filter(f => f.value !== 'false')
                                            const isExpanded = expandedPlans[plan.id]
                                            const visibleFeatures = isExpanded
                                                ? enabledFeatures
                                                : enabledFeatures.slice(0, 4)

                                            return (
                                                <ul className="space-y-2.5">
                                                    {visibleFeatures.map((f, i) => {
                                                        const isDisabled = f.value === 'false'

                                                        return (
                                                            <li
                                                                key={i}
                                                                className={`flex items-start gap-2.5 text-sm ${isDisabled ? 'opacity-50' : ''
                                                                    }`}
                                                            >
                                                                <div className="mt-0.5 flex-shrink-0">
                                                                    {isDisabled ? (
                                                                        <X className="w-3.5 h-3.5 text-gray-400" />
                                                                    ) : (
                                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-wrap items-baseline gap-1">
                                                                    <span
                                                                        className={`leading-tight ${isDisabled
                                                                            ? 'text-gray-400 line-through'
                                                                            : 'text-gray-700 font-medium'
                                                                            }`}
                                                                    >
                                                                        {f.featureName}
                                                                    </span>

                                                                    {f.valueType === 'string' && (
                                                                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                                                            {f.value}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        )
                                                    })}

                                                    {enabledFeatures.length > 4 && (
                                                        <li className="pt-1">
                                                            <button
                                                                onClick={() => toggleExpand(plan.id)}
                                                                className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                                            >
                                                                <span>
                                                                    {isExpanded
                                                                        ? 'Show less'
                                                                        : `+${enabledFeatures.length - 4} other features`}
                                                                </span>
                                                                <ChevronDown
                                                                    className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''
                                                                        }`}
                                                                />
                                                            </button>
                                                        </li>
                                                    )}
                                                </ul>
                                            )
                                        })()}
                                    </td>

                                    <td className="px-4 py-3">{plan.subcriber}</td>

                                    <td className="px-4 py-3">
                                        <span className={`${getActiveAccount(plan.isActive ?? false)}`}>
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-right relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === plan.id ? null : plan.id)}
                                            className="p-2 rounded-full hover:bg-gray-100"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuId === plan.id && (
                                            <div
                                                ref={menuRef}
                                                className="absolute right-4 mt-2 w-44 bg-white border rounded-lg shadow-lg z-20"
                                            >
                                                <button
                                                    onClick={() => toggleActive(plan)}
                                                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                    {plan.isActive ? 'Deactivate' : 'Activate'}
                                                </button>

                                                <button
                                                    onClick={() => editPlan(plan)}
                                                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-yellow-50 text-yellow-600"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit plan
                                                </button>

                                                <button
                                                    onClick={() => deletePlan(plan)}
                                                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete plan
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {openEditPlan && (
                <div className="fixed inset-0 z-50">
                    <PlanEditor
                        plan={openEditPlan}
                        setPlans={setPlans}
                        onClose={() => setOpenEditPlan(null)}
                    />
                </div>
            )}
        </div>
    )
}
