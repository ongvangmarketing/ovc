"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import type { FinanceEmailSendPayload } from "@/app/actions/finance-crud";

export type FinanceEmailDraft = {
  to: string;
  subject: string;
  html: string;
  link?: string;
  attachPdf?: boolean;
};

type EmailComposerModalProps = {
  isOpen: boolean;
  title: string;
  draft?: FinanceEmailDraft | null;
  isLoading?: boolean;
  isPending?: boolean;
  onClose: () => void;
  onSend: (payload: FinanceEmailSendPayload) => void;
};

export function EmailComposerModal({
  isOpen,
  title,
  draft,
  isLoading,
  isPending,
  onClose,
  onSend,
}: EmailComposerModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [attachPdf, setAttachPdf] = useState(true);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const editorFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!isOpen || !draft) return;
    setTo(draft.to || "");
    setSubject(draft.subject || "");
    setHtml(draft.html || "");
    setAttachPdf(draft.attachPdf !== false);
    setIsEditingContent(false);
  }, [draft, isOpen]);

  const editorSrcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;color:#334155;background:#fff;} a{color:#f97316;} table{max-width:100%;} img{max-width:100%;height:auto;}</style></head><body>${html || "<p>Chưa có nội dung email.</p>"}</body></html>`;

  const readEditorHtml = () => {
    const body = editorFrameRef.current?.contentDocument?.body;
    return body?.innerHTML || html;
  };

  const enableFrameEditing = () => {
    const doc = editorFrameRef.current?.contentDocument;
    if (!doc) return;
    doc.designMode = "on";
    doc.body.contentEditable = "true";
  };

  const toggleEditContent = () => {
    if (isEditingContent) {
      setHtml(readEditorHtml());
    }
    setIsEditingContent((value) => !value);
  };

  const sendPayload = () => {
    onSend({
      to,
      subject,
      html: isEditingContent ? readEditorHtml() : html,
      attachPdf,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-[15px] font-medium text-slate-950">{title}</h2>
            <p className="text-sm text-slate-500">Email được render sẵn, có thể thêm người nhận và chỉnh nội dung nếu cần.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-6 py-5">
          {isLoading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-slate-500">Đang chuẩn bị nội dung email...</div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
              <div className="space-y-4">
                <label className="block space-y-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-sm font-medium text-slate-700">Email nhận</span>
                  <textarea
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    placeholder="email@congty.com, emailkhac@congty.com"
                  />
                  <span className="text-xs text-slate-400">Thêm email bằng dấu phẩy hoặc xuống dòng.</span>
                </label>

                <label className="block space-y-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-sm font-medium text-slate-700">Tiêu đề</span>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    placeholder="Tiêu đề email"
                  />
                </label>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 text-sm font-medium text-slate-700">File PDF render</div>
                  <button
                    type="button"
                    onClick={() => setAttachPdf((value) => !value)}
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      attachPdf
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {attachPdf ? "Đang bật đính kèm PDF" : "Đang tắt đính kèm PDF"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleEditContent}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
                >
                  {isEditingContent ? "Xong chỉnh sửa" : "Sửa trực tiếp trên email"}
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Preview email</div>
                    <div className="mt-1 text-sm font-medium text-slate-900">{subject || "Chưa có tiêu đề"}</div>
                  </div>
                </div>
                {isEditingContent ? (
                  <div className="max-h-[520px] overflow-y-auto bg-white p-4">
                    <iframe
                      ref={editorFrameRef}
                      title="Sửa nội dung email"
                      srcDoc={editorSrcDoc}
                      onLoad={enableFrameEditing}
                      className="mx-auto h-[460px] w-full max-w-[680px] rounded-2xl border border-orange-200 bg-white shadow-sm outline-none ring-4 ring-orange-50"
                    />
                    <p className="mt-3 text-center text-xs text-slate-400">Bấm trực tiếp vào chữ trong email để sửa.</p>
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto bg-white p-4">
                    <div className="mx-auto max-w-[680px] rounded-2xl border border-slate-100 bg-white shadow-sm">
                      <div className="email-preview-content p-4 text-sm leading-6 text-slate-700" dangerouslySetInnerHTML={{ __html: html || "<p>Chưa có nội dung email.</p>" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-600">
            Hủy
          </button>
          <button
            type="button"
            disabled={isLoading || isPending}
            onClick={sendPayload}
            className="rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Đang gửi..." : "Gửi email"}
          </button>
        </div>
      </div>
    </div>
  );
}
