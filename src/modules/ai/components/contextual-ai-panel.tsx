"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, FilePenLine, ListChecks, LoaderCircle, Maximize2, MessageCircle, Send, Sparkles, WandSparkles, X } from "lucide-react";
import { motion } from "framer-motion";

type AIMode = "AUTO" | "ANALYZE" | "DRAFT" | "PLAN";

const aiModes: Array<{ value: AIMode; label: string; icon: typeof Sparkles }> = [
  { value: "AUTO", label: "Tự động", icon: WandSparkles },
  { value: "ANALYZE", label: "Phân tích", icon: BarChart3 },
  { value: "DRAFT", label: "Soạn thảo", icon: FilePenLine },
  { value: "PLAN", label: "Lập kế hoạch", icon: ListChecks },
];

const AI_SESSION_KEY = "ovc-ai-session-v1";

const moduleCopy: Record<string, { name: string; greeting: string; suggestions: string[] }> = {
  crm: { name: "CRM", greeting: "Tôi có thể phân tích khách hàng, cơ hội và hoạt động CRM của tổ chức.", suggestions: ["Cơ hội nào cần ưu tiên?", "Tóm tắt tình hình CRM", "Lead nào cần chăm sóc?"] },
  leads: { name: "Lead Center", greeting: "Tôi có thể đọc dữ liệu lead và giúp bạn tìm nhóm cần xử lý trước.", suggestions: ["Có bao nhiêu lead mới?", "Lead nào tiềm năng nhất?", "Đề xuất kế hoạch follow-up"] },
  finance: { name: "Tài chính", greeting: "Tôi có thể phân tích hóa đơn, hợp đồng, báo giá và thanh toán.", suggestions: ["Hóa đơn nào quá hạn?", "Tóm tắt dòng tiền", "Khoản nào cần thu trước?"] },
  projects: { name: "Dự án", greeting: "Tôi có thể tổng hợp dự án, tiến độ và công việc đang tồn đọng.", suggestions: ["Dự án nào có rủi ro?", "Việc nào đang chậm?", "Tóm tắt tiến độ"] },
  training: { name: "Đào tạo", greeting: "Tôi có thể phân tích khóa học, lớp, học viên và học phí.", suggestions: ["Tình hình học viên?", "Lớp nào đang hoạt động?", "Tóm tắt công nợ học phí"] },
  traveling: { name: "Traveling", greeting: "Tôi có thể tổng hợp khách sạn, tour, xe và dịch vụ du lịch.", suggestions: ["Tóm tắt dữ liệu du lịch", "Có bao nhiêu khách sạn?", "Dịch vụ nào cần chú ý?"] },
};

export function ContextualAIPanel() {
  const pathname = usePathname();
  return <ContextualAIPopup key={pathname} pathname={pathname} />;
}

