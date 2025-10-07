"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/config/axiosConfig";

export default function InviteAccept() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Đang xử lý lời mời...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Không tìm thấy token trong đường dẫn.");
      return;
    }

    const acceptInvitation = async () => {
      try {
        const res = await axios.post(`/projects/acceptInvitation/accept?token=${token}`);
        setMessage(res.data.message || "Chấp nhận lời mời thành công!");
        setTimeout(() => router.push("/projects"), 2000);
      } catch (err: any) {
        setMessage(err.response?.data || "Đã xảy ra lỗi khi chấp nhận lời mời.");
      }
    };

    acceptInvitation();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-lg font-semibold">{message}</h1>
      </div>
    </div>
  );
}
