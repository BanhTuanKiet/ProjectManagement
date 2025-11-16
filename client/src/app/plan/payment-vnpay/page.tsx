"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertTriangle, Phone, Mail } from "lucide-react"
import axios from "@/config/axiosConfig"

const PaymentVnPayResult = () => {
    const [status, setStatus] = useState("loading")
    const [res, setRes] = useState<any>({})

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const query = window.location.search
                const response = await axios.get(`/payments/callback${query}`)
                console.log("VNPay callback response:", response.data)
                setRes(response.data)
                setStatus(response.data.success)
            } catch (error) {
                console.log(error)
                setStatus("fail_fetch")
            }
        }

        fetchResult()
    }, [])

    const renderLogo = () => (
        <div className="text-center mb-4">
            <h2 className="text-3xl font-bold tracking-wide">
                <span className="text-red-600">VN</span>
                <span className="text-blue-600">PAY</span>
            </h2>
        </div>
    )

    const InfoRow = ({ label, value }: { label: string; value?: string }) => (
        <div className="flex justify-between text-sm py-1 border-b border-gray-100">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value || "Không rõ"}</span>
        </div>
    )

    const SupportSection = () => (
        <div className="text-center mt-6">
            <div className="flex justify-center gap-6 mb-3 text-blue-600 font-medium">
                <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>1900.5555.77</span>
                </div>
                <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>hotrovnpay@vnpay.vn</span>
                </div>
            </div>
            <div className="space-x-2 mb-1">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">Secure</span>
                <span className="bg-yellow-400 text-white px-2 py-0.5 rounded text-xs">SSL</span>
            </div>
            <p className="text-gray-400 text-xs">Phát triển bởi VNPAY © 2025</p>
        </div>
    )

    const renderContent = () => {
        if (status === "loading") {
            return (
                <div className="text-center py-10">
                    {renderLogo()}
                    <div className="flex justify-center mb-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h3 className="font-semibold text-gray-700">Đang xử lý giao dịch...</h3>
                    <p className="text-gray-400 text-sm">Vui lòng chờ trong giây lát</p>
                </div>
            )
        }

        return (
            <>
                {renderLogo()}

                <div className="text-center mb-6">
                    {status === "success" && (
                        <>
                            <CheckCircle className="w-14 h-14 mx-auto text-green-600" />
                            <h3 className="text-xl font-bold text-green-600 mt-2">Giao dịch thành công</h3>
                            <p className="text-gray-400 text-sm">Đơn hàng đã được xử lý</p>
                        </>
                    )}

                    {(status === "fail" || status === "fail_fetch") && (
                        <>
                            <AlertTriangle className="w-14 h-14 mx-auto text-red-500" />
                            <h3 className="text-xl font-bold text-red-500 mt-2">Giao dịch thất bại</h3>
                            <p className="text-gray-400 text-sm">
                                {status === "fail"
                                    ? "Đơn hàng không tồn tại hoặc đã xử lý"
                                    : "Không thể kết nối đến máy chủ"}
                            </p>
                        </>
                    )}

                    {status !== "success" && status !== "fail" && status !== "fail_fetch" && (
                        <>
                            <AlertTriangle className="w-14 h-14 mx-auto text-yellow-500" />
                            <h3 className="text-xl font-bold text-yellow-500 mt-2">Không xác định</h3>
                            <p className="text-gray-400 text-sm">Mã: {status}</p>
                        </>
                    )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                    <InfoRow label="Mã đơn hàng:" value={res.paymentId} />
                    <InfoRow label="Ngày gửi:" value={res.date} />
                    <InfoRow label="Người gửi:" value={res.name} />
                    <InfoRow label="Nội dung:" value={res.orderDescription} />
                    <InfoRow label="Số tiền:" value={res.amount ? `${res.amount} VNĐ` : ""} />
                </div>

                <SupportSection />
            </>
        )
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 px-4 py-10">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
                {renderContent()}
            </div>
        </div>
    )
}

export default PaymentVnPayResult
