"use client"
import Footer from "@/components/FooterComponent"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useState } from "react"
import {
    BarChart3,
    CheckCircle2,
    FileText,
    MessageSquare,
    Shield,
    Users,
    Zap,
    ArrowRight,
} from "lucide-react"
import Link from "next/link"
import HeaderComponent from "@/components/HeaderComponent"
import { useRouter } from "next/navigation"
import BoardView from "@/app/Image/Board_View.png"
import BoardView2 from "@/app/Image/Board_View2.png"
import User from "@/app/Image/User1.png"
import UploadFile from "@/app/Image/UploadFile1.png"
import Chart from "@/app/Image/Chart1.png"
import Sprint from "@/app/Image/Sprint1.png"
import Member from "@/app/Image/Member1.png"
import Notification from "@/app/Image/Notification1.png"
import Timeline from "@/app/Image/TimeLine1.png"
import Image from "next/image";

const features = [
    {
        icon: Zap,
        title: "Project Management",
        desc: "Organize work efficiently with Kanban boards, timelines, and detailed permission controls",
        image: BoardView2,
        bg: "bg-blue-100",
        text: "text-blue-600",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        desc: "Work together in real-time with chat, mentions, and comments directly on tasks",
        image: Member,
        bg: "bg-emerald-100",
        text: "text-emerald-600",
    },
    {
        icon: CheckCircle2,
        title: "Progress Tracking",
        desc: "Monitor project progress, sprints, and milestones with Gantt charts or dashboards",
        image: Sprint,
        bg: "bg-amber-100",
        text: "text-amber-600",
    },
    {
        icon: Shield,
        title: "Users & Permissions",
        desc: "Sign up, login with JWT + OAuth, flexible roles: Admin, Manager, Member, Client",
        image: User,
        bg: "bg-purple-100",
        text: "text-purple-600",
    },
    {
        icon: FileText,
        title: "Documents & Files",
        desc: "Upload, manage documents, images, PDFs and attach directly to tasks",
        image: UploadFile,
        bg: "bg-sky-100",
        text: "text-sky-600",
    },
    {
        icon: MessageSquare,
        title: "Notifications & Communication",
        desc: "Get real-time notifications, email digests and track member online/offline status",
        image: Notification,
        bg: "bg-rose-100",
        text: "text-rose-600",
    },
    {
        icon: BarChart3,
        title: "Reports & Dashboard",
        desc: "Analyze workload, team performance and detailed statistics by project",
        image: Chart,
        bg: "bg-indigo-100",
        text: "text-indigo-600",
    },
];

const stats = [
    { value: "50", label: "Active Users", unit: "K+" },
    { value: "10", label: "Teams", unit: "K+" },
    { value: "99", label: "Uptime", unit: ".9%" },
    { value: "24", label: "Support", unit: "/7" },
]

export default function Page() {
    const [showDemo, setShowDemo] = useState(false);
    console.log("Show Demo: ", showDemo)
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

    // Animation cho Tiêu đề Chính (Hero Section)
    const heroVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
            <HeaderComponent />

            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-20 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2, // Hiệu ứng hiện dần cho các phần tử con
                                duration: 0.8
                            }
                        }
                    }}
                    className="space-y-6"
                >
                    <motion.h1 variants={heroVariants} className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
                        Manage projects <br className="hidden sm:inline" />
                        <span className="text-blue-600">simply and effectively</span>
                    </motion.h1>

                    <motion.p variants={heroVariants} className="text-xl text-slate-600 max-w-2xl mx-auto">
                        A comprehensive project management tool that helps your team collaborate, organize work, and achieve goals
                        faster.
                    </motion.p>

                    <motion.div variants={heroVariants}>
                        <Image
                            src={BoardView}
                            alt="App preview"
                            className="rounded-xl shadow-lg w-full "
                        />
                    </motion.div>


                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.5 } }
                        }}
                        className="flex items-center justify-center gap-4 pt-4"
                    >
                        <Link
                            href="/plan?plan=free"
                            className="rounded-full bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            Get Started
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => setShowDemo(true)}
                            className="rounded-full border border-slate-300 px-8 py-3 text-slate-900 font-semibold hover:bg-slate-50 transition">
                            Watch Demo
                        </button>
                    </motion.div>
                    {showDemo && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0, scale: 0.9 },
                                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
                            }}
                            className="pt-8 flex justify-center"
                        >
                            <video
                                src="/videos/WatchDemo.mp4"
                                className="rounded-xl shadow-lg w-full max-w-7xl"
                                autoPlay
                                loop
                                playsInline
                            />
                        </motion.div>
                    )}



                    <motion.p variants={heroVariants} className="text-sm text-slate-500 pt-4">No credit card required • Start free in 1 minutes</motion.p>
                </motion.div>
            </section>

            <section className="mx-auto max-w-6xl px-6 lg:px-8 py-16 bg-white rounded-2xl shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            className="text-center"
                            initial={{ opacity: 0, y: 50 }} // Trạng thái ban đầu
                            whileInView={{ opacity: 1, y: 0 }} // Trạng thái khi cuộn vào
                            viewport={{ once: true, amount: 0.5 }} // Chạy 1 lần, khi 50% phần tử hiển thị
                            transition={{ duration: 0.6, delay: idx * 0.1 }} // Độ trễ tăng dần
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
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Powerful Features
                    </h2>
                    <p className="text-lg text-slate-600">
                        Everything you need to manage projects successfully
                    </p>
                </div>

                <div className="space-y-20">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        const direction = idx % 2 === 0 ? -50 : 50; // Đổi hướng animation

                        return (
                            <motion.div
                                key={idx}
                                className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                                initial={{ opacity: 0, x: direction }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.4 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <div className={idx % 2 !== 0 ? "md:order-2" : "md:order-1"}>
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bg} mb-4`}>
                                        <Icon className={`h-6 w-6 ${feature.text}`} />
                                    </div>


                                    <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                                        {feature.title}
                                    </h3>

                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>

                                <div className={idx % 2 !== 0 ? "md:order-1" : "md:order-2"}>
                                    <div className="w-full h-64 rounded-xl overflow-hidden shadow-md bg-slate-100">
                                        <Image
                                            src={feature.image ?? ""}
                                            alt={feature.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>


            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-20 text-center">
                <motion.div
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-16"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
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
                </motion.div>
            </section>

            <Footer />
        </main>
    )
}