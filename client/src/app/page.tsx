"use client"
import Footer from "@/components/FooterComponent"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import {
    BarChart3,
    CheckCircle2,
    FileText,
    MessageSquare,
    Shield,
    Users,
    Wallet,
    Zap,
    ArrowRight,
} from "lucide-react"
import Link from "next/link"
import HeaderComponent from "@/components/HeaderComponent"
import { useRouter } from "next/navigation"

const features = [
    {
        icon: Zap,
        title: "Project Management",
        desc: "Organize work efficiently with Kanban boards, timelines, and detailed permission controls",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        desc: "Work together in real-time with chat, mentions, and comments directly on tasks",
    },
    {
        icon: CheckCircle2,
        title: "Progress Tracking",
        desc: "Monitor project progress, sprints, and milestones with Gantt charts or dashboards",
    },
    {
        icon: Shield,
        title: "Users & Permissions",
        desc: "Sign up, login with JWT + OAuth, flexible roles: Admin, Manager, Member, Client",
    },
    {
        icon: Wallet,
        title: "Payments & Plans",
        desc: "Track transactions, manage Free / Premium plans and different usage benefits",
    },
    {
        icon: FileText,
        title: "Documents & Files",
        desc: "Upload, manage documents, images, PDFs and attach directly to tasks",
    },
    {
        icon: MessageSquare,
        title: "Notifications & Communication",
        desc: "Get real-time notifications, email digests and track member online/offline status",
    },
    {
        icon: BarChart3,
        title: "Reports & Dashboard",
        desc: "Analyze workload, team performance and detailed statistics by project",
    },
]

const stats = [
    { value: "50", label: "Active Users", unit: "K+" },
    { value: "10", label: "Teams", unit: "K+" },
    { value: "99", label: "Uptime", unit: ".9%" },
    { value: "24", label: "Support", unit: "/7" },
]

export default function Page() {
    const router = useRouter()
    const CountUpNumber = ({ value, duration }: { value: string, duration: number }) => {
        const count = useMotionValue(0)
        const rounded = useTransform(count, (latest) => Math.floor(latest))

        useEffect(() => {
            const controls = animate(count, parseFloat(value), {
                duration,
                ease: "easeOut",
            })
            return controls.stop
        }, [value])

        return <motion.span>{rounded}</motion.span>
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
            <HeaderComponent />

            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-20 text-center">
                <div className="space-y-6">
                    <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
                        Manage projects <br className="hidden sm:inline" />
                        <span className="text-blue-600">simply and effectively</span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        A comprehensive project management tool that helps your team collaborate, organize work, and achieve goals
                        faster.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Link
                            href="/plan?plan=free"
                            className="rounded-full bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            Get Started 
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <button className="rounded-full border border-slate-300 px-8 py-3 text-slate-900 font-semibold hover:bg-slate-50 transition">
                            Watch Demo
                        </button>
                    </div>

                    <p className="text-sm text-slate-500 pt-4">No credit card required • Start free in 1 minutes</p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 lg:px-8 py-16 bg-white rounded-2xl shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                        >
                            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                                <CountUpNumber value={stat.value} duration={1} />
                                {stat.unit}
                            </div>
                            <div className="text-sm text-slate-600">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
                    <p className="text-lg text-slate-600">Everything you need to manage projects successfully</p>
                </div>
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

            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-20 text-center">
                <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of teams using ProjectHub to manage projects effectively.
                    </p>
                    <Link
                        href="/plan?plan=free"
                        className="inline-block rounded-full bg-white px-8 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition"
                    >
                        Start Free Now
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    )
}
