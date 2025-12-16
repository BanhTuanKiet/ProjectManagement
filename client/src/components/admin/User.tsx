import axios from '@/config/axiosConfig'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    MoreHorizontal,
    Search,
    Ban,
    AlertTriangle,
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import ColoredAvatar from '../ColoredAvatar'
import { AdminUser } from '@/utils/IUser'
import { getActiveAccount, getSubscriptionBadge } from '@/utils/statusUtils'

type SortConfig = {
    key: 'userName'
    direction: 'asc' | 'desc'
} | null

interface filter {
    isActive?: string
    search?: string
    plan?: string
}

const PAGE_SIZE = 10

export default function User() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [sortConfig, setSortConfig] = useState<SortConfig>(null)
    const [filter, setFiler] = useState<filter>({})
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        setPage(0)
    }, [filter.isActive, filter.plan, sortConfig])

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(filter.search ?? '')
            setPage(0)
        }, 500)

        return () => clearTimeout(t)
    }, [filter.search])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)

                const response = await axios.get(`/admins/users/${page}`, {
                    params: {
                        direction: sortConfig?.direction,
                        search: debouncedSearch,
                        isActive: filter.isActive,
                        plan: filter.plan
                    }
                })

                setUsers(response.data.data)
                setTotalPages(response.data.totalPages)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [page, debouncedSearch, filter.isActive, filter.plan, sortConfig?.direction])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const requestSort = () => {
        setSortConfig(prev => ({
            key: 'userName',
            direction: prev?.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const getSortIcon = () =>
        !sortConfig ? <ArrowUpDown className="h-3 w-3" /> :
            sortConfig.direction === 'asc'
                ? <ArrowUp className="h-3 w-3" />
                : <ArrowDown className="h-3 w-3" />

    const toggleActive = async (user: AdminUser) => {
        if (!confirm(`Are you sure you want to ${user.isActive ? 'ban' : 'unban'} this account?`)) return
        try {
            setActionLoading(user.id)
            await axios.put(`/admins/users/${user.id}/toggle-active`)
            setUsers(prev =>
                prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
            )
        } finally {
            setActionLoading(null)
            setOpenMenuId(null)
        }
    }

    const warnUser = async (user: AdminUser) => {
        if (!confirm('Send warning to this user?')) return
        await axios.post(`/admins/users/${user.id}/warn`)
        alert('Warning sent')
        setOpenMenuId(null)
    }

    const deleteUser = async (user: AdminUser) => {
        if (!confirm('⚠️ Delete this account permanently?')) return
        try {
            setActionLoading(user.id)
            await axios.delete(`/admins/users/${user.id}`)
            setUsers(prev => prev.filter(u => u.id !== user.id))
        } finally {
            setActionLoading(null)
            setOpenMenuId(null)
        }
    }

    return (
        <div className="bg-white">
            {loading && (
                <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                    <span className="text-sm text-gray-500 animate-pulse">
                        Loading users...
                    </span>
                </div>
            )}

            <div className="p-4 border-b flex flex-wrap gap-4 justify-between">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={filter.search ?? ""}
                        onChange={e => setFiler({ ...filter, search: e.target.value })}
                        placeholder="Search user..."
                        className="pl-9 pr-4 py-1.5 text-sm border rounded-lg"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={filter.isActive ?? "all"}
                        onChange={e => setFiler({ ...filter, isActive: e.target.value })}
                        className="border rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="all">All status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select
                        value={filter.plan ?? "all"}
                        onChange={e => setFiler({ ...filter, plan: e.target.value })}
                        className="border rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="all">All plans</option>
                        <option value="Free">Free</option>
                        <option value="Pro">Pro</option>
                        <option value="Premium">Premium</option>
                    </select>
                </div>
            </div>

            {!users.length ?
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search or filter
                    </p>
                </div>
                :
                <>
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                        <span className="text-sm text-gray-500">
                            Page {page + 1} of {totalPages}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                className="cursor-pointer px-3 py-1.5 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`cursor-pointer px-2.5 py-1 border rounded-md text-sm font-medium ${i === page
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                        } transition`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                className="cursor-pointer px-3 py-1.5 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th onClick={requestSort} className="px-6 py-3 cursor-pointer">
                                    <div className="flex gap-2 items-center">
                                        User {getSortIcon()}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-start">Status</th>
                                <th className="px-6 py-3 text-start">Plan</th>
                                <th className="px-6 py-3 text-end">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users?.map(user => (
                                <tr key={user.id} className={`border-b ${!user.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                                    <td className="px-6 py-4 flex gap-3 items-center">
                                        <ColoredAvatar id={user.id} name={user.userName} src={user.avatarUrl ?? ''} />
                                        <div>
                                            <div className="font-medium">{user.userName}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={getActiveAccount(user.isActive)}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={getSubscriptionBadge(user.subcription?.planName ?? 'Free')}>
                                            {user.subcription?.planName ?? 'Free'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                            className="p-2 rounded-full hover:bg-gray-100"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        {openMenuId === user.id && (
                                            <div
                                                ref={menuRef}
                                                className="absolute right-6 mt-2 w-44 bg-white border rounded-lg shadow-lg z-20"
                                            >
                                                <button
                                                    onClick={() => toggleActive(user)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                    {user.isActive ? 'Ban account' : 'Unban account'}
                                                </button>

                                                <button
                                                    onClick={() => warnUser(user)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-yellow-600"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Warn user
                                                </button>

                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete account
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            }
        </div>
    )
}