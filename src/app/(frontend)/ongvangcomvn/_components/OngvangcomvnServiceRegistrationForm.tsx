"use client";

import { useState } from "react";
import { submitLead } from "../actions";

export function OngvangcomvnServiceRegistrationForm({
  organizationId,
  serviceName,
  optionName,
}: {
  organizationId: string;
  serviceName: string;
  optionName?: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const defaultNote = optionName
    ? `Tôi quan tâm đến dịch vụ: ${serviceName} (Gói: ${optionName})`
    : `Tôi quan tâm đến dịch vụ: ${serviceName}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    formData.append("organizationId", organizationId);

    const res = await submitLead(formData);

    if (res.error) {
      setStatus("error");
      setErrorMsg(res.error);
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-[#eaeaea] bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600 mb-6">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-3 text-[24px] font-medium tracking-tight text-black antialiased">Đăng ký thành công!</h3>
        <p className="text-[15px] leading-relaxed text-gray-500 antialiased">
          Cảm ơn bạn đã quan tâm đến dịch vụ <strong>{serviceName}</strong>. Đội ngũ Ong Vàng sẽ liên hệ lại trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-[#eaeaea] bg-white p-8 sm:p-12">
      <div className="mb-8">
        <h3 className="text-[24px] font-medium tracking-tight text-black antialiased">Thông tin đăng ký</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-500 antialiased">
          Vui lòng để lại thông tin để chúng tôi tư vấn chi tiết hơn về {optionName ? `gói ${optionName}` : "dịch vụ này"}.
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
            <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-gray-700 antialiased">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full rounded-xl border border-[#eaeaea] bg-[#fafafa] px-4 py-3.5 text-[15px] text-black outline-none transition-colors focus:border-black focus:bg-white"
              placeholder="email@domain.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="note" className="mb-2 block text-[13px] font-medium text-gray-700 antialiased">Ghi chú thêm</label>
          <textarea
            id="note"
            name="note"
            rows={4}
            defaultValue={defaultNote}
            className="w-full resize-none rounded-xl border border-[#eaeaea] bg-[#fafafa] px-4 py-3.5 text-[15px] text-black outline-none transition-colors focus:border-black focus:bg-white"
            placeholder="Bạn cần chúng tôi hỗ trợ thêm thông tin gì?"
          />
        </div>

        {status === "error" && (
          <p className="text-[14px] font-medium text-red-600 antialiased">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-4 flex w-full h-14 items-center justify-center rounded-full bg-black px-8 text-[15px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed antialiased"
        >
          {status === "loading" ? "Đang gửi..." : "Hoàn tất đăng ký"}
        </button>
      </div>
    </form>
  );
}
