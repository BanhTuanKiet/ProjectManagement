import axios from '@/config/axiosConfig'
import { AdminPayment } from '@/utils/IPlan'
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
    Ellipsis
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import ColoredAvatar from '../ColoredAvatar'
import { PaymentDetailModal } from '../PaymentDetailModal'

type SortConfig = {
    key: 'createdAt' | 'amount'
    direction: 'asc' | 'desc'
} | null

interface Filter {
    search?: string
    status?: string
    gateway?: string
}

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
                        // gateway: filter.gateway,
                    }
                })
                console.log(response.data.data)
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

    const statusBadge = (status: AdminPayment['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700'
            case 'Failed': return 'bg-red-100 text-red-700'
            default: return 'bg-yellow-100 text-yellow-700'
        }
    }

    return (
        <div className="bg-white rounded-xl">
            <div className="p-4 border-b flex flex-wrap gap-4 justify-between">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={filter.search ?? ''}
                        onChange={e => setFilter({ ...filter, search: e.target.value })}
                        placeholder="Search user / ref..."
                        className="pl-9 pr-4 py-1.5 text-sm border rounded-lg"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={filter.status ?? 'all'}
                        onChange={e => setFilter({ ...filter, status: e.target.value })}
                        className="border rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="all">All status</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                    </select>

                    {/* <select
                        value={filter.gateway ?? 'all'}
                        onChange={e => setFilter({ ...filter, gateway: e.target.value })}
                        className="border rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="all">All gateways</option>
                        <option value="VNPay">VNPay</option>
                        <option value="PayPal">PayPal</option>
                    </select> */}
                </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                <div className="flex gap-2">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        className="px-3 py-1.5 border rounded-md disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        className="px-3 py-1.5 border rounded-md disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="px-6 py-3 text-left">User</th>
                        <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSort('amount')}
                        >
                            <div className="flex items-center gap-2">Amount {sortIcon('amount')}</div>
                        </th>
                        <th className="px-6 py-3 text-left">Gateway</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSort('createdAt')}
                        >
                            <div className="flex items-center gap-2">Created {sortIcon('createdAt')}</div>
                        </th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {payments?.map(p => (
                        <tr key={p.id} className="border-b">
                            <td className="px-6 py-4 flex gap-3 items-center">
                                <ColoredAvatar id={p.user.id} name={p.user.userName} src={p.user.avatarUrl ?? ''} />
                                <div>
                                    <div className="font-medium">{p.user.userName}</div>
                                    <div className="text-xs text-gray-500">{p.user.email}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium">
                                {p.amount.toLocaleString()} {p.currency}
                            </td>
                            <td className="px-6 py-4">{p.gateway}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge(p.status)}`}>
                                    {p.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                                {new Date(p.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right relative">
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>

                                {openMenuId === p.id && (
                                    <div
                                        ref={menuRef}
                                        className="absolute right-6 mt-2 w-44 bg-white border rounded-lg shadow-lg z-20"
                                    >
                                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                            <CheckCircle className="w-4 h-4 text-green-600" /> Mark paid
                                        </button>
                                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                            <XCircle className="w-4 h-4 text-red-600" /> Mark failed
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedPayment(p)
                                                setOpenDetail(true)
                                                setOpenMenuId(null)
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                        >
                                            <Ellipsis className="w-4 h-4 text-blue-600" />View detail
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <PaymentDetailModal
                payment={selectedPayment}
                open={openDetail}
                onClose={() => setOpenDetail(false)}
            />
        </div>
    )
}
