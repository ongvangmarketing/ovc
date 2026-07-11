"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction, updatePasswordAction } from "@/modules/core/actions/user.actions";
import { toast } from "sonner";
import { User, ArrowLeft, ShieldCheck, Activity, Settings, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  bio: string | null;
  timezone: string;
  locale: string;
};

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all text-left whitespace-nowrap",
        active ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <span className={cn(active ? "text-white" : "text-gray-400")}>{icon}</span>
      {label}
    </button>
  );
}

function TabLink({ active, href, icon, label }: { active: boolean; href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all text-left whitespace-nowrap",
        active ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <span className={cn(active ? "text-white" : "text-gray-400")}>{icon}</span>
      {label}
    </Link>
  );
}

export function AccountSettingsClient({ initialData }: { initialData: UserProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialData);
  const [pending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState("profile");

  const openTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      timezone: formData.get("timezone") as string,
      locale: formData.get("locale") as string,
      image: avatarUrlInput || avatarPreview || profile.image,
    };

    startTransition(async () => {
      try {
        await updateProfileAction(data);
        setProfile((prev) => ({ ...prev, ...data }));
        toast.success("Đã cập nhật hồ sơ");
      } catch (error) {
        toast.error("Có lỗi xảy ra khi cập nhật hồ sơ");
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        const result = await updatePasswordAction(currentPassword, newPassword);
        if (result.success) {
          toast.success("Đã thay đổi mật khẩu");
          form.reset();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    });
  };

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => router.back()} 
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors border border-[#eaeaea]"
              title="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
              Tài khoản
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Hồ sơ cá nhân,</span>{" "}
            <span className="text-gray-400">bảo mật & hiển thị.</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-8">
          <aside className="w-full sm:w-64 shrink-0">
            <nav className="flex sm:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
              <TabButton active={activeTab === "profile"} onClick={() => openTab("profile")} icon={<UserIcon className="h-5 w-5" />} label="Hồ sơ cá nhân" />
              <TabButton active={activeTab === "security"} onClick={() => openTab("security")} icon={<ShieldCheck className="h-5 w-5" />} label="Bảo mật" />
              {/* Level 2 Menu link to Workspace Settings */}
              <div className="h-px bg-gray-200 my-2" />
              <TabLink active={false} href="/workspace/settings" icon={<Settings className="h-5 w-5" />} label="Cài đặt workspace" />
            </nav>
          </aside>

          <div className="flex-1 w-full min-w-0">
            <section className="min-h-[620px]">
              {activeTab === "profile" ? (
                <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden shadow-sm">
                  <div className="p-6 sm:p-8">
                    <h2 className="text-[20px] font-medium tracking-tight text-slate-900">Hồ sơ cá nhân</h2>
                    <p className="mt-1 text-[14px] text-slate-500">Thông tin cơ bản về bạn trên hệ thống OVC.</p>
                    
                    <form onSubmit={handleProfileSubmit} className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-slate-50 text-slate-400 overflow-hidden">
                {avatarPreview || profile.image ? (
                  <img src={avatarPreview || profile.image || ""} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <div className="flex-1 w-full space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="cursor-pointer text-center rounded-lg border border-[#eaeaea] bg-white px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    Tải ảnh lên
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const img = new Image();
                            img.src = reader.result as string;
                            img.onload = () => {
                              const canvas = document.createElement("canvas");
                              const MAX_WIDTH = 256;
                              const MAX_HEIGHT = 256;
                              let width = img.width;
                              let height = img.height;

                              if (width > height) {
                                if (width > MAX_WIDTH) {
                                  height *= MAX_WIDTH / width;
                                  width = MAX_WIDTH;
                                }
                              } else {
                                if (height > MAX_HEIGHT) {
                                  width *= MAX_HEIGHT / height;
                                  height = MAX_HEIGHT;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext("2d");
                              ctx?.drawImage(img, 0, 0, width, height);
                              // Compress to standard JPEG format, 80% quality
                              setAvatarPreview(canvas.toDataURL("image/jpeg", 0.8));
                            };
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="hidden sm:inline text-[14px] text-slate-500">hoặc</span>
                  <input
                    type="url"
                    placeholder="Nhập URL ảnh đại diện"
                    value={avatarUrlInput}
                    onChange={(e) => { setAvatarUrlInput(e.target.value); setAvatarPreview(e.target.value); }}
                    className="flex-1 rounded-lg border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0"
                  />
                </div>
                <p className="mt-2 text-center sm:text-left text-[13px] text-slate-500">JPG, GIF hoặc PNG. Hoặc nhập URL trực tiếp.</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-[14px] font-medium text-slate-700">Họ và tên</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={profile.name}
                  required
                  className="mt-2 w-full rounded-lg border border-[#eaeaea] px-4 py-2.5 text-[14px] text-slate-900 focus:border-black focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-slate-700">Email <span className="text-slate-400 font-normal">(Chỉ đọc)</span></label>
                <input
                  name="email"
                  type="email"
                  defaultValue={profile.email}
                  disabled
                  className="mt-2 w-full rounded-lg border border-[#eaeaea] bg-slate-50 px-4 py-2.5 text-[14px] text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-slate-700">Số điện thoại</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone || ""}
                  className="mt-2 w-full rounded-lg border border-[#eaeaea] px-4 py-2.5 text-[14px] text-slate-900 focus:border-black focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-slate-700">Ngôn ngữ</label>
                <select
                  name="locale"
                  defaultValue={profile.locale}
                  className="mt-2 w-full rounded-lg border border-[#eaeaea] px-4 py-2.5 text-[14px] text-slate-900 focus:border-black focus:outline-none focus:ring-0 transition-colors bg-white"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end border-t border-[#eaeaea] pt-6 mt-8">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-6 text-[14px] font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null}

              {activeTab === "security" ? (
                <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden shadow-sm">
                  <div className="p-6 sm:p-8">
                    <h2 className="text-[20px] font-medium tracking-tight text-slate-900">Bảo mật</h2>
                    <p className="mt-1 text-[14px] text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
                    
                    <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
                      <div className="max-w-md space-y-6">
                        <div>
                          <label className="block text-[14px] font-medium text-slate-700">Mật khẩu hiện tại</label>
                          <input
                            name="currentPassword"
                            type="password"
                            required
                            className="mt-2 w-full rounded-lg border border-[#eaeaea] px-4 py-2.5 text-[14px] text-slate-900 focus:border-black focus:outline-none focus:ring-0 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[14px] font-medium text-slate-700">Mật khẩu mới</label>
                          <input
                            name="newPassword"
                            type="password"
                            required
                            minLength={6}
                            className="mt-2 w-full rounded-lg border border-[#eaeaea] px-4 py-2.5 text-[14px] text-slate-900 focus:border-black focus:outline-none focus:ring-0 transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end border-t border-[#eaeaea] pt-6 mt-8">
                        <button
                          type="submit"
                          disabled={pending}
                          className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-6 text-[14px] font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          Cập nhật mật khẩu
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
