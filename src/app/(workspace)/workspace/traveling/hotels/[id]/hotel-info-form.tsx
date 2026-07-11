"use client";

import { useTransition } from "react";
import { Loader2, Save, ArrowRight } from "lucide-react";
import { updateHotelInfo } from "./actions";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";

export default function HotelInfoForm({ hotel }: { hotel: any }) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("hotelId", hotel.id);
    
    startTransition(async () => {
      const res = await updateHotelInfo(formData);
      if (res.success) {
        alert("Đã lưu thông tin khách sạn thành công!");
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
          <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">Thông tin cơ bản</h2>
          <p className="text-[14px] text-gray-500 mb-8">Các thông tin hiển thị chính của khách sạn trên hệ thống.</p>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">
                Tên Khách sạn / Resort
              </label>
              <input
                type="text"
                name="name"
                defaultValue={hotel.name}
                required
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">
                Đường dẫn (Slug)
              </label>
              <div className="flex items-center">
                <span className="rounded-l-xl border border-r-0 border-[#eaeaea] bg-gray-50/50 px-4 text-[14px] text-gray-400 h-11 flex items-center">
                  .../booking/
                </span>
                <input
                  type="text"
                  name="slug"
                  defaultValue={hotel.slug || ""}
                  placeholder="vd: muong-thanh-da-lat"
                  className="w-full h-11 rounded-r-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Mô tả</label>
              <textarea
                name="description"
                defaultValue={hotel.description || ""}
                rows={4}
                className="w-full rounded-xl border border-[#eaeaea] p-4 text-[14px] text-black outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Địa chỉ</label>
              <input
                type="text"
                name="address"
                defaultValue={hotel.address || ""}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Thành phố</label>
              <input
                type="text"
                name="city"
                defaultValue={hotel.city || ""}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Hạng sao (1-5)</label>
              <input
                type="number"
                name="starRating"
                min="1"
                max="5"
                defaultValue={hotel.starRating || 3}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hình ảnh */}
      <div className="rounded-3xl border border-[#eaeaea] bg-white flex flex-col overflow-hidden">
        <div className="p-8 lg:p-10">
          <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">Hình ảnh</h2>
          <p className="text-[14px] text-gray-500 mb-8">Ảnh đại diện và thư viện ảnh của khách sạn.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ImageUpload
                name="logo"
                label="Logo / Avatar"
                defaultValue={hotel.logo}
                helperText="Nên dùng ảnh vuông, kích thước tối đa 2MB."
                aspectRatio="square"
              />
            </div>
            <div className="lg:col-span-2">
              <MultiImageUpload
                name="images"
                label="Thư viện Ảnh (Gallery)"
                defaultValue={hotel.images || []}
                helperText="Upload ảnh góc rộng để khách hàng có cái nhìn tổng quan nhất về Khách sạn của bạn."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cấu hình & Liên hệ */}
      <div className="rounded-3xl border border-[#eaeaea] bg-white flex flex-col overflow-hidden mb-10">
        <div className="p-8 lg:p-10">
          <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">Hoạt động & Liên hệ</h2>
          <p className="text-[14px] text-gray-500 mb-8">Thông tin liên hệ và chính sách của khách sạn.</p>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Giờ nhận phòng</label>
              <input
                type="time"
                name="checkInTime"
                defaultValue={hotel.checkInTime || "14:00"}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Giờ trả phòng</label>
              <input
                type="time"
                name="checkOutTime"
                defaultValue={hotel.checkOutTime || "12:00"}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Email liên hệ</label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={hotel.contactEmail || ""}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">SĐT liên hệ</label>
              <input
                type="text"
                name="contactPhone"
                defaultValue={hotel.contactPhone || ""}
                className="w-full h-11 rounded-xl border border-[#eaeaea] px-4 text-[14px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-gray-500">Chính sách chung</label>
              <textarea
                name="policies"
                defaultValue={hotel.policies || ""}
                rows={4}
                className="w-full rounded-xl border border-[#eaeaea] p-4 text-[14px] text-black outline-none focus:border-black transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-black px-8 text-[14px] font-medium text-white shadow-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Lưu tất cả thay đổi
        </button>
      </div>
    </form>
  );
}
