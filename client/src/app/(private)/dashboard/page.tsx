"use client"

import React from 'react'
import { Users, Layers, CreditCard } from 'lucide-react'
import User from '@/components/admin/User'
import Plan from '@/components/admin/Plan'
import { useHash } from '@/hooks/useHash'
import Payment from '@/components/admin/Payment'

type Payment = {
    id: string
    user_name: string
    amount: number
    status: 'success' | 'failed' | 'pending'
    date: string
}

interface MenuItemProps {
    icon: React.ElementType
    label: string
    isActive: boolean
    onClick: () => void
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
        `}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
)

export default function DashboardLayout() {
    const { hash: activeTab, setHash: setActiveTab } = useHash()

    const renderContent = () => {
        switch (activeTab) {
            case '':
                return <User />
            case 'plans':
                return <Plan />
            case 'payments':
                return <Payment />
            default:
                return <User />
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white h-screen p-4 sticky top-0 overflow-y-auto">
                <div className="space-y-1 mb-6">
                    <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider px-4 mb-2">Admin Tools</h3>

                    <MenuItem
                        icon={Users}
                        label="Users"
                        isActive={activeTab === ''}
                        onClick={() => setActiveTab('')}
                    />
                    <MenuItem
                        icon={Layers}
                        label="Plans"
                        isActive={activeTab === 'plans'}
                        onClick={() => setActiveTab('plans')}
                    />
                    <MenuItem
                        icon={CreditCard}
                        label="Payments"
                        isActive={activeTab === 'payments'}
                        onClick={() => setActiveTab('payments')}
                    />
                </div>
            </aside>

            <main className="flex-1 overflow-x-hidden">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}