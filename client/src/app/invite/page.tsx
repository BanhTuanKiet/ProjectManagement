"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/config/axiosConfig";

export default function InviteAccept() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xử lý lời mời...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Không tìm thấy token trong đường dẫn.");
      return;
    }

    // ⚠️ 1. Kiểm tra xem người dùng đã đăng nhập chưa
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true }); // endpoint backend trả thông tin user
        if (!res.data || !res.data.email) {
          throw new Error("Chưa đăng nhập");
        }
      } catch {
        // Chưa đăng nhập → redirect qua login
        router.push(`/login?redirect=/invite?token=${token}`);
        return;
      }

      // ⚙️ 2. Nếu đã đăng nhập → gọi API acceptInvitation
      try {
        const res = await axios.post(`/projects/acceptInvitation?token=${token}`, null, {
          withCredentials: true,
        });
        setStatus("success");
        setMessage(res.data.message || "Chấp nhận lời mời thành công!");
        setTimeout(() => router.push("/projects"), 2000);
      } catch (err: any) {
        const errorData = err.response?.data;
        setStatus("error");
        setMessage(
          typeof errorData === "object"
            ? errorData.ErrorMessage || "Đã xảy ra lỗi khi chấp nhận lời mời."
            : errorData || "Đã xảy ra lỗi khi chấp nhận lời mời."
        );
      }
    };

    checkAuth();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md">
        {status === "loading" && (
          <div className="animate-pulse text-gray-500">{message}</div>
        )}
        {status === "success" && (
          <div className="text-green-600 font-semibold">{message}</div>
        )}
        {status === "error" && (
          <div className="text-red-600 font-semibold">{message}</div>
        )}
      </div>
    </div>
  );
}
