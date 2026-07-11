"use client";

import { useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { updateAgentModules } from "./actions";

const MODULES = [
  { id: "TRAVELING_HOTEL", label: "Quản lý Khách sạn", description: "Bật chức năng quản lý khách sạn, phòng, giá phòng." },
  { id: "TRAVELING_TOUR", label: "Tour Du Lịch", description: "Bật chức năng tạo và bán các gói tour du lịch." },
  { id: "TRAVELING_CAR", label: "Cho Thuê Xe", description: "Quản lý danh sách xe cho thuê, giá theo ngày." },
  { id: "TRAVELING_EVENT", label: "Sự kiện", description: "Quản lý các sự kiện bán vé." },
  { id: "TRAVELING_TICKET", label: "Vé Dịch vụ", description: "Bán vé máy bay, vé tàu hỏa, vé xe khách." },
];

export default function SettingsClient({ initialModules }: { initialModules: string[] }) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await updateAgentModules(formData);
      if (res.success) {
        alert("Đã lưu cấu hình phân quyền thành công! Giao diện sẽ được cập nhật.");
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#fafafa]">
      <div className="sticky top-0 z-10 shrink-0 border-b border-[#eaeaea] bg-white px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[32px] font-medium tracking-tight text-black">Phân quyền Dịch vụ</h1>
            <p className="mt-2 text-[15px] text-gray-500">
              Chọn các mảng dịch vụ mà tổ chức của bạn đang kinh doanh.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-2xl border border-[#eaeaea] bg-white p-8">
          <div className="space-y-6">
            {MODULES.map(mod => (
              <div key={mod.id} className="flex items-start space-x-4">
                <input 
                  type="checkbox" 
                  id={mod.id}
                  name={mod.id}
                  defaultChecked={initialModules.includes(mod.id)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <div>
                  <label htmlFor={mod.id} className="text-[15px] font-medium text-black cursor-pointer">
                    {mod.label}
                  </label>
                  <p className="text-[14px] text-gray-500">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-[#eaeaea] pt-6 flex justify-end">
            <button 
              type="submit"
              disabled={isPending}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu Cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
