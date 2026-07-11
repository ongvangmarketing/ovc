"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Search, Map, Trash2, X, Loader2, ArrowRight, MapPin, DollarSign, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { createTourAction, deleteTourAction } from "@/modules/traveling/actions/traveling.actions";
import { Tour } from "@prisma/client";

type TourWithAgent = Tour & {
  agent: { id: string; name: string | null; email: string | null } | null;
};

export default function ToursClient({ initialTours }: { initialTours: TourWithAgent[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredTours = useMemo(() => {
    return initialTours.filter(tour => {
      return tour.name.toLowerCase().includes(query.toLowerCase()) || 
             ((tour as any).destinations?.join(" ") || "").toLowerCase().includes(query.toLowerCase()) ||
             (tour.agent?.name && tour.agent.name.toLowerCase().includes(query.toLowerCase()));
    });
  }, [initialTours, query]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa Tour này?")) return;
    const res = await deleteTourAction(id);
    if (!res.success) {
      alert(res.error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createTourAction(formData);
      if (res.success) {
        setIsModalOpen(false);
      } else {
        alert(res.error);
      }
    });
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-white">
      {/* ── Main Workspace ── */}
      <div className="flex-1 overflow-auto p-8 lg:p-12">
        <div className="mx-auto max-w-[1200px]">
          
          {/* Header section perfectly matching the Vercel mockup */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-black text-white px-3 py-1.5 rounded-full text-[13px] font-medium tracking-wide">
                  Hệ thống Tour
                </span>
                <span className="text-[13px] text-gray-500">{currentDate}</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex h-9 items-center justify-center gap-2 rounded-full bg-black px-5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tạo mới
              </button>
            </div>
            
            <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight text-black leading-tight max-w-3xl">
              Quản lý danh sách, <span className="text-gray-400 font-normal">điều phối toàn bộ lịch trình tour.</span>
            </h1>

            <p className="text-[15px] text-gray-500 max-w-2xl leading-relaxed">
              Trung tâm quản lý tour giúp bạn dễ dàng theo dõi, cập nhật lịch trình, giá cả và tình trạng hoạt động của các gói du lịch trong hệ thống.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-[#eaeaea]">
            <div className="relative w-full sm:w-[360px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm tên Tour, điểm đến, đối tác..."
                className="flex h-10 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Create New Card */}
            <div 
              onClick={() => setIsModalOpen(true)}
              className="rounded-3xl border border-[#eaeaea] bg-white p-6 hover:border-gray-300 transition-colors cursor-pointer flex flex-col group h-[300px]"
            >
              <div className="w-12 h-12 rounded-full border border-[#eaeaea] bg-gray-50 flex items-center justify-center mb-5 group-hover:bg-black group-hover:border-black transition-colors shrink-0">
                <Plus className="w-5 h-5 text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-[18px] font-medium text-black mb-2 tracking-tight">Thêm Tour mới</h3>
              <p className="text-[14px] text-gray-500 mb-6 flex-1 leading-relaxed">
                Tạo một gói tour du lịch mới, thiết lập lịch trình cơ bản và bắt đầu nhận booking ngay lập tức.
              </p>
              <div className="border-t border-[#eaeaea] pt-4 mt-auto shrink-0">
                <span className="text-[13px] text-gray-400 flex items-center gap-1 group-hover:text-black transition-colors">
                  Bắt đầu tạo <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Tour Cards */}
            {filteredTours.map((tour) => {
              const thumbnail = tour.images && tour.images.length > 0 ? tour.images[0] : null;
              return (
                <div 
                  key={tour.id}
                  onClick={() => router.push(`/workspace/traveling/tours/${tour.id}`)}
                  className="rounded-3xl border border-[#eaeaea] bg-white p-6 hover:border-gray-300 transition-colors cursor-pointer flex flex-col group h-[300px] relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4 relative z-10 shrink-0">
                    <div className="w-12 h-12 rounded-full border border-[#eaeaea] bg-white flex items-center justify-center overflow-hidden shadow-sm">
                      {thumbnail ? (
                        <img src={thumbnail} alt={tour.name} className="w-full h-full object-cover" />
                      ) : (
                        <Map className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-full border border-[#eaeaea] px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-gray-500 bg-white/80 backdrop-blur-sm">
                        {tour.durationDays} NGÀY
                      </span>
                      <button 
                        onClick={(e) => handleDelete(e, tour.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-transparent hover:border-[#eaeaea] text-gray-400 hover:text-black hover:bg-white/80 backdrop-blur-sm transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-[18px] font-medium text-black mb-2 tracking-tight line-clamp-1 group-hover:underline underline-offset-4 decoration-gray-300 relative z-10 shrink-0">
                    {tour.name}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mb-4 flex-1 relative z-10">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-[14px] text-gray-500 leading-relaxed line-clamp-1">
                        {(tour as any).destinations?.join(", ") || "Chưa cập nhật điểm đến"}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-[14px] font-medium text-black line-clamp-1">
                        {formatCurrency(tour.basePrice)}
                      </p>
                    </div>
                    
                    {tour.agent && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <p className="text-[14px] text-orange-600/90 font-medium leading-relaxed line-clamp-1">
                          Đối tác: {tour.agent.name || tour.agent.email}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-[#eaeaea] pt-4 mt-auto flex items-center justify-between relative z-10 shrink-0">
                    <span className="text-[13px] text-gray-400 flex items-center gap-1 group-hover:text-black transition-colors">
                      Quản lý ngay <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        tour.isActive ? "bg-emerald-500" : "bg-gray-300"
                      )} />
                      <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500">
                        {tour.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom active list */}
          <div className="rounded-3xl border border-[#eaeaea] bg-white p-8 mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[16px] font-medium text-black tracking-tight">Tour đang hoạt động</h3>
                <p className="text-[13px] text-gray-500 mt-1">Các gói tour đang mở bán và hiển thị trên hệ thống.</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#eaeaea] flex items-center justify-center bg-gray-50">
                <div className="w-3 h-3 rounded-full border-2 border-black" />
              </div>
            </div>

            {filteredTours.filter(t => t.isActive).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full border border-[#eaeaea] flex items-center justify-center bg-gray-50 mb-4">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                </div>
                <p className="text-[14px] font-medium text-black">Chưa có tour nào</p>
                <p className="text-[13px] text-gray-500 mt-1">Vui lòng thêm hoặc kích hoạt một gói tour ở phía trên.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredTours.filter(t => t.isActive).map(tour => {
                  const thumbnail = tour.images && tour.images.length > 0 ? tour.images[0] : null;
                  return (
                    <div key={`active-${tour.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-[#eaeaea] bg-gray-50/50">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#eaeaea] flex items-center justify-center overflow-hidden shrink-0">
                        {thumbnail ? (
                          <img src={thumbnail} alt={tour.name} className="w-full h-full object-cover" />
                        ) : (
                          <Map className="w-3.5 h-3.5 text-black" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-black truncate">{tour.name}</div>
                        <div className="text-[11px] text-gray-500 flex justify-between items-center mt-0.5">
                          <span className="truncate">{formatCurrency(tour.basePrice)}</span>
                          {tour.agent && <span className="text-orange-500 ml-2 shrink-0 border border-orange-100 bg-orange-50 px-1.5 py-0.5 rounded text-[9px]">{tour.agent.name}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* ── Modal Thêm Tour ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-md border border-[#eaeaea] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eaeaea]">
              <h2 className="text-[18px] font-medium tracking-tight text-black">Thêm Tour mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 overflow-y-auto space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-widest text-gray-500">Tên Tour</label>
                  <input 
                    required
                    type="text" 
                    name="name"
                    placeholder="VD: Tour Đà Nẵng 3N2Đ"
                    className="flex h-11 w-full rounded-xl border border-[#eaeaea] bg-white px-4 py-2 text-[14px] text-black placeholder:text-gray-300 focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-gray-500">Số ngày</label>
                    <input 
                      required
                      type="number" 
                      name="durationDays"
                      min="1"
                      defaultValue="3"
                      className="flex h-11 w-full rounded-xl border border-[#eaeaea] bg-white px-4 py-2 text-[14px] text-black placeholder:text-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-gray-500">Giá cơ bản (VNĐ)</label>
                    <input 
                      required
                      type="number" 
                      name="basePrice"
                      min="0"
                      defaultValue="1500000"
                      className="flex h-11 w-full rounded-xl border border-[#eaeaea] bg-white px-4 py-2 text-[14px] text-black placeholder:text-gray-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-widest text-gray-500">Điểm đến</label>
                  <input 
                    type="text" 
                    name="destinations"
                    placeholder="VD: Đà Nẵng, Hội An, Bà Nà"
                    className="flex h-11 w-full rounded-xl border border-[#eaeaea] bg-white px-4 py-2 text-[14px] text-black placeholder:text-gray-300 focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-widest text-gray-500">Trạng thái</label>
                  <select 
                    name="status"
                    className="flex h-11 w-full rounded-xl border border-[#eaeaea] bg-white px-4 py-2 text-[14px] text-black focus:border-black focus:outline-none transition-colors appearance-none"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tạm dừng</option>
                  </select>
                </div>
              </div>

              <div className="p-4 px-6 border-t border-[#eaeaea] bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 rounded-full px-5 text-[13px] font-medium text-black border border-[#eaeaea] bg-white hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex h-10 items-center justify-center rounded-full bg-black px-6 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Tạo Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
