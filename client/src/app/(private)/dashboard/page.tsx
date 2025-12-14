"use client";

import React, { useState, useEffect } from 'react';
import {
    Users, Layers, CreditCard, Search, MoreHorizontal, Check,
    ArrowUpRight, Folder, Plus, ChevronUp, ChevronDown
} from 'lucide-react';
import User from '@/components/admin/User';
import Plan from '@/components/admin/Plan';

type TabId = 'dashboard' | 'users' | 'plans' | 'payments';

type Payment = {
    id: string;
    user_name: string;
    amount: number;
    status: 'success' | 'failed' | 'pending';
    date: string;
};

const MOCK_DATA = {
    payments: [
        { id: 'tx_1', user_name: 'Nguyễn Văn A', amount: 499000, status: 'success', date: '25/10/2023' },
        { id: 'tx_2', user_name: 'Lê Hoàng C', amount: 199000, status: 'failed', date: '24/10/2023' },
        { id: 'tx_3', user_name: 'Phạm D', amount: 499000, status: 'pending', date: '24/10/2023' },
        { id: 'tx_4', user_name: 'Trần Thị B', amount: 999000, status: 'success', date: '23/10/2023' },
    ] as Payment[],
};

const fetchMockData = <T,>(key: keyof typeof MOCK_DATA): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_DATA[key] as T);
        }, 500);
    });
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        success: 'bg-green-100 text-green-700',
        inactive: 'bg-gray-100 text-gray-700',
        failed: 'bg-red-100 text-red-700',
        pending: 'bg-yellow-100 text-yellow-700',
        default: 'bg-gray-100 text-gray-700',
    };

    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.default}`}>
            {displayStatus}
        </span>
    );
};

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
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
);

interface SidebarProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    return (
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white h-screen p-4 sticky top-0 overflow-y-auto">
            <div className="space-y-1 mb-6">
                <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider px-4 mb-2">Admin Tools</h3>

                <MenuItem
                    icon={Users}
                    label="Users"
                    isActive={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
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
    );
};

const PaymentsView = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchMockData<Payment[]>('payments').then((data) => {
            setPayments(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Đang tải lịch sử giao dịch...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">Total Revenue</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">150.000.000 ₫</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">MRR</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">45.000.000 ₫</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">Success Rate</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">98.5%</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">Pending</div>
                    <div className="text-2xl font-bold text-yellow-600 mt-1">5</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-700">Latest Transactions</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                        <tr>
                            <th className="px-6 py-3">Transaction ID</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-500 text-xs">{payment.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{payment.user_name}</td>
                                <td className="px-6 py-4 text-gray-500">{payment.date}</td>
                                <td className="px-6 py-4 font-medium">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function DashboardLayout() {
    const [activeTab, setActiveTab] = useState<TabId>('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <User />
            case 'plans':
                return <Plan />
            case 'payments':
                return <PaymentsView />
            default:
                return <User />
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 overflow-x-hidden">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}