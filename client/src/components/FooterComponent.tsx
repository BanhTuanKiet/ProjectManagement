import React from 'react'

export default function FooterComponent() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl p-6 lg:px-8 pt-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-center">
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Security
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Community
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Terms
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Privacy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-slate-900">
                                    Cookies
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
                    <p className="text-sm text-slate-600">© 2025 ProjectHub. All rights reserved.</p>
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
    )
}
