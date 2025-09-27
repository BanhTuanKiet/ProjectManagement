"use client"
import { Computer, Settings,UsersRound, Contact, Megaphone, Wand, BadgeCent, Mountain, ChevronDown } from "lucide-react"
import Image from 'next/image';
import JiraHome from "@/app/Images/JiraHome.png"
import { useState } from "react";

export default function Page() {
  const features = [
    { title: "Pages", desc: "Create and share knowledge", color: "text-yellow-500" },
    { title: "Whiteboards", desc: "Collaborative diagrams", color: "text-indigo-500" },
    { title: "Databases", desc: "Organize structured info", color: "text-green-500" },
    { title: "Spaces", desc: "Organize people & work", color: "text-orange-500" },
  ]

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="w-full border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6 ml-20">
              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer">
                {/* <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h6v6H3z" fill="#0B66FF"/>
                  <path d="M15 3h6v6h-6z" fill="#0B66FF" opacity="0.2"/>
                  <path d="M3 15h6v6H3z" fill="#0B66FF" opacity="0.6"/>
                  <path d="M15 15h6v6h-6z" fill="#0B66FF" />
                </svg> */}
                <Mountain className="h-8 w-8 text-blue-600" />
                <span className="font-semibold text-3xl">  ATLASSIAN </span>
              </div>

              {/* Nav */}
              <nav className="hidden md:flex items-center gap-6 text-normal text-black pt-3 ml-3">
                <a href="#">Products <ChevronDown className="inline h-4 w-4" /></a>
                <a href="#">Solutions <ChevronDown className="inline h-4 w-4" /></a>
                <a href="#">Why atlassian? <ChevronDown className="inline h-4 w-4" /></a>
                <a href="#" className="hidden lg:inline">Resources <ChevronDown className="inline h-4 w-4" /></a>
                <a href="#" className="hidden lg:inline">Enterprise</a>
              </nav>
            </div>

            {/* User section */}
            <div className="flex items-center gap-4">
              {/* <button className="hidden md:inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200">
                Search
              </button> */}

              <a href="http://localhost:3000/login" className="mt-3 hidden md:inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-100 transition">
                Sign in</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pt-12 pb-20">
        <div className="text-center">
          <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            Unleash knowledge <br className="hidden md:inline" /> with Jira +{" "}
            <span className="text-black">Confluence</span>
          </h1>

          <p className="mt-6 text-gray-600 max-w-l mx-auto text-base sm:text-lg">
            Collaborate, document, and organize work — all in one place.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <a className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-white font-semibold shadow hover:bg-blue-700 transition">
              Get started
            </a>
          </div>
        </div>

          <div className="grid grid-cols-7 gap-4 p-6 pt-12 mx-auto justify-center items-center text-center mr-40 ml-40">
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
                    <UsersRound className="h-6 w-6 text-gray-600 hover:text-sky-600 transition" />
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

        {/* Features */}
        <div className="mt-12">
          <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 p-6 text-center hover:shadow-lg transition"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-50">
                  <svg className={`h-7 w-7 ${f.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <figure>
        <Image src={JiraHome} alt="JiraHome" className="mx-auto max-w-5xl px-6 lg:px-8 pt-12 pb-20" />
      </figure>
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
    </main>
  )
}
