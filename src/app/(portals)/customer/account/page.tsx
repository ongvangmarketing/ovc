import type { Metadata } from "next";
import { PortalMissingContact } from "../portal-shell";
import { getCustomerPortalData } from "../portal-data";
import { updatePortalAccount } from "./actions";

export const metadata: Metadata = {
  title: "Tài khoản | Customer Portal",
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

// Reusable Vercel-style Setting Card
function SettingCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden flex flex-col">
      <div className="p-6 md:p-8 flex-1">
        <h2 className="text-[20px] font-medium text-black tracking-tight">{title}</h2>
        <p className="mt-2 text-[14px] text-gray-500 leading-relaxed mb-6">{description}</p>
        <div className="w-full">
          {children}
        </div>
      </div>
      {footer && (
        <div className="bg-gray-50/50 border-t border-[#eaeaea] px-6 py-4 flex items-center justify-between gap-4 mt-auto">
          {footer}
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-[14px] font-medium text-black">
      {label}
      {children}
    </label>
  );
}

const inputClassName = "h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors";

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
    <div className="min-h-screen pb-24 text-black font-sans bg-[#fafafa]">
      
      {/* Vercel Header Section */}
      <div className="pt-16 pb-12 px-6 md:px-12 max-w-[1024px] mx-auto">
        <h1 className="text-[40px] md:text-[48px] font-medium tracking-tighter leading-[1.05] text-black">
          Cài đặt tài khoản
        </h1>
        <p className="text-[16px] text-gray-500 max-w-2xl mt-4 tracking-tight leading-snug">
          Quản lý thông tin hồ sơ khách hàng, bảo mật và cấu hình thông báo.
        </p>
      </div>

      <div className="px-6 md:px-12 max-w-[1024px] mx-auto">
        {params?.saved ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-700 mb-8">
            Cập nhật tài khoản thành công.
          </div>
        ) : null}

        <form action={updatePortalAccount} className="grid gap-8">
          
          <SettingCard
            title="Hồ sơ cá nhân"
            description="Thông tin cá nhân liên hệ chính của bạn trên hệ thống."
            footer={
              <>
                <p className="text-[13px] text-gray-500 hidden sm:block">Vui lòng dùng thông tin thật.</p>
                <button type="submit" className="rounded-md bg-black px-4 py-2 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors shrink-0 ml-auto">
                  Lưu thay đổi
                </button>
              </>
            }
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Họ tên">
                <input name="fullName" defaultValue={fullName} required className={inputClassName} />
              </Field>
              <Field label="Email đăng nhập">
                <input name="email" type="email" defaultValue={data.contact.email || data.session.user.email} required className={inputClassName} />
              </Field>
              <Field label="Điện thoại">
                <input name="phone" defaultValue={data.contact.phone || data.contact.mobile || data.session.user.phone || ""} className={inputClassName} />
              </Field>
              <Field label="Tên công ty">
                <input name="companyName" defaultValue={companyName} className={inputClassName} />
              </Field>
              <Field label="Tỉnh / Thành phố">
                <input name="city" defaultValue={data.contact.city || ""} className={inputClassName} />
              </Field>
              <Field label="Địa chỉ">
                <input name="address" defaultValue={data.contact.address || ""} className={inputClassName} />
              </Field>
            </div>
          </SettingCard>

          <SettingCard
            title="Ảnh đại diện"
            description="Ảnh đại diện này sẽ hiển thị trên tất cả các tài liệu và trao đổi của bạn."
            footer={
              <>
                <p className="text-[13px] text-gray-500 hidden sm:block">Hỗ trợ JPG, PNG, WEBP tối đa 2MB.</p>
                <button type="submit" className="rounded-md bg-black px-4 py-2 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors shrink-0 ml-auto">
                  Lưu thay đổi
                </button>
              </>
            }
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="shrink-0">
                {avatar ? (
                  <div
                    aria-label={fullName}
                    className="h-[88px] w-[88px] rounded-full bg-cover bg-center border border-[#eaeaea]"
                    style={{ backgroundImage: `url(${avatar})` }}
                  />
                ) : (
                  <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-gray-100 text-[24px] font-semibold text-gray-400 border border-[#eaeaea]">
                    {fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-4">
                <Field label="Tải ảnh lên">
                  <input name="avatar" type="file" accept="image/*" className="w-full text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[13px] file:font-medium file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                </Field>
                <Field label="Hoặc nhập URL ảnh">
                  <input name="imageUrl" defaultValue={avatar || ""} className={inputClassName} placeholder="https://example.com/avatar.jpg" />
                </Field>
              </div>
            </div>
          </SettingCard>

          <SettingCard
            title="Cấu hình nhận Email"
            description="Quản lý những email bạn muốn nhận. Khi tắt, hệ thống sẽ ngưng gửi email thuộc loại tương ứng."
            footer={
              <>
                <p className="text-[13px] text-gray-500 hidden sm:block">Bạn có thể thay đổi bất kỳ lúc nào.</p>
                <button type="submit" className="rounded-md bg-black px-4 py-2 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors shrink-0 ml-auto">
                  Lưu cấu hình
                </button>
              </>
            }
          >
            <div className="grid gap-3">
              {emailOptions.map((option) => (
                <label key={option.key} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#eaeaea] hover:border-gray-300 transition-colors cursor-pointer group bg-white">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-black">{option.label}</span>
                    <span className="text-[13px] text-gray-500">Nhận thông báo qua email về {option.label.toLowerCase()}.</span>
                  </div>
                  <div className="relative shrink-0 flex items-center">
                    <input
                      name={`email_${option.key}`}
                      type="checkbox"
                      defaultChecked={preferences[option.key] ?? true}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </div>
                </label>
              ))}
            </div>
          </SettingCard>

          <SettingCard
            title="Đổi mật khẩu"
            description="Sau khi đổi thành công, hệ thống sẽ gửi email xác nhận. Nên sử dụng mật khẩu mạnh."
            footer={
              <>
                <p className="text-[13px] text-gray-500 hidden sm:block">Mật khẩu tối thiểu 8 ký tự.</p>
                <button type="submit" className="rounded-md bg-black px-4 py-2 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors shrink-0 ml-auto">
                  Đổi mật khẩu
                </button>
              </>
            }
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Mật khẩu hiện tại">
                <input name="currentPassword" type="password" autoComplete="current-password" className={inputClassName} />
              </Field>
              <Field label="Mật khẩu mới">
                <input name="newPassword" type="password" autoComplete="new-password" minLength={8} className={inputClassName} />
              </Field>
              <Field label="Xác nhận mật khẩu mới">
                <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} className={inputClassName} />
              </Field>
            </div>
          </SettingCard>

        </form>
      </div>
    </div>
  );
}
