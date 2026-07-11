import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Download,
  FileSignature,
  FileText,
  Inbox,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import type { DigitalOfficeView } from "../types/digital-office.types";

const testPdfUrl = "/api/digital-office/signature-test/pdf";

const tabs: Array<{ label: string; href: string; view: DigitalOfficeView }> = [
  { label: "Tổng quan", href: "/workspace/office", view: "overview" },
  { label: "Văn bản", href: "/workspace/office/documents", view: "documents" },
  { label: "Phê duyệt", href: "/workspace/office/approvals", view: "approvals" },
  { label: "Yêu cầu", href: "/workspace/office/requests", view: "requests" },
  { label: "Ký số", href: "/workspace/office/signatures", view: "signatures" },
  { label: "Cấu hình", href: "/workspace/office/settings", view: "settings" },
];

function Shell({ activeView, children }: { activeView: DigitalOfficeView; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#eaeaea] px-3 py-1 text-[12px] font-medium text-gray-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                Development module
              </div>
              <h1 className="text-[32px] font-semibold tracking-tight text-black">Digital Office</h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-gray-500">
                Văn phòng số cho văn bản, phê duyệt, yêu cầu nội bộ và ký số. Bản này đã bỏ dữ liệu nháp, chỉ giữ luồng tạo PDF thử để chuẩn bị tích hợp MISA eSign.
              </p>
            </div>
            <a
              href={testPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-black px-4 text-[13px] font-medium text-white"
            >
              <Download className="h-4 w-4" />
              Tải PDF thử
            </a>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-[#eaeaea] pb-3">
            {tabs.map((tab) => (
              <Link
                key={tab.view}
                href={tab.href}
                className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  activeView === tab.view ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <section className="rounded-lg border border-dashed border-[#d9d9d9] bg-gray-50 p-10">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-gray-600">
          {icon}
        </div>
        <h2 className="text-[18px] font-semibold tracking-tight text-black">{title}</h2>
        <p className="mt-2 text-[13px] leading-6 text-gray-500">{description}</p>
      </div>
    </section>
  );
}

function SignatureTestPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <section className="rounded-lg border border-[#eaeaea] bg-white p-6">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-black text-white">
          <FileSignature className="h-5 w-5" />
        </div>
        <h2 className="text-[22px] font-semibold tracking-tight text-black">Văn bản PDF thử ký số</h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-6 text-gray-500">
          Hệ thống sẽ sinh một PDF mẫu từ server để dùng làm file đầu vào cho bước MISA eSign: lấy base64, tạo hash, gửi ký hash, nhận chữ ký và gắn chữ ký vào file.
        </p>

        <div className="mt-6 rounded-lg border border-[#eaeaea] bg-gray-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">Mã văn bản</div>
              <div className="mt-1 text-[18px] font-semibold text-black">OVC-DO-SIGN-TEST-001</div>
              <div className="mt-2 text-[13px] text-gray-500">Loại: Phiếu xác nhận thử nghiệm ký số</div>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[12px] font-medium text-amber-700">
              Ready for signing test
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={testPdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-[13px] font-medium text-white"
          >
            <Download className="h-4 w-4" />
            Mở PDF
          </a>
          <a
            href={testPdfUrl}
            download
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Tải xuống
          </a>
        </div>
      </section>

      <section className="rounded-lg border border-[#eaeaea] bg-white p-6">
        <h3 className="text-[15px] font-semibold text-black">Bước tiếp theo để ký thử</h3>
        <div className="mt-5 space-y-4">
          {[
            "Chuyển PDF sang base64 trên server.",
            "Lấy certificate và certificateChain từ MISA eSign.",
            "Gọi API tạo hash file.",
            "Gọi API ký hash và lưu transactionId.",
            "Poll trạng thái hoặc nhận webhook.",
            "Gắn signature vào PDF và lưu về Storage.",
          ].map((step, index) => (
            <div key={step} className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[12px] font-semibold text-gray-700">
                {index + 1}
              </div>
              <div className="text-[13px] leading-6 text-gray-600">{step}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-[12px] text-gray-500">
          <ArrowRight className="h-4 w-4" />
          Endpoint PDF hiện tại chỉ sinh file thử, chưa gọi MISA.
        </div>
      </section>
    </div>
  );
}

export function DigitalOfficeClient({ activeView }: { activeView: DigitalOfficeView }) {
  return (
    <Shell activeView={activeView}>
      {activeView === "overview" ? <SignatureTestPanel /> : null}
      {activeView === "documents" ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="Document Hub chưa có dữ liệu thật"
          description="Đã xoá dữ liệu nháp. Sau khi có database, tab này sẽ lấy văn bản thật theo organization."
        />
      ) : null}
      {activeView === "approvals" ? (
        <EmptyState
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="Approval Center chưa kích hoạt"
          description="Luồng phê duyệt thật sẽ được nối sau khi có bảng văn bản và request phê duyệt."
        />
      ) : null}
      {activeView === "requests" ? (
        <EmptyState
          icon={<Inbox className="h-5 w-5" />}
          title="Work Request chưa có dữ liệu"
          description="Không còn request mẫu. Bước tiếp theo là tạo schema và server action cho yêu cầu nội bộ."
        />
      ) : null}
      {activeView === "signatures" ? <SignatureTestPanel /> : null}
      {activeView === "settings" ? (
        <EmptyState
          icon={<Settings2 className="h-5 w-5" />}
          title="Cấu hình đang chờ credentials"
          description="Cần clientId, clientKey và tài khoản MISA eSign sandbox/production để hoàn thiện ký số."
        />
      ) : null}
    </Shell>
  );
}
