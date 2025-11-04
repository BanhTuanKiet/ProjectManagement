import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function HeaderComponent() {
    const router = useRouter()
    
    return (
        <header className="w-full border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="cursor-pointer flex items-center gap-2" onClick={() => router.push("/")} >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <span className="text-lg font-bold text-white">P</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900">ProjectHub</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                            Sign In
                        </a>
                        <Link
                            href="/plan?plan=free"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                        >
                            Start Free
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
