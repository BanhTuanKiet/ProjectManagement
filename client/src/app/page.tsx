"use client"
import { BarChart3, CheckCircle2, FileText, MessageSquare, Shield, Users, Wallet, Zap } from "lucide-react"
import PricingTable from "@/components/pricing-table"

export default function Page() {
    const features = [
        {
            icon: Zap,
            title: "Quản lý dự án",
            desc: "Tổ chức công việc hiệu quả với bảng Kanban, timeline và phân quyền chi tiết",
        },
        {
            icon: Users,
            title: "Cộng tác nhóm",
            desc: "Làm việc cùng nhau trong thời gian thực với chat, mention và bình luận trong task",
        },
        {
            icon: CheckCircle2,
            title: "Theo dõi tiến độ",
            desc: "Giám sát tiến độ dự án, sprint và milestone trên Gantt chart hoặc dashboard",
        },
        {
            icon: Shield,
            title: "Người dùng & Phân quyền",
            desc: "Đăng ký, đăng nhập JWT + OAuth, vai trò linh hoạt: Admin, Manager, Member, Client",
        },
        {
            icon: Wallet,
            title: "Thanh toán & Gói dịch vụ",
            desc: "Theo dõi giao dịch, quản lý gói Free / Premium và quyền lợi sử dụng khác nhau",
        },
        {
            icon: FileText,
            title: "Tài liệu & File",
            desc: "Upload, quản lý tài liệu, hình ảnh, PDF và đính kèm trực tiếp vào task",
        },
        {
            icon: MessageSquare,
            title: "Thông báo & Giao tiếp",
            desc: "Nhận thông báo realtime, email digest và theo dõi trạng thái online/offline của thành viên",
        },
        {
            icon: BarChart3,
            title: "Báo cáo & Dashboard",
            desc: "Phân tích workload, hiệu suất thành viên và thống kê chi tiết theo dự án",
        },
    ]

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
            <header className="w-full border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                <span className="text-lg font-bold text-white">P</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">ProjectHub</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <a
                                href="http://localhost:3000/login"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                            >
                                Đăng nhập
                            </a>
                            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
                                Bắt đầu miễn phí
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-20 text-center">
                <div className="space-y-6">
                    <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
                        Quản lý dự án <br className="hidden sm:inline" />
                        <span className="text-blue-600">đơn giản và hiệu quả</span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Công cụ quản lý dự án toàn diện giúp nhóm của bạn cộng tác, tổ chức công việc và hoàn thành mục tiêu nhanh
                        hơn.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button className="rounded-full bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
                            Bắt đầu ngay
                        </button>
                        <button className="rounded-full border border-slate-300 px-8 py-3 text-slate-900 font-semibold hover:bg-slate-50 transition">
                            Xem demo
                        </button>
                    </div>

                    <p className="text-sm text-slate-500 pt-4">Không cần thẻ tín dụng • Bắt đầu miễn phí trong 2 phút</p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon
                        return (
                            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-8 hover:shadow-lg transition">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
                                    <Icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600">{feature.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </section>

            <div className="px-6 lg:px-8 py-20">
                <PricingTable />
            </div>

            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-20 text-center">
                <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng để bắt đầu?</h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                        Tham gia hàng nghìn nhóm đang sử dụng ProjectHub để quản lý dự án hiệu quả.
                    </p>
                    <button className="rounded-full bg-white px-8 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition">
                        Bắt đầu miễn phí ngay
                    </button>
                </div>
            </section>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Sản phẩm</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Tính năng
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Giá cả
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Bảo mật
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Công ty</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Về chúng tôi
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Liên hệ
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Hỗ trợ</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Tài liệu
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Hỗ trợ
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Cộng đồng
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Pháp lý</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Điều khoản
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Quyền riêng tư
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-slate-900">
                                        Cookie
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
                        <p className="text-sm text-slate-600">© 2025 ProjectHub. Tất cả quyền được bảo lưu.</p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-600 hover:text-slate-900">
                                Twitter
                            </a>
                            <a href="#" className="text-slate-600 hover:text-slate-900">
                                LinkedIn
                            </a>
                            <a href="#" className="text-slate-600 hover:text-slate-900">
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    )
}
