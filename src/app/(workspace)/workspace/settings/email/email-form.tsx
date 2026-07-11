"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Send } from "lucide-react";
import { updateSettings, sendTestEmail } from "@/actions/settings";
import { EmailSettingsNav } from "@/modules/core/components/email-settings-nav";

export function EmailSettingsForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const router = useRouter();
  const [smtpSettings, setSmtpSettings] = useState({
    smtp_host: initialSettings.smtp_host || "",
    smtp_port: initialSettings.smtp_port || "",
    smtp_username: initialSettings.smtp_user || "", // Note: the backend seems to use smtp_user, we should match it
    smtp_user: initialSettings.smtp_user || "",
    smtp_pass: initialSettings.smtp_pass || "",
    smtp_password: initialSettings.smtp_pass || "",
    smtp_from_email: initialSettings.smtp_from_email || "",
    smtp_from_name: initialSettings.smtp_from_name || "",
    mail_mailer: initialSettings.mail_mailer || "smtp",
    mail_scheme: initialSettings.mail_scheme || "smtps",
  });
  
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [testEmail, setTestEmail] = useState(initialSettings.smtp_from_email || "");
  const [isSendingTest, startTestEmailTransition] = useTransition();

  const handleSaveSmtp = async () => {
    setIsSavingSmtp(true);
    try {
      const payload = {
        smtp_host: smtpSettings.smtp_host,
        smtp_port: smtpSettings.smtp_port,
        smtp_user: smtpSettings.smtp_username || smtpSettings.smtp_user,
        smtp_pass: smtpSettings.smtp_password || smtpSettings.smtp_pass,
        smtp_from_email: smtpSettings.smtp_from_email,
        smtp_from_name: smtpSettings.smtp_from_name,
        mail_mailer: smtpSettings.mail_mailer,
        mail_scheme: smtpSettings.mail_scheme,
      };
      
      await updateSettings(payload);
      alert("Đã lưu cấu hình email.");
    } catch (error) {
      alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể lưu cấu hình"}`);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = () => {
    startTestEmailTransition(async () => {
      try {
        const payload = {
          smtp_host: smtpSettings.smtp_host,
          smtp_port: smtpSettings.smtp_port,
          smtp_user: smtpSettings.smtp_username || smtpSettings.smtp_user,
          smtp_pass: smtpSettings.smtp_password || smtpSettings.smtp_pass,
          smtp_from_email: smtpSettings.smtp_from_email,
          smtp_from_name: smtpSettings.smtp_from_name,
          mail_mailer: smtpSettings.mail_mailer,
          mail_scheme: smtpSettings.mail_scheme,
        };
        await updateSettings(payload);
        const result = await sendTestEmail(testEmail);
        alert(
          result.sent
            ? `Đã gửi email test tới ${testEmail}.`
            : `Đã tạo Email Log test cho ${testEmail}, nhưng chưa gửi thật vì SMTP/Resend chưa cấu hình.`
        );
        router.refresh();
      } catch (error) {
        alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể gửi email test"}`);
      }
    });
  };

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <EmailSettingsNav />

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-[20px] font-medium tracking-tight text-black">Email</h3>
                <p className="mt-2 text-[14px] text-gray-500">
                  Ưu tiên setup SMTP và danh tính người gửi cho các luồng báo giá, hợp đồng, hóa đơn, thanh toán.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="MAIL_MAILER">
                  <input value={smtpSettings.mail_mailer} onChange={(event) => setSmtpSettings({ ...smtpSettings, mail_mailer: event.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="smtp" />
                </Field>
                <Field label="MAIL_SCHEME">
                  <input value={smtpSettings.mail_scheme} onChange={(event) => setSmtpSettings({ ...smtpSettings, mail_scheme: event.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="smtps" />
                </Field>
                <Field label="SMTP Host">
                  <input value={smtpSettings.smtp_host} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_host: event.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="smtp.larksuite.com" />
                </Field>
                <Field label="SMTP Port">
                  <input value={smtpSettings.smtp_port} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_port: event.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="465 hoặc 587" />
                </Field>
                <Field label="SMTP Username">
                  <input value={smtpSettings.smtp_username} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_username: event.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="user@domain.com" />
                </Field>
                <Field label="SMTP Password / App Password">
                  <input type="password" value={smtpSettings.smtp_password} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_password: event.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="••••••••" />
                </Field>
                <Field label="From Name">
                  <input value={smtpSettings.smtp_from_name} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_from_name: event.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="Tên hiển thị" />
                </Field>
                <Field label="From Email">
                  <input value={smtpSettings.smtp_from_email} onChange={(event) => setSmtpSettings({ ...smtpSettings, smtp_from_email: event.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors" placeholder="email@domain.com" />
                </Field>
              </div>
            </div>

            <div className="bg-gray-50/50 border-t border-[#eaeaea] px-8 py-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <p className="text-[14px] text-gray-500">
                Lưu cấu hình hoặc gửi email test để kiểm tra kết nối.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 ml-auto xl:ml-0">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors sm:w-[260px]"
                  placeholder="Email nhận test"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest || !testEmail.trim()}
                  className="inline-flex h-10 min-w-[124px] items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium text-black hover:bg-gray-50 disabled:opacity-60 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span className="whitespace-nowrap">{isSendingTest ? "Đang gửi..." : "Gửi test"}</span>
                </button>
                <button
                  onClick={handleSaveSmtp}
                  disabled={isSavingSmtp}
                  className="inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span className="whitespace-nowrap">{isSavingSmtp ? "Đang lưu..." : "Lưu cấu hình"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
