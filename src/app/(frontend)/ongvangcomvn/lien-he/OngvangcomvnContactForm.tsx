"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitLead } from "../actions";

export function OngvangcomvnContactForm({ organizationId }: { organizationId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const res = await submitLead(fd);
    if (res.error) { setStatus("error"); setErrorMsg(res.error); }
    else { setStatus("success"); (e.target as HTMLFormElement).reset(); }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-[#eaeaea] bg-white py-14 text-center"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }}
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[24px] ring-1 ring-emerald-100"
        >
          ✅
        </motion.div>
        <h3 className="text-[24px] font-medium tracking-tight text-black">Đã gửi thành công</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-500">Chuyên gia sẽ liên hệ trong vòng 24 giờ làm việc.</p>
        <button onClick={() => setStatus("idle")} className="mt-6 rounded-full border border-[#eaeaea] bg-white px-5 py-2.5 text-[14px] font-medium text-black transition-colors hover:bg-gray-50">
          Gửi yêu cầu khác
        </button>
      </motion.div>
    );
  }

  const fieldCls = "w-full rounded-md border border-[#eaeaea] bg-white px-3.5 py-3 text-[14px] text-black placeholder:text-gray-400 outline-none transition-colors focus:border-black";
  const labelCls = "mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="organizationId" value={organizationId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Họ và tên <span className="text-black">*</span></span>
          <input required name="fullName" autoComplete="name" className={fieldCls} placeholder="Nguyễn Văn A" />
        </label>
        <label className="block">
          <span className={labelCls}>Số điện thoại <span className="text-black">*</span></span>
          <input required name="phone" type="tel" autoComplete="tel" className={fieldCls} placeholder="0987 654 321" />
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Email</span>
        <input type="email" name="email" autoComplete="email" className={fieldCls} placeholder="email@company.com" />
      </label>

      <label className="block">
        <span className={labelCls}>Nhu cầu của bạn</span>
        <textarea
          name="note"
          rows={4}
          className={`${fieldCls} resize-none`}
          placeholder="Bạn đang cần hỗ trợ dịch vụ nào? Quy mô, ngành hàng, ngân sách dự kiến?..."
        />
      </label>

      {status === "error" && (
        <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-black px-6 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang gửi...
          </span>
        ) : "Gửi yêu cầu tư vấn"}
      </button>
    </form>
  );
}
