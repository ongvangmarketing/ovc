"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { ArrowUp, Bot, LoaderCircle, Settings2, Sparkles } from "lucide-react";
import { askAIAction } from "../actions/ai.actions";

const suggestions = [
  "Tóm tắt những việc tôi nên ưu tiên hôm nay",
  "Gợi ý cách chăm sóc lead mới",
  "Viết email nhắc thanh toán lịch sự",
];

export function DashboardAIAsk() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setError("");
    setAnswer("");
    startTransition(async () => {
      try {
        const result = await askAIAction(prompt);
        setAnswer(result.text);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "AI chưa thể xử lý yêu cầu.");
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#eaeaea] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between border-b border-[#eaeaea] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white"><Sparkles className="h-4 w-4" /></span>
          <div><h2 className="text-[16px] font-medium tracking-tight text-black">Hỏi OVC AI</h2><p className="text-[12px] text-gray-500">Trợ lý dùng chung cho Workspace</p></div>
        </div>
        <Link href="/workspace/ai" className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-black" title="Cấu hình AI"><Settings2 className="h-4 w-4" /></Link>
      </div>

      <div className="p-5 sm:p-6">
        {answer && <div className="mb-4 flex gap-3 rounded-2xl bg-gray-50 p-4 text-[14px] leading-6 text-gray-700"><Bot className="mt-0.5 h-5 w-5 shrink-0 text-black" /><p className="whitespace-pre-wrap">{answer}</p></div>}
        {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">{error} <Link href="/workspace/ai" className="font-medium underline">Cấu hình AI</Link></div>}

        <form onSubmit={submit} className="relative">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            className="min-h-[112px] w-full resize-none rounded-2xl border border-[#dedede] bg-[#fafafa] px-4 py-4 pr-14 text-[14px] leading-6 text-black outline-none transition focus:border-black focus:bg-white"
            placeholder="Hỏi về công việc, khách hàng, email, kế hoạch..."
            maxLength={8000}
          />
          <button disabled={pending || !prompt.trim()} className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-xl bg-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-35" type="submit" aria-label="Gửi câu hỏi">
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => setPrompt(suggestion)} className="rounded-full border border-[#eaeaea] bg-white px-3 py-1.5 text-[12px] text-gray-500 transition hover:border-gray-400 hover:text-black">{suggestion}</button>)}
        </div>
      </div>
    </section>
  );
}
