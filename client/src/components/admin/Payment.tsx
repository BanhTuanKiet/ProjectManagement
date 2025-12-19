import axios from '@/config/axiosConfig'
import { AdminPayment, Revenue } from '@/utils/IPlan'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    MoreHorizontal,
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Ellipsis,
    DollarSign,
    CreditCard,
    LucideIcon,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import ColoredAvatar from '../ColoredAvatar'
import { PaymentDetailModal } from '../PaymentDetailModal'
import RevenueChart from '../RevenueChart'
import { paymentStatusBadge } from '@/utils/statusUtils'

type SortConfig = {
    key: 'createdAt' | 'amount'
    direction: 'asc' | 'desc'
} | null

interface StatCardProps {
    title: string
    value: string | number
    subText: string
    icon: LucideIcon
    color: string
}
interface Filter {
    search?: string
    status?: string
    gateway?: string
}

const StatCard = ({ title, value, subText, icon: Icon, color }: StatCardProps) => (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-start justify-between h-full">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className={`text-xs mt-1 ${subText.includes('+') ? 'text-green-600' : 'text-gray-500'}`}>
                {subText}
            </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
)

export default function Payment() {
    const [payments, setPayments] = useState<AdminPayment[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [sortConfig, setSortConfig] = useState<SortConfig>(null)
    const [filter, setFilter] = useState<Filter>({})
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null)
    const [openDetail, setOpenDetail] = useState(false)

    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [chartData, setChartData] = useState<Revenue[]>([]);

    const [stats, setStats] = useState({
        totalRevenue: 0,
        transactions: 0
    })

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const [year, month] = selectedMonth.split('-').map(Number)
                const response = await axios.get(`/admins/payments/revenue/${month}/${year}`)

                setChartData(response.data ?? [])
                setStats({
                    totalRevenue: response.data.reduce(
                        (acc: number, cur: Revenue) => acc + cur.total,
                        0
                    ),
                    transactions: response.data.reduce(
                        (acc: number, cur: Revenue) => acc + cur.transactionCount,
                        0
                    )
                })
            } catch (error) {
                console.log(error)
            }
        }

        fetchRevenue()
    }, [selectedMonth])

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(filter.search ?? '')
            setPage(0)
        }, 500)
        return () => clearTimeout(t)
    }, [filter.search])

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/admins/payments/${page}`, {
                    params: {
                        search: debouncedSearch,
                        status: filter.status,
                        sortKey: sortConfig?.key,
                        sortDirection: sortConfig?.direction
                    }
                })
                setPayments(response.data.data)
                setTotalPages(response.data.totalPages)
            } finally {
                setLoading(false)
            }
        }
        fetchPayments()
    }, [page, debouncedSearch, filter.status, sortConfig])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const requestSort = (key: 'createdAt' | 'amount') => {
        setSortConfig(prev => ({
            key,
            direction: prev?.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const sortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3" />
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3 h-3" />
            : <ArrowDown className="w-3 h-3" />
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        subText={`in ${selectedMonth}`}
                        icon={DollarSign}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        title="Total Transactions"
                        value={stats.transactions}
                        subText="Successful orders"
                        icon={CreditCard}
                        color="bg-blue-500"
                    />
                </div>

                <div className="lg:col-span-3">
                    <RevenueChart
                        data={chartData}
                        selectedMonth={selectedMonth}
                        onMonthChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm">
                <div className="p-4 border-b flex flex-wrap gap-4 justify-between items-center">
                    <h2 className="font-semibold text-lg">Transaction History</h2>

                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={filter.search ?? ''}
                                onChange={e => setFilter({ ...filter, search: e.target.value })}
                                placeholder="Search user / ref..."
                                className="pl-9 pr-4 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <select
                            value={filter.status ?? 'all'}
                            onChange={e => setFilter({ ...filter, status: e.target.value })}
                            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All status</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="border-b">
                                <th className="px-6 py-3 text-left font-medium text-gray-500">User</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 cursor-pointer" onClick={() => requestSort('amount')}>
                                    <div className="flex items-center gap-2">Amount {sortIcon('amount')}</div>
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500">Gateway</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 cursor-pointer" onClick={() => requestSort('createdAt')}>
                                    <div className="flex items-center gap-2">Created {sortIcon('createdAt')}</div>
                                </th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No payments found</td></tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 flex gap-3 items-center">
                                            <ColoredAvatar id={p.user.id} name={p.user.userName} src={p.user.avatarUrl ?? ''} />
                                            <div>
                                                <div className="font-medium text-gray-900">{p.user.userName}</div>
                                                <div className="text-xs text-gray-500">{p.user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {p.amount.toLocaleString()} {p.currency}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{p.gateway}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusBadge(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(p.createdAt).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                                                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>

                                            {openMenuId === p.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute right-6 mt-1 w-48 bg-white border rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
                                                >
                                                    <div className="py-1">
                                                        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                                            <CheckCircle className="w-4 h-4 text-green-600" /> Mark as paid
                                                        </button>
                                                        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                                            <XCircle className="w-4 h-4 text-red-600" /> Mark as failed
                                                        </button>
                                                        <hr className="my-1 border-gray-100" />
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayment(p)
                                                                setOpenDetail(true)
                                                                setOpenMenuId(null)
                                                            }}
                                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Ellipsis className="w-4 h-4 text-blue-600" /> View details
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                    <span className="text-sm text-gray-500">Page {page + 1} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            className="p-2 border bg-white rounded-md disabled:opacity-50 hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            className="p-2 border bg-white rounded-md disabled:opacity-50 hover:bg-gray-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <PaymentDetailModal
                payment={selectedPayment}
                open={openDetail}
                onClose={() => setOpenDetail(false)}
            />
        </div>
    )
}