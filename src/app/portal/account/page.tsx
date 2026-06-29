import type { Metadata } from "next";
import { Bell, Camera, KeyRound, Mail, UserRound } from "lucide-react";
import { PortalMissingContact, PortalShell } from "../portal-shell";
import { getCustomerPortalData } from "../portal-data";
import { updatePortalAccount } from "./actions";

export const metadata: Metadata = {
  title: "Tài khoản | Portal Khách hàng",
};

const emailOptions = [
  { key: "account", label: "Thông báo tài khoản" },
  { key: "quotation", label: "Báo giá" },
  { key: "contract", label: "Hợp đồng" },
  { key: "invoice", label: "Hóa đơn" },
  { key: "payment", label: "Thanh toán" },
  { key: "marketing", label: "Email Marketing" },
];

function getPreferences(customFields: unknown) {
  if (!customFields || typeof customFields !== "object" || Array.isArray(customFields)) {
    return {};
  }

  const fields = customFields as { portalEmailPreferences?: Record<string, boolean> };
  return fields.portalEmailPreferences || {};
}

export default async function PortalAccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const data = await getCustomerPortalData();
  const params = await searchParams;

  if (!data.contact) {
    return <PortalMissingContact email={data.session.user.email} />;
  }

  const preferences = getPreferences(data.contact.customFields);
  const avatar = data.session.user.image || data.contact.avatar;
  const companyName = data.contact.company?.name || "";
  const fullName = data.customerName;

  return (
    <PortalShell active="account" customerName={data.customerName} email={data.contact.email}>
      <section className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon"><UserRound className="h-6 w-6" /></div>
          <div>
            <h1>Sửa tài khoản</h1>
            <p>Cập nhật hồ sơ khách hàng, ảnh đại diện và cấu hình nhận email.</p>
          </div>
        </div>
      </section>

      {params?.saved ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Đã cập nhật tài khoản Portal.
        </div>
      ) : null}

      <form action={updatePortalAccount} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-5">
          <section className="quote-detail-card">
            <h2>Thông tin tài khoản</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Họ tên">
                <input name="fullName" defaultValue={fullName} required className="quote-input" />
              </Field>
              <Field label="Email đăng nhập">
                <input name="email" type="email" defaultValue={data.contact.email || data.session.user.email} required className="quote-input" />
              </Field>
              <Field label="Điện thoại">
                <input name="phone" defaultValue={data.contact.phone || data.contact.mobile || data.session.user.phone || ""} className="quote-input" />
              </Field>
              <Field label="Tên công ty">
                <input name="companyName" defaultValue={companyName} className="quote-input" />
              </Field>
              <Field label="Tỉnh / Thành phố">
                <input name="city" defaultValue={data.contact.city || ""} className="quote-input" />
              </Field>
              <Field label="Địa chỉ">
                <input name="address" defaultValue={data.contact.address || ""} className="quote-input" />
              </Field>
            </div>
          </section>

          <section className="quote-detail-card">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-500" />
              <h2>Cấu hình nhận email</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Khi tắt một mục, hệ thống sẽ ngưng gửi toàn bộ email thuộc luồng tương ứng cho tài khoản này.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {emailOptions.map((option) => (
                <label key={option.key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-orange-200">
                  <span className="font-medium text-slate-700">{option.label}</span>
                  <input
                    name={`email_${option.key}`}
                    type="checkbox"
                    defaultChecked={preferences[option.key] ?? true}
                    className="h-4 w-4 rounded border-slate-300 text-orange-500"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="quote-detail-card">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-orange-500" />
              <h2>Đổi mật khẩu</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Sau khi đổi thành công, hệ thống sẽ gửi email xác nhận thay đổi mật khẩu.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Mật khẩu hiện tại">
                <input name="currentPassword" type="password" autoComplete="current-password" className="quote-input" />
              </Field>
              <Field label="Mật khẩu mới">
                <input name="newPassword" type="password" autoComplete="new-password" minLength={8} className="quote-input" />
              </Field>
              <Field label="Xác nhận mật khẩu mới">
                <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} className="quote-input" />
              </Field>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-5">
          <section className="quote-detail-card">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-orange-500" />
              <h2>Ảnh đại diện</h2>
            </div>
            <div className="mt-4 grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
              {avatar ? (
                <div
                  aria-label={fullName}
                  className="h-24 w-24 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatar})` }}
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-orange-50 text-2xl font-semibold text-orange-500">
                  {fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <label className="mt-4 w-full text-sm font-medium text-slate-600">
                Upload ảnh
                <input name="avatar" type="file" accept="image/*" className="quote-input mt-2" />
              </label>
              <label className="mt-3 w-full text-sm font-medium text-slate-600">
                Hoặc URL ảnh
                <input name="imageUrl" defaultValue={avatar || ""} className="quote-input mt-2" />
              </label>
              <p className="mt-3 text-xs text-slate-500">Hỗ trợ JPG, PNG, WEBP tối đa 2MB.</p>
            </div>
          </section>

          <section className="quote-detail-card">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" />
              <h2>Lưu thay đổi</h2>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Email hoặc mật khẩu thay đổi tại đây sẽ dùng cho lần đăng nhập kế tiếp.
            </p>
            <button type="submit" className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
              Lưu tài khoản
            </button>
          </section>
        </aside>
      </form>
    </PortalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-600">
      {label}
      {children}
    </label>
  );
}
