"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Clock3, FileCheck2, FileText, Save } from "lucide-react";
import { gradeInstructorSubmission } from "../../actions";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

type GradingListProps = {
  submissions: any[];
};

export function GradingList({ submissions }: GradingListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "graded">("pending");

  const filteredSubmissions = submissions.filter((item) => {
    if (filter === "pending" && item.score !== null) return false;
    if (filter === "graded" && item.score === null) return false;
    return true;
  });

  const pendingCount = submissions.filter(s => s.score === null).length;

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button 
            onClick={() => setFilter("pending")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "pending" ? "bg-white text-orange-700 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"}`}
          >
            Chờ chấm {pendingCount > 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold">{pendingCount}</span>}
          </button>
          <button 
            onClick={() => setFilter("graded")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "graded" ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"}`}
          >
            Đã chấm
          </button>
          <button 
            onClick={() => setFilter("all")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "all" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"}`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="grid gap-6">
        {filteredSubmissions.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${item.score === null ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {item.score === null ? <Clock3 className="h-3 w-3" /> : <FileCheck2 className="h-3 w-3" />}
                    {item.score === null ? "Chờ chấm" : "Đã chấm"}
                  </span>
                  <span className="text-xs font-medium text-slate-500">Nộp lúc: {item.submittedAt ? dateFormat.format(new Date(item.submittedAt)) : "Chưa rõ thời gian nộp"}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm font-medium text-slate-600">Học viên: {item.student}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-2xl font-black ${item.score === null ? "text-slate-300" : "text-emerald-600"}`}>
                  {item.score === null ? "?" : item.score}<span className="text-sm font-medium text-slate-400">/{item.maxScore} đ</span>
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5">
              {item.content && (
                <div className="mb-4 text-sm text-slate-700 bg-white p-4 rounded-lg border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Nội dung bài làm</div>
                  {item.content}
                </div>
              )}
              {item.fileUrl && (
                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  <FileText className="h-4 w-4" /> Mở file đính kèm
                </a>
              )}
              
              <form action={gradeInstructorSubmission} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="submissionId" value={item.id} />
                <label className="sm:w-24 shrink-0">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Điểm</span>
                  <input name="score" type="number" min="0" max={item.maxScore} defaultValue={item.score ?? ""} required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder={`/${item.maxScore}`} />
                </label>
                <label className="flex-1">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Nhận xét (Feedback)</span>
                  <input name="feedback" defaultValue={item.feedback || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Viết nhận xét cho học viên..." />
                </label>
                <button type="submit" className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700">
                  <Save className="h-4 w-4" />
                  Lưu
                </button>
              </form>
            </div>
          </article>
        ))}
        
        {filteredSubmissions.length === 0 && (
          <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <ClipboardCheck className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-lg font-semibold text-slate-900">Không có bài tập nào</p>
            <p className="mt-1 text-sm text-slate-500">Mọi thứ đã được xử lý xong!</p>
          </div>
        )}
      </div>
    </div>
  );
}
