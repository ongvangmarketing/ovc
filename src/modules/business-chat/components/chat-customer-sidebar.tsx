"use client";

import { useState } from "react";
import { UserPlus, Briefcase, X, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { convertZaloToDealAction, convertZaloToStudentAction } from "../actions/chat.actions";
import { useRouter } from "next/navigation";

interface ChatCustomerSidebarProps {
  conversationId: string;
  entityType: string | null;
  entityId: string | null;
  headerName: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ChatCustomerSidebar({ conversationId, entityType, entityId, headerName, isOpen, onClose }: ChatCustomerSidebarProps) {
  const router = useRouter();
  const [isConverting, setIsConverting] = useState(false);
  const [modalOpen, setModalOpen] = useState<"DEAL" | "STUDENT" | null>(null);
  
  // Deal form
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("");

  // Handle convert
  const handleConvertDeal = async () => {
    if (!dealTitle.trim()) {
      toast.error("Vui lòng nhập tên cơ hội (Deal)");
      return;
    }
    
    setIsConverting(true);
    try {
      const res = await convertZaloToDealAction(conversationId, {
        title: dealTitle,
        value: Number(dealValue) || 0
      });
      if (res.success) {
        toast.success("Chuyển đổi sang Deal thành công!");
        setModalOpen(null);
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi chuyển đổi");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi chuyển đổi");
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertStudent = async () => {
    setIsConverting(true);
    try {
      const res = await convertZaloToStudentAction(conversationId, {
        courseId: "mock_course_id" 
      });
      if (res.success) {
        toast.success("Thêm vào danh sách Học viên thành công!");
        setModalOpen(null);
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi hệ thống hoặc CourseID bị trống");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi chuyển đổi");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/20 lg:hidden" onClick={onClose} />
      )}
      <div className={`fixed inset-y-0 right-0 z-[110] lg:static lg:flex w-[300px] border-l border-[#eaeaea] bg-white flex-col h-full shrink-0 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 hidden"}`}>
        <div className="h-16 px-4 border-b border-[#eaeaea] flex items-center justify-between shrink-0">
          <h3 className="font-medium text-black tracking-tight">Thông tin Khách hàng</h3>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-black rounded-md hover:bg-gray-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="p-6 flex flex-col items-center border-b border-[#eaeaea]">
          <div className="w-16 h-16 bg-gray-100 border border-[#eaeaea] rounded-full flex items-center justify-center text-black font-medium text-xl mb-4">
            {headerName.charAt(0).toUpperCase()}
          </div>
          <h4 className="font-semibold text-[15px] tracking-tight text-black">{headerName}</h4>
          <p className="text-[11px] uppercase tracking-widest text-gray-400 mt-1">Liên hệ Zalo</p>
        </div>

        <div className="p-6">
          <h5 className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-4">Trạng thái chuyển đổi</h5>
          
          {entityType === "Deal" ? (
            <div className="bg-orange-50/50 border border-orange-100 rounded-md p-4 flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-orange-900 tracking-tight">Đã là Deal (Cơ hội)</p>
                <p className="text-[12px] text-orange-700/80 mt-1 leading-relaxed">Hội thoại này đã được gắn với một Cơ hội bán hàng.</p>
              </div>
            </div>
          ) : entityType === "Student" ? (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-md p-4 flex items-start gap-3">
              <UserPlus className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-emerald-900 tracking-tight">Đã là Học viên</p>
                <p className="text-[12px] text-emerald-700/80 mt-1 leading-relaxed">Khách hàng này đang tham gia các khoá học của hệ thống.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">Khách hàng này chưa được chuyển đổi vào hệ thống CRM.</p>
              <button 
                onClick={() => { setDealTitle(`Deal: ${headerName}`); setModalOpen("DEAL"); }}
                className="w-full flex items-center justify-between p-3.5 border border-[#eaeaea] bg-white rounded-md hover:border-black transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                  <span className="text-[13px] font-medium text-black">Tạo mới Deal</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </button>
              
              <button 
                onClick={() => setModalOpen("STUDENT")}
                className="w-full flex items-center justify-between p-3.5 border border-[#eaeaea] bg-white rounded-md hover:border-black transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                  <span className="text-[13px] font-medium text-black">Tạo Học viên</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#eaeaea] rounded-xl shadow-none w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalOpen(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {modalOpen === "DEAL" ? (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full border border-orange-200 bg-orange-50 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-medium tracking-tight text-black leading-none">Tạo Deal mới</h3>
                    <p className="text-[13px] text-gray-500 mt-1">Chuyển Zalo thành Cơ hội bán hàng</p>
                  </div>
                </div>

                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">Tên Deal / Nhu cầu</label>
                    <input 
                      type="text" 
                      value={dealTitle}
                      onChange={(e) => setDealTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#eaeaea] bg-white rounded-md text-[14px] text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="VD: Mua dịch vụ Marketing"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">Giá trị dự kiến (VNĐ)</label>
                    <input 
                      type="number" 
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#eaeaea] bg-white rounded-md text-[14px] text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="VD: 5000000"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#eaeaea]">
                  <button 
                    onClick={() => setModalOpen(null)}
                    className="px-6 py-2.5 text-[14px] font-medium text-black border border-[#eaeaea] bg-white hover:bg-gray-50 rounded-full transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleConvertDeal}
                    disabled={isConverting}
                    className="px-6 py-2.5 text-[14px] font-medium text-white bg-black hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isConverting ? "Đang tạo..." : "Xác nhận tạo Deal"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-medium tracking-tight text-black leading-none">Chuyển thành Học viên</h3>
                    <p className="text-[13px] text-gray-500 mt-1">Tạo tài khoản học viên và ghi danh</p>
                  </div>
                </div>

                <div className="bg-gray-50/50 border border-[#eaeaea] rounded-md p-5 mb-8">
                  <p className="text-[12px] font-medium text-black mb-3">Hệ thống sẽ tự động:</p>
                  <ul className="space-y-2 text-[13px] text-gray-600">
                    <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Tạo User Account mới</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Liên kết Zalo Account</li>
                    <li className="flex items-center gap-2.5 text-gray-400"><X className="w-4 h-4" /> Bỏ qua chọn khoá học (Sẽ tự tạo dữ liệu Pending)</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#eaeaea]">
                  <button 
                    onClick={() => setModalOpen(null)}
                    className="px-6 py-2.5 text-[14px] font-medium text-black border border-[#eaeaea] bg-white hover:bg-gray-50 rounded-full transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleConvertStudent}
                    disabled={isConverting}
                    className="px-6 py-2.5 text-[14px] font-medium text-white bg-black hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isConverting ? "Đang xử lý..." : "Xác nhận & Tạo"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
