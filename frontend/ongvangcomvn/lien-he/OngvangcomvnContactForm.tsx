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
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }}
          className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-5xl ring-1 ring-emerald-200"
        >
          ✅
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-900">Đã gửi thành công!</h3>
        <p className="mt-2 text-slate-500">Chuyên gia sẽ liên hệ trong vòng 24 giờ làm việc.</p>
        <button onClick={() => setStatus("idle")} className="mt-6 rounded-full border border-slate-200 px-5 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          Gửi yêu cầu khác
        </button>
      </motion.div>
    );
  }

  const fieldCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="organizationId" value={organizationId} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Họ và tên <span className="text-orange-500">*</span></span>
          <input required name="fullName" autoComplete="name" className={fieldCls} placeholder="Nguyễn Văn A" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Số điện thoại <span className="text-orange-500">*</span></span>
          <input required name="phone" type="tel" autoComplete="tel" className={fieldCls} placeholder="0987 654 321" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
        <input type="email" name="email" autoComplete="email" className={fieldCls} placeholder="email@company.com" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nhu cầu của bạn</span>
        <textarea
          name="note"
          rows={5}
          className={`${fieldCls} resize-none`}
          placeholder="Bạn đang cần hỗ trợ dịch vụ nào? Quy mô, ngành hàng, ngân sách dự kiến?..."
        />
      </label>

      {status === "error" && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] hover:shadow-orange-300 active:scale-[0.98] disabled:opacity-60"
      >
        <span className="absolute inset-0 -translate-x-full bg-white/15 transition-transform duration-700 group-hover:translate-x-full skew-x-12" />
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
