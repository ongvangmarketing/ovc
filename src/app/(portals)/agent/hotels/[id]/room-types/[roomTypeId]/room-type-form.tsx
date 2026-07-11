"use client";

import { useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { createRoomType, updateRoomType } from "../../actions";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { useRouter } from "next/navigation";

export default function RoomTypeForm({ hotelId, initialData }: { hotelId: string; initialData?: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!initialData;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("hotelId", hotelId);
    if (isEditing) {
      formData.append("id", initialData.id);
    }
    
    startTransition(async () => {
      const res = isEditing ? await updateRoomType(formData) : await createRoomType(formData);
      if (res.success) {
        alert("Đã lưu hạng phòng thành công!");
        router.push(`/agent/hotels/${hotelId}/room-types`);
      } else {
        alert(res.error || "Có lỗi xảy ra");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-[1000px]">
      
      {/* Thông tin cơ bản */}
      <div className="rounded-3xl border border-[#eaeaea] bg-white flex flex-col overflow-hidden">
        <div className="p-8 lg:p-10">
          <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">Thông tin cơ bản & Giá</h2>
          <p className="text-[14px] text-gray-500 mb-8">Tên hiển thị, mô tả và mức giá gốc của hạng phòng này.</p>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">
                Tên hạng phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialData?.name || ""}
                required
                placeholder="VD: Deluxe Double, Suite Ocean View..."
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors placeholder:text-gray-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Mô tả chi tiết</label>
              <textarea
                name="description"
                defaultValue={initialData?.description || ""}
                rows={4}
                className="w-full rounded-xl border border-[#eaeaea] p-4 text-[14px] text-black outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">
                Giá cơ bản (VND) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="basePrice"
                  required
                  min="0"
                  defaultValue={initialData?.basePrice || 500000}
                  className="w-full h-11 rounded-l-xl border border-r-0 border-[#eaeaea] px-4 text-[14px] font-medium text-black outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
                <span className="rounded-r-xl border border-[#eaeaea] bg-gray-50/50 px-5 text-[14px] font-medium text-gray-500 h-11 flex items-center">
                  VND / Đêm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết phòng */}
      <div className="rounded-3xl border border-[#eaeaea] bg-white flex flex-col overflow-hidden">
        <div className="p-8 lg:p-10">
          <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">Chi tiết phòng</h2>
          <p className="text-[14px] text-gray-500 mb-8">Cấu hình sức chứa, diện tích, view và các tiện nghi cơ bản.</p>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">
                Sức chứa (Tổng) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                required
                min="1"
                defaultValue={initialData?.capacity || 2}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Tối đa Người lớn</label>
              <input
                type="number"
                name="maxAdults"
                min="1"
                defaultValue={initialData?.maxAdults || 2}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Tối đa Trẻ em</label>
              <input
                type="number"
                name="maxChildren"
                min="0"
                defaultValue={initialData?.maxChildren || 0}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Diện tích phòng (m²)</label>
              <input
                type="number"
                name="roomSize"
                min="0"
                defaultValue={initialData?.roomSize || ""}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Loại giường</label>
              <input
                type="text"
                name="bedType"
                placeholder="VD: 1 Giường Đôi cỡ lớn"
                defaultValue={initialData?.bedType || ""}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Hướng nhìn (View)</label>
              <input
                type="text"
                name="view"
                placeholder="VD: Hướng biển"
                defaultValue={initialData?.view || ""}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors placeholder:text-gray-300"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="smoking"
                    value="true"
                    id="smoking"
                    defaultChecked={initialData?.smoking || false}
                    className="peer appearance-none w-5 h-5 border border-[#eaeaea] rounded-md bg-white checked:bg-black checked:border-black transition-all cursor-pointer"
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[14px] font-medium text-black group-hover:text-gray-600 transition-colors">
                  Cho phép hút thuốc trong phòng
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Hình ảnh Hạng phòng */}
      <div className="rounded-3xl border border-[#eaeaea] bg-white flex flex-col overflow-hidden">
        <div className="p-8 lg:p-10">
          <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">Hình ảnh Hạng phòng</h2>
          <p className="text-[14px] text-gray-500 mb-8">Ảnh góc rộng, phòng tắm, góc nhìn ban công, v.v.</p>
          
          <div className="md:col-span-1">
            <MultiImageUpload
              name="images"
              label="Tải ảnh lên"
              defaultValue={initialData?.images || []}
              helperText="Kéo thả hoặc click để tải lên thư viện ảnh."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-12 px-6 mr-3 text-[14px] font-medium text-black rounded-full hover:bg-gray-50 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-black px-8 text-[14px] font-medium text-white shadow-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Lưu hạng phòng
        </button>
      </div>
    </form>
  );
}
