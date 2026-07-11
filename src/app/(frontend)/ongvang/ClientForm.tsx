"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitContactLead } from "./actions";

export function ContactFormClient({ organizationId }: { organizationId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const res = await submitContactLead(formData);

    if (res.error) {
      setStatus("error");
      setMessage(res.error);
    } else {
      setStatus("success");
      setMessage("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.");
      (e.target as HTMLFormElement).reset();
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-5xl"
        >
          ✅
        </motion.div>
        <h3 className="text-2xl font-bold text-white">{message}</h3>
        <p className="mt-2 text-slate-400">Chuyên gia của chúng tôi sẽ liên hệ sớm nhất!</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-8 rounded-full border border-white/20 px-6 py-2.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          Gửi thêm yêu cầu
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="organizationId" value={organizationId} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="block"
        >
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Họ và tên <span className="text-amber-500">*</span>
          </span>
          <input
            required
            name="fullName"
            autoComplete="name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none ring-0 transition-all focus:border-amber-500/60 focus:bg-white/8 focus:ring-2 focus:ring-amber-500/20"
            placeholder="Nguyễn Văn A"
          />
        </motion.label>

        <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="block"
        >
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Số điện thoại <span className="text-amber-500">*</span>
          </span>
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none ring-0 transition-all focus:border-amber-500/60 focus:bg-white/8 focus:ring-2 focus:ring-amber-500/20"
            placeholder="0987 654 321"
          />
        </motion.label>
      </div>

      <motion.label
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="block"
      >
        <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none ring-0 transition-all focus:border-amber-500/60 focus:bg-white/8 focus:ring-2 focus:ring-amber-500/20"
          placeholder="email@example.com"
        />
      </motion.label>

      <motion.label
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="block"
      >
        <span className="mb-2 block text-sm font-medium text-slate-300">Nhu cầu của bạn</span>
        <textarea
          name="note"
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none ring-0 transition-all focus:border-amber-500/60 focus:bg-white/8 focus:ring-2 focus:ring-amber-500/20 resize-none"
          placeholder="Bạn đang cần hỗ trợ về dịch vụ nào? Quy mô doanh nghiệp? Ngân sách dự kiến?..."
        />
      </motion.label>

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {message}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        type="submit"
        disabled={status === "loading"}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] hover:shadow-amber-500/40 active:scale-[0.98] disabled:opacity-60"
      >
        <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full skew-x-12" />
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang gửi...
          </span>
        ) : (
          "Gửi yêu cầu tư vấn"
        )}
      </motion.button>
    </form>
  );
}
