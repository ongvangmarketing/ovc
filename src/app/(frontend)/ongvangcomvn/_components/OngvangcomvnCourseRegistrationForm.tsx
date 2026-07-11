"use client";

import { useState } from "react";
import { checkoutCourse } from "../actions";
import { useRouter } from "next/navigation";

export function OngvangcomvnCourseRegistrationForm({
  organizationId,
  courseSlug,
  courseName,
  className,
}: {
  organizationId: string;
  courseSlug: string;
  courseName: string;
  className?: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const defaultNote = className
    ? `Tôi đăng ký khóa học: ${courseName} (Lớp: ${className})`
    : `Tôi đăng ký khóa học: ${courseName}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    formData.append("organizationId", organizationId);
    formData.append("courseSlug", courseSlug);
    if (className) formData.append("className", className);

    const res = await checkoutCourse(formData);

    if (res.error) {
      setStatus("error");
      setErrorMsg(res.error);
    } else if (res.invoiceToken) {
      setStatus("success");
      // Redirect to invoice page for payment
      router.push(`/document/${res.invoiceToken}/pay`);
    } else {
      setStatus("error");
      setErrorMsg("Có lỗi xảy ra khi tạo thanh toán.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-[#eaeaea] bg-white p-8 sm:p-12">
      <div className="mb-8">
        <h3 className="text-[24px] font-medium tracking-tight text-black antialiased">Thông tin học viên</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-500 antialiased">
          Vui lòng điền thông tin để chúng tôi tạo tài khoản và hướng dẫn thanh toán.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="fullName" className="mb-2 block text-[13px] font-medium text-gray-700 antialiased">Họ và tên *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            className="w-full rounded-xl border border-[#eaeaea] bg-[#fafafa] px-4 py-3.5 text-[15px] text-black outline-none transition-colors focus:border-black focus:bg-white"
            placeholder="Nhập họ và tên của bạn"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-2 block text-[13px] font-medium text-gray-700 antialiased">Số điện thoại *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full rounded-xl border border-[#eaeaea] bg-[#fafafa] px-4 py-3.5 text-[15px] text-black outline-none transition-colors focus:border-black focus:bg-white"
              placeholder="09xx xxx xxx"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-gray-700 antialiased">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-xl border border-[#eaeaea] bg-[#fafafa] px-4 py-3.5 text-[15px] text-black outline-none transition-colors focus:border-black focus:bg-white"
              placeholder="email@domain.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="note" className="mb-2 block text-[13px] font-medium text-gray-700 antialiased">Ghi chú (Tùy chọn)</label>
          <textarea
            id="note"
            name="note"
            rows={4}
            defaultValue={defaultNote}
            className="w-full resize-none rounded-xl border border-[#eaeaea] bg-[#fafafa] px-4 py-3.5 text-[15px] text-black outline-none transition-colors focus:border-black focus:bg-white"
            placeholder="Ghi chú thêm cho quản lý lớp học"
          />
        </div>

        {status === "error" && (
          <p className="text-[14px] font-medium text-red-600 antialiased">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="mt-4 flex w-full h-14 items-center justify-center rounded-full bg-black px-8 text-[15px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed antialiased"
        >
          {status === "loading" ? "Đang xử lý..." : status === "success" ? "Chuyển sang thanh toán..." : "Thanh toán & Ghi danh"}
        </button>
      </div>
    </form>
  );
}
