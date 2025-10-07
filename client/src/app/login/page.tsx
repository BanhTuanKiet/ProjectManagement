'use client'

import { Computer, Settings,UsersRound, Contact, Megaphone, Wand, BadgeCent, Mountain} from "lucide-react"
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import Jira from "@/app/Images/Jira.png"
import { useState } from "react"
import axios from "@/config/axiosConfig"
import { useRouter } from "next/navigation"


export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const router = useRouter()

    const signinGG = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        let apiUrl = "http://localhost:5144/users/signin-google";
        if (token) {
            apiUrl += `?token=${token}`;
        }

        window.location.href = apiUrl;
    }

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

        } catch (err: any) {
            console.error("Login failed:", err.response?.data || err.message)
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
                <button className="bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2" onClick={signinGG}>
                    {/* Thêm icon Google ở đây nếu có */}
                    <span>Google</span>
                </button>
                <button className="bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2">
                    {/* Thêm icon Microsoft ở đây nếu có */}
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