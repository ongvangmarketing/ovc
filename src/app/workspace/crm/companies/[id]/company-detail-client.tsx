"use client";

import { useState } from "react";
import { 
  UserCircle2, Users, FileText, BarChart2, Receipt, CreditCard,
  Briefcase, FileDigit, Calendar, RefreshCcw, DollarSign, FolderKanban,
  CheckCircle2, Tag, FileBox, Lock, Bell, MapPin, ChevronDown, Plus
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export function CompanyDetailClient({ company }: { company: any }) {
  const [activeMenu, setActiveMenu] = useState("profile");
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: company.name || "",
    phone: company.phone || "",
    website: company.website || "",
    address: company.address || "",
    city: company.city || "",
    state: company.state || "",
    zip: company.zip || "",
    country: company.country || "Vietnam",
    showFullName: false,
    group: "",
    currency: "system",
    language: "system",
  });

  const menus = [
    { id: "profile", label: "Tiểu sử", icon: UserCircle2, count: 0 },
    { id: "contacts", label: "Liên hệ", icon: Users, count: company.contacts?.length || 0 },
    { id: "notes", label: "Ghi chú", icon: FileText, count: 0 },
    { id: "reports", label: "Báo cáo", icon: BarChart2, count: 0 },
    { id: "invoices", label: "Hóa đơn", icon: Receipt, count: 1 },
    { id: "payments", label: "Thanh toán", icon: CreditCard, count: 0 },
    { id: "proposals", label: "Đề xuất kế hoạch", icon: Briefcase, count: 0 },
    { id: "credit_notes", label: "Ghi chú tín dụng", icon: FileDigit, count: 0 },
    { id: "estimates", label: "Báo giá", icon: Calendar, count: 0 },
    { id: "subscriptions", label: "Thuê bao", icon: RefreshCcw, count: 0 },
    { id: "expenses", label: "Chi phí", icon: DollarSign, count: 0 },
    { id: "contracts", label: "Hợp đồng", icon: FileText, count: 0 },
    { id: "projects", label: "Các dự án", icon: FolderKanban, count: 0 },
    { id: "tasks", label: "Phân công", icon: CheckCircle2, count: 0 },
    { id: "tickets", label: "Yêu cầu", icon: Tag, count: 0 },
    { id: "files", label: "Các tập tin", icon: FileBox, count: 0 },
    { id: "vault", label: "Vault", icon: Lock, count: 0 },
    { id: "reminders", label: "Nhắc nhở", icon: Bell, count: 0 },
    { id: "map", label: "Bản đồ", icon: MapPin, count: 0 },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API save
    await new Promise(r => setTimeout(r, 600));
    toast.success("Đã cập nhật thông tin khách hàng");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50/50 overflow-hidden page-container px-0 pb-0">
      
      {/* Title */}
      <div className="flex items-center gap-2 px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <h2 className="text-xl font-bold text-gray-800">#{company.id?.substring(0,3) || 148} {company.name}</h2>
        <ChevronDown className="w-4 h-4 text-gray-500 cursor-pointer" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Tiểu sử</h3>
          </div>
          <ul className="py-2">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const isActive = activeMenu === menu.id;
              return (
                <li key={menu.id}>
                  <button
                    onClick={() => setActiveMenu(menu.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                      isActive ? "bg-blue-50/50 text-blue-600 font-medium border-l-2 border-blue-600" : "text-gray-600 hover:bg-gray-50 border-l-2 border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-gray-400")} />
                      {menu.label}
                    </div>
                    {menu.count > 0 && (
                      <span className="text-xs font-medium text-gray-500">{menu.count}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-gray-50/50 overflow-y-auto p-6 custom-scrollbar">
          {activeMenu === "profile" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-5xl mx-auto">
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {[
                  { id: "info", label: "Thông tin khách hàng" },
                  { id: "custom", label: "Các mục tự tạo" },
                  { id: "billing", label: "Thanh toán & Nhận hàng" },
                  { id: "admins", label: "Quản trị khách hàng" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                      activeTab === tab.id ? "border-blue-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              {activeTab === "info" && (
                <form onSubmit={handleSave} className="p-6">
                  <label className="flex items-center gap-2 cursor-pointer mb-6">
                    <input 
                      type="checkbox" 
                      checked={formData.showFullName}
                      onChange={e => setFormData({...formData, showFullName: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300" 
                    />
                    <span className="text-sm text-gray-700 font-medium">Hiển thị đầy đủ tên liên hệ cơ bản trên Hóa đơn, Báo giá, Thanh toán, Ghi chú tín dụng</span>
                  </label>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên doanh nghiệp</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input 
                        type="text" 
                        value={formData.website}
                        onChange={e => setFormData({...formData, website: e.target.value})}
                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select 
                            value={formData.group}
                            onChange={e => setFormData({...formData, group: e.target.value})}
                            className="w-full h-10 pl-3 pr-10 rounded border border-gray-300 appearance-none outline-none focus:ring-1 focus:ring-blue-500 text-gray-500 bg-white"
                          >
                            <option value="">Không có mục nào được chọn</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button type="button" className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-400 text-[9px] flex items-center justify-center font-bold text-gray-500">?</span> Đơn vị tiền
                        </label>
                        <div className="relative">
                          <select 
                            value={formData.currency}
                            onChange={e => setFormData({...formData, currency: e.target.value})}
                            className="w-full h-10 pl-3 pr-10 rounded border border-gray-300 appearance-none outline-none focus:ring-1 focus:ring-blue-500 text-gray-500 bg-gray-50"
                          >
                            <option value="system">Mặc định hệ thống</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ mặc định</label>
                        <div className="relative">
                          <select 
                            value={formData.language}
                            onChange={e => setFormData({...formData, language: e.target.value})}
                            className="w-full h-10 pl-3 pr-10 rounded border border-gray-300 appearance-none outline-none focus:ring-1 focus:ring-blue-500 text-gray-500 bg-gray-50"
                          >
                            <option value="system">Mặc định hệ thống</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-8" />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <textarea 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full p-3 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 min-h-[100px] resize-y" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                      <input 
                        type="text" 
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu bang</label>
                      <input 
                        type="text" 
                        value={formData.state}
                        onChange={e => setFormData({...formData, state: e.target.value})}
                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã bưu chính</label>
                      <input 
                        type="text" 
                        value={formData.zip}
                        onChange={e => setFormData({...formData, zip: e.target.value})}
                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                      <div className="relative">
                        <select 
                          value={formData.country}
                          onChange={e => setFormData({...formData, country: e.target.value})}
                          className="w-full h-10 pl-3 pr-10 rounded border border-gray-300 appearance-none outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
                        >
                          <option value="Vietnam">Vietnam</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end mt-8 pt-4 border-t border-gray-200 bg-gray-50/50 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="px-6 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Đang lưu..." : "Lưu lại"}
                    </button>
                  </div>
                </form>
              )}

              {/* Other Tabs Placeholder */}
              {activeTab !== "info" && (
                <div className="p-20 text-center text-gray-500">
                  Nội dung tab {activeTab} sẽ hiển thị ở đây
                </div>
              )}
            </div>
          )}

          {activeMenu !== "profile" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-20 text-center text-gray-500 max-w-5xl mx-auto">
              Chức năng {menus.find(m => m.id === activeMenu)?.label} đang được phát triển
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
