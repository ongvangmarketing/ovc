"use client";

import React, { useState, useEffect } from "react";
import { Send, Save, Plus, Trash2, ArrowLeft, Mail } from "lucide-react";
import { createMailAccountAction, updateMailAccountAction, getMailAccountsAction, sendTestMailboxAction } from "../actions/mail-account.actions";
import { CreateMailAccountDto } from "../types/core-mail.types";

import { toast } from "sonner";

export function MailAccountForm({ organizationId, members = [] }: { organizationId: string; members?: any[] }) {
  const [view, setView] = useState<"LIST" | "FORM">("LIST");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateMailAccountDto>({
    organizationId,
    emailAddress: "",
    displayName: "",
    imapHost: "",
    imapPort: 993,
    imapUsername: "",
    imapPassword: "",
    smtpHost: "",
    smtpPort: 465,
    smtpUsername: "",
    smtpPassword: "",
    isSystem: false,
  });

  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [permissions, setPermissions] = useState<{ memberId: string; role: string }[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, [organizationId]);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    const res = await getMailAccountsAction(organizationId);
    if (res.success && res.accounts) {
      setAccounts(res.accounts);
    }
    setLoadingAccounts(false);
  };

  const handleSave = async () => {
    setLoading(true);
    let res;
    if (editingId) {
      res = await updateMailAccountAction(editingId, formData, permissions);
    } else {
      res = await createMailAccountAction(formData, permissions);
    }

    if (res.success) {
      toast.success("Đã lưu cấu hình mailbox.");
      fetchAccounts();
      setView("LIST");
    } else {
      toast.error("Lỗi: " + res.error);
    }
    setLoading(false);
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) return;
    setIsTesting(true);
    toast.info("Đang kiểm tra kết nối SMTP...");
    
    const res = await sendTestMailboxAction(formData, testEmail);
    if (res.success) {
      toast.success("Kết nối thành công! Đã gửi email test.");
    } else {
      toast.error("Kết nối thất bại: " + res.error);
    }
    setIsTesting(false);
  };

  const handleEdit = (acc: any) => {
    setEditingId(acc.id);
    setFormData({
      organizationId: acc.organizationId,
      emailAddress: acc.emailAddress || "",
      displayName: acc.displayName || "",
      imapHost: acc.imapHost || "",
      imapPort: acc.imapPort || 993,
      imapUsername: acc.imapUsername || "",
      imapPassword: acc.imapPassword || "",
      smtpHost: acc.smtpHost || "",
      smtpPort: acc.smtpPort || 465,
      smtpUsername: acc.smtpUsername || "",
      smtpPassword: acc.smtpPassword || "",
      isSystem: acc.isSystem || false,
    });
    // setPermissions based on acc.members
    const perms = (acc.members || []).map((m: any) => ({
      memberId: m.userId,
      role: m.permissions?.[0] || "READ"
    }));
    setPermissions(perms);
    setView("FORM");
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      organizationId,
      emailAddress: "",
      displayName: "",
      imapHost: "",
      imapPort: 993,
      imapUsername: "",
      imapPassword: "",
      smtpHost: "",
      smtpPort: 465,
      smtpUsername: "",
      smtpPassword: "",
      isSystem: false,
    });
    setPermissions([]);
    setView("FORM");
  };

  const handleAddPermission = () => {
    setPermissions([...permissions, { memberId: "", role: "READ" }]);
  };

  if (view === "LIST") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-medium tracking-tight text-black">Quản lý Mailbox</h2>
            <p className="mt-1 text-[14px] text-gray-500">Tất cả các tài khoản email được kết nối với hệ thống.</p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm Mailbox mới
          </button>
        </div>

        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
          {loadingAccounts ? (
            <div className="p-8 text-center text-gray-500 text-[14px]">Đang tải...</div>
          ) : accounts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
                <Mail className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-[16px] font-medium text-black">Chưa có Mailbox nào</h3>
              <p className="mt-2 text-[14px] text-gray-500 mb-6">Bạn chưa kết nối tài khoản email nào để sử dụng.</p>
              <button 
                onClick={handleCreateNew}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
              >
                Kết nối ngay
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#eaeaea]">
              {accounts.map(acc => (
                <div 
                  key={acc.id} 
                  onClick={() => handleEdit(acc)}
                  className="grid gap-3 p-6 md:grid-cols-[1fr_200px_auto] md:items-center hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div>
                    <h4 className="text-[15px] font-medium text-black">{acc.displayName || acc.emailAddress}</h4>
                    <p className="text-[13px] text-gray-500 mt-1">{acc.emailAddress}</p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Active
                    </span>
                    {acc.isSystem && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        System Mail
                      </span>
                    )}
                  </div>
                  <div className="text-right text-[13px] text-gray-500">
                    {acc.members?.length || 0} thành viên
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => setView("LIST")}
        className="inline-flex items-center gap-2 text-[14px] text-gray-500 hover:text-black transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </button>

      <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-[20px] font-medium tracking-tight text-black">{editingId ? "Cập nhật Mailbox" : "Cấu hình Mailbox mới"}</h3>
            <p className="mt-2 text-[14px] text-gray-500">
              Nhập thông tin kết nối IMAP/SMTP của hộp thư để tích hợp vào hệ thống.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="SMTP Host">
              <input value={formData.smtpHost} onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="smtp.larksuite.com" />
            </Field>
            <Field label="SMTP Port">
              <input value={formData.smtpPort || ""} onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) || 465 })} type="number" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="465" />
            </Field>
            <Field label="SMTP Username">
              <input value={formData.smtpUsername} onChange={(e) => setFormData({ ...formData, smtpUsername: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="OVC" />
            </Field>
            <Field label="SMTP Password / App Password">
              <input type="password" value={formData.smtpPassword} onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="••••••••••••••••" />
            </Field>
            
            {/* IMAP fields */}
            <Field label="IMAP Host">
              <input value={formData.imapHost} onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="imap.larksuite.com" />
            </Field>
            <Field label="IMAP Port">
              <input value={formData.imapPort || ""} onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value) || 993 })} type="number" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="993" />
            </Field>
            <Field label="IMAP Username">
              <input value={formData.imapUsername} onChange={(e) => setFormData({ ...formData, imapUsername: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="OVC" />
            </Field>
            <Field label="IMAP Password / App Password">
              <input type="password" value={formData.imapPassword} onChange={(e) => setFormData({ ...formData, imapPassword: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="••••••••••••••••" />
            </Field>
            
            <Field label="From Name">
              <input value={formData.displayName || ""} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="Tên hiển thị" />
            </Field>
            <Field label="Email Address">
              <input value={formData.emailAddress} onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })} type="email" className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="email@domain.com" />
            </Field>
            
            <div className="md:col-span-2 pt-4 border-t border-[#eaeaea]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-700">Đặt làm Email Hệ Thống</h4>
                  <p className="mt-1 text-[13px] text-gray-500">Sử dụng hộp thư này để gửi các email thông báo, báo giá, hóa đơn tự động từ hệ thống.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.isSystem || false} onChange={(e) => setFormData({ ...formData, isSystem: e.target.checked })} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
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
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors sm:w-[260px]"
              placeholder="crm@ovc.vn"
            />
            <button
              onClick={handleSendTest}
              disabled={!testEmail.trim() || isTesting}
              className="inline-flex h-10 min-w-[124px] items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium text-black hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              <Send className="h-4 w-4" />
              <span className="whitespace-nowrap">{isTesting ? "Đang gửi..." : "Gửi test"}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex h-10 min-w-[132px] items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span className="whitespace-nowrap">{loading ? "Đang lưu..." : "Lưu Mailbox"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[20px] font-medium tracking-tight text-black">Phân quyền truy cập</h3>
              <p className="mt-2 text-[14px] text-gray-500">
                Cho phép cá nhân hoặc phòng ban nào được sử dụng tài khoản email này.
              </p>
            </div>
            <button
              onClick={handleAddPermission}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm phân quyền
            </button>
          </div>

          <div className="space-y-4">
            {permissions.length === 0 ? (
              <div className="text-center py-6 text-[13px] text-gray-500 border border-dashed border-[#eaeaea] rounded-lg">
                Chưa có ai được cấp quyền truy cập tài khoản này
              </div>
            ) : (
              permissions.map((perm, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <select
                    className="flex-1 rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors"
                    value={perm.memberId}
                    onChange={(e) => {
                      const newPerms = [...permissions];
                      newPerms[idx].memberId = e.target.value;
                      setPermissions(newPerms);
                    }}
                  >
                    <option value="">-- Chọn thành viên --</option>
                    {members.map(m => (
                      <option key={m.user?.id} value={m.user?.id}>{m.user?.name || m.user?.email}</option>
                    ))}
                  </select>
                  <select
                    className="w-[180px] rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none transition-colors"
                    value={perm.role}
                    onChange={(e) => {
                      const newPerms = [...permissions];
                      newPerms[idx].role = e.target.value;
                      setPermissions(newPerms);
                    }}
                  >
                    <option value="VIEW">Chỉ xem (View)</option>
                    <option value="READ">Đọc email (Read)</option>
                    <option value="SEND">Gửi & Đọc (Send)</option>
                    <option value="MANAGE">Quản lý (Manage)</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleSave}
                      className="p-2 text-gray-400 hover:text-black transition-colors"
                      title="Lưu dòng này"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setPermissions(permissions.filter((_, i) => i !== idx))}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Xóa phân quyền"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