function ContextualAIPopup({ pathname }: { pathname: string }) {
  const moduleKey = pathname.split("/").filter(Boolean)[1] || "workspace";
  const copy = moduleCopy[moduleKey] || {
    name: "màn hình này",
    greeting: "Tôi đã sẵn sàng hỗ trợ. Hãy hỏi về dữ liệu và nghiệp vụ của màn hình hiện tại.",
    suggestions: ["Tóm tắt dữ liệu", "Có gì cần chú ý?", "Đề xuất bước tiếp theo"],
  };
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<AIMode>("AUTO");
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(AI_SESSION_KEY) || "{}") as {
          prompt?: string;
          submittedPrompt?: string;
          answer?: string;
          mode?: AIMode;
        };
        setPrompt(stored.prompt || "");
        setSubmittedPrompt(stored.submittedPrompt || "");
        setAnswer(stored.answer || "");
        if (stored.mode && aiModes.some((item) => item.value === stored.mode)) setMode(stored.mode);
      } catch {
        localStorage.removeItem(AI_SESSION_KEY);
      } finally {
        setSessionLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;
    localStorage.setItem(AI_SESSION_KEY, JSON.stringify({ prompt, submittedPrompt, answer, mode }));
  }, [answer, mode, prompt, sessionLoaded, submittedPrompt]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const question = prompt.trim();
    if (!question || pending) return;
    setSubmittedPrompt(question);
    setPrompt("");
    setAnswer("");
    setError("");
    startTransition(async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 45_000);
      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: question, pathname, mode }),
          signal: controller.signal,
        });
        const result = await response.json() as { text?: string; error?: string };
        if (!response.ok || !result.text) throw new Error(result.error || "AI chưa thể xử lý yêu cầu.");
        setAnswer(result.text);
      } catch (caught) {
        setError(
          caught instanceof DOMException && caught.name === "AbortError"
            ? "AI phản hồi quá thời gian. Vui lòng thử lại."
            : caught instanceof Error ? caught.message : "AI chưa thể xử lý yêu cầu.",
        );
      } finally {
        window.clearTimeout(timeout);
      }
    });
  }

  if (pathname === "/workspace" || pathname.startsWith("/workspace/ai")) return null;
  if (hidden) return null;

  return (
    <>
      {/* Centered Popup */}
      {open && (
        <div className="fixed inset-0 z-[690] flex items-center justify-center p-4 pointer-events-none">
          <section className="pointer-events-auto flex h-[min(620px,calc(100vh-120px))] w-full max-w-[410px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950">
          <header className="flex items-center gap-3 border-b border-[#eaeaea] bg-[#fafafa] px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-black text-white">
              <Bot className="h-6 w-6" />
              <i className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-[15px] font-medium text-slate-950 dark:text-white">OVC AI</strong>
              <span className="block truncate text-[12px] text-slate-500">Hỏi dữ liệu toàn hệ thống</span>
            </div>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/70 hover:text-slate-700" aria-label="Mở rộng"><Maximize2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/70 hover:text-slate-700" aria-label="Đóng AI"><X className="h-4 w-4" /></button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-1 rounded-xl border border-[#eaeaea] bg-[#fafafa] p-1">
              {aiModes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMode(item.value)}
                    className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] transition-colors ${
                      mode === item.value ? "bg-black text-white" : "text-slate-500 hover:bg-white hover:text-black"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-start gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"><Bot className="h-4 w-4" /></span>
              <div className="rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-[13px] leading-5 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Xin chào! {copy.greeting}
              </div>
            </div>
            {submittedPrompt && (answer || pending || error) && (
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-slate-950 px-4 py-3 text-[13px] leading-5 text-white">{submittedPrompt}</div>
            )}
            {pending && <div className="flex items-center gap-2.5 text-[13px] text-slate-500"><Sparkles className="h-4 w-4 animate-pulse text-black" />Đang hiểu câu hỏi và truy vấn dữ liệu…</div>}
            {answer && <div className="flex items-start gap-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-black text-white"><Bot className="h-4 w-4" /></span><div className="whitespace-pre-wrap rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-[13px] leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-200">{answer}</div></div>}
            {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[13px] text-rose-700">{error}</div>}
            {!answer && !pending && !error && <div className="flex flex-wrap gap-2">{copy.suggestions.map((item) => <button key={item} type="button" onClick={() => setPrompt(item)} className="rounded-full border border-[#eaeaea] px-3 py-1.5 text-[12px] text-slate-500 transition hover:border-black hover:text-black dark:border-slate-800">{item}</button>)}</div>}
          </div>

          <form ref={formRef} onSubmit={submit} className="border-t border-slate-100 p-3 dark:border-slate-800">
            <div className="relative">
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); formRef.current?.requestSubmit(); } }} className="min-h-[52px] max-h-28 w-full resize-none rounded-xl border border-[#eaeaea] bg-[#fafafa] px-4 py-3 pr-12 text-[13px] leading-5 outline-none transition focus:border-black focus:bg-white dark:border-slate-800 dark:bg-slate-900" placeholder={mode === "DRAFT" ? "Mô tả nội dung cần tạo..." : mode === "PLAN" ? "Mô tả mục tiêu cần lập kế hoạch..." : "Hỏi OVC AI..."} />
              <button type="submit" disabled={pending || !prompt.trim()} className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white disabled:opacity-30" aria-label="Gửi câu hỏi">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
            </div>
          </form>
        </section>
        </div>
      )}

      <motion.div 
        drag 
        dragMomentum={false}
        dragElastic={0}
        className="fixed top-1/2 -translate-y-1/2 right-4 z-[680] sm:right-7 flex flex-col items-end pointer-events-auto"
      >
        <div className="relative group/ai mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHidden(true);
            }}
            title="Ẩn nút AI"
            className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 opacity-0 shadow-sm transition hover:bg-slate-300 group-hover/ai:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setOpen((value) => !value)} className="group relative ml-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-black bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#222]" aria-label="Mở OVC AI">
            {open ? <X className="h-6 w-6" /> : <Bot className="h-8 w-8" />}
            {!open && <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full border-2 border-white bg-emerald-500 px-1 text-[10px] font-semibold">AI</span>}
            {!open && <span className="pointer-events-none absolute right-[66px] hidden whitespace-nowrap rounded-lg border border-[#eaeaea] bg-white px-3 py-2 text-[12px] font-medium text-black opacity-0 shadow-lg transition group-hover:opacity-100 lg:block"><MessageCircle className="mr-1.5 inline h-3.5 w-3.5" />Hỏi OVC AI</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
}
