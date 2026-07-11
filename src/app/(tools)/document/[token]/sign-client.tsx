"use client";

import { useRef, useState } from "react";
import {  signDocument  } from "@/modules/finance/actions/finance.actions";

function formatDateTime(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SignDocumentClient({
  token,
  docType,
  isSigned = false,
  signedAt,
}: {
  token: string;
  docType: "quotation" | "contract" | "invoice";
  isSigned?: boolean;
  signedAt?: string | Date | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerPhone, setSignerPhone] = useState("");
  const [hasDrawing, setHasDrawing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    if (!context) return;
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "#111827";
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    context.stroke();
    setHasDrawing(true);
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  }

  function stopDrawing() {
    drawingRef.current = false;
  }

  function clearDrawing() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }

  async function handleSign() {
    if (!signerName.trim()) return alert("Vui lòng nhập họ tên");
    if (!signerEmail.trim() || !signerEmail.includes("@")) return alert("Vui lòng nhập email xác nhận hợp lệ");
    if (!signerPhone.trim()) return alert("Vui lòng nhập số điện thoại");
    if (!hasDrawing) return alert("Vui lòng vẽ mẫu chữ ký");
    
    setIsSigning(true);
    try {
      let ip = "";
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        ip = data?.ip || "";
      } catch {
        ip = "";
      }
      const userAgent = window.navigator.userAgent;
      const signatureImage = canvasRef.current?.toDataURL("image/png") || "";
      
      await signDocument(token, docType, {
        signerName,
        signerEmail,
        signerPhone,
        signatureData: signatureImage,
      }, ip, userAgent);
      setSigned(true);
    } catch (err) {
      alert("Có lỗi xảy ra khi ký tài liệu");
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  }

  if (signed) {
    return (
      <div className="rounded-xl border border-[#eaeaea] bg-white p-6 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-black">Ký duyệt thành công</h3>
        <p className="mt-2 text-gray-500">
          Cảm ơn bạn đã xác nhận tài liệu. Vui lòng tải lại trang để xem chi tiết.
        </p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium text-black underline">Tải lại trang</button>
      </div>
    );
  }

  if (isSigned) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-black">Tài liệu đã được ký</h3>
        <p className="mt-2 text-sm text-gray-500">
          Chữ ký khách hàng được ghi nhận {formatDateTime(signedAt) || "trước đó"}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 text-center">
        <h3 className="text-[22px] font-medium tracking-tight text-black">Xác nhận & ký duyệt</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
          Bằng việc ký tên vào ô bên dưới, Quý khách xác nhận đồng ý với tất cả nội dung trong tài liệu này.
        </p>
      </div>
      
      <div className="grid gap-3 text-left md:grid-cols-3">
        <Field label="Họ tên">
          <input value={signerName} onChange={(event) => setSignerName(event.target.value)} placeholder="Nguyễn Văn A" className="h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 text-sm outline-none transition-colors focus:border-black" />
        </Field>
        <Field label="Email xác nhận">
          <input type="email" value={signerEmail} onChange={(event) => setSignerEmail(event.target.value)} placeholder="email@congty.com" className="h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 text-sm outline-none transition-colors focus:border-black" />
        </Field>
        <Field label="Số điện thoại">
          <input value={signerPhone} onChange={(event) => setSignerPhone(event.target.value)} placeholder="0900 000 000" className="h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 text-sm outline-none transition-colors focus:border-black" />
        </Field>
      </div>

      <div className="mt-3 text-left">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">Mẫu chữ ký</span>
          <button type="button" onClick={clearDrawing} className="text-xs font-medium text-gray-500 hover:text-black">Xóa nét vẽ</button>
        </div>
        <canvas
          ref={canvasRef}
          width={520}
          height={120}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="h-[120px] w-full touch-none rounded-md border border-dashed border-[#d4d4d4] bg-white"
        />
      </div>

      <button
        onClick={handleSign}
        disabled={isSigning || !signerName.trim() || !signerEmail.trim() || !signerPhone.trim() || !hasDrawing}
        className="mt-4 w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSigning ? "Đang xử lý..." : "Đồng ý và ký"}
      </button>
      
      <p className="mt-4 text-xs text-gray-400">
        Hệ thống sẽ lưu lại địa chỉ IP ({' '}đang lấy...{' '}) và thông tin thiết bị để phục vụ đối soát.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
