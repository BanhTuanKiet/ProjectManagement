'use client'

import { Computer, Settings, UsersRound, Contact, Megaphone, Wand, BadgeCent, Mountain } from "lucide-react"
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import Jira from "@/app/Images/Jira.png"
import { useState } from "react"
import axios from "@/config/axiosConfig"
import { useRouter } from "next/navigation"
import { useUser } from "../(context)/UserContext";


export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { signinGG } = useUser()

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            console.log(email, password)
            const res = await axios.post("/users/login", {
                email,
                password,
            })

            console.log("Login success: ", res.data)
            localStorage.setItem("token", res.data.token)
            router.push("/project")

        } catch (err) {
            console.error(err)
        }
    }
    return (
        <>
            <div className="bg-blue-100">
                <div className="grid grid-cols-7 gap-4 p-6 mx-auto justify-center items-center text-center mr-40 ml-40">
                    <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-200 border border-transparent hover:border-gray-200">
                        <Computer className="h-6 w-6 text-gray-600 hover:text-sky-600 transition duration-200" />
                        <span className="text-sm font-medium text-gray-700 hover:text-sky-600 transition duration-200">Software</span>
                    </button>

                    <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-200 border border-transparent hover:border-gray-200">
                        <Settings className="h-6 w-6 text-gray-600 hover:text-sky-600 transition duration-200" />
                        <span className="text-sm font-medium text-gray-700 hover:text-sky-600 transition duration-200">Operations</span>
                    </button>

                    <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-200 border border-transparent hover:border-gray-200">
                        <Contact className="h-6 w-6 text-gray-600 hover:text-sky-600 transition duration-200" />
                        <span className="text-sm font-medium text-gray-700 hover:text-sky-600 transition duration-200">HR</span>
                    </button>

                    <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-200 border border-transparent hover:border-gray-200">
                        <UsersRound className="h-6 w-6 text-gray-600 hover:text-sky-600 transition duration-200" />
                        <span className="text-sm font-medium text-gray-700 hover:text-sky-600 transition duration-200">All Teams</span>
                    </button>

                    <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-200 border border-transparent hover:border-gray-200">
                        <Megaphone className="h-6 w-6 text-gray-600 hover:text-sky-600 transition duration-200" />
                        <span className="text-sm font-medium text-gray-700 hover:text-sky-600 transition duration-200">Marketing</span>
                    </button>

                    <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-200 border border-transparent hover:border-gray-200">
                        <Wand className="h-6 w-6 text-gray-600 hover:text-sky-600 transition duration-200" />
                        <span className="text-sm font-medium text-gray-700 hover:text-sky-600 transition duration-200">Design</span>
                    </button>

                    <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 hover:shadow-md transition duration-200 border border-transparent hover:border-gray-200">
                        <BadgeCent className="h-6 w-6 text-gray-600 hover:text-sky-600 transition duration-200" />
                        <span className="text-sm font-medium text-gray-700 hover:text-sky-600 transition duration-200">Sales</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 p-6 ml-40">
                    <div className="p-4 border-r border-gray-300">
                        <h1 className="text-6xl font-bold text-black">Connect every team, task and project together with Jira</h1> <br />
                        <strong className="text-sm text-black">Work email</strong>
                        <form onSubmit={handleSubmit}>
                            <Input
                                className="bg-white mt-2 mb-2 rounded-full"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <p className="text-sm text-gray-500 text-right">Forgot password?</p>
                            <Input
                                className="bg-white mt-2 mb-2 rounded-full"
                                type="password"
                                placeholder="your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-sm text-gray-500 text-right">Show password</p>
                            <p className="text-sm text-gray-500">Using a work email helps find teammates and boost collaboration.</p> <br />
                            <button className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition duration-200 w-full shadow-sm">
                                Sign up
                            </button>
                        </form>

                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-sky-100 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className="bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                    onClick={() => signinGG()}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span>Google</span>
                                </button>
                                <button className="bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2 cursor-pointer">
                                    <svg className="w-5 h-5" viewBox="0 0 88 88" fill="none">
                                        <path d="M0 0H41.6V41.6H0V0Z" fill="#F25022" />
                                        <path d="M46.4 0H88V41.6H46.4V0Z" fill="#7FBA00" />
                                        <path d="M0 46.4H41.6V88H0V46.4Z" fill="#00A4EF" />
                                        <path d="M46.4 46.4H88V88H46.4V46.4Z" fill="#FFB900" />
                                    </svg>
                                    <span>Microsoft</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <Image src={Jira}
                            alt="Jira"
                            className="w-200 h-110" />
                    </div>
                </div>
            </div>
            <footer className="bg-gray-100 mt-10 ml-30 mr-30">
                <div className="grid grid-cols-4 gap-4 p-6">
                    <div><Mountain className="h-6 w-6" /></div>
                    <div><strong>Products</strong></div>
                    <div><strong>Resources</strong></div>
                    <div><strong>Learn</strong></div>
                    <div><strong>Company</strong></div>
                    <div>Rovo</div>
                    <div>Technical support</div>
                    <div>Partners</div>
                    <div><strong>Careers</strong></div>
                    <div>Jira</div>
                    <div>Purchasing & licensing</div>
                    <div>Training & certification</div>
                    <div><strong>Events</strong></div>
                    <div>Jira Align</div>
                    <div>Atlassian Community</div>
                    <div>Documentation</div>
                    <div><strong>Blogs</strong></div>
                    <div>Jira Service Management</div>
                    <div>Knowledge base</div>
                    <div>Developer resources</div>
                    <div><strong>Investor Relations</strong></div>
                    <div>Confluence</div>
                    <div>Marketplace</div>
                    <div>Enterprise services</div>
                </div>
            </footer>
        </>
    )
}