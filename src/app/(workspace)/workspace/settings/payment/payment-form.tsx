"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Save, Plus, Trash2 } from "lucide-react";
import { updateSettings } from "@/actions/settings";
import { toast } from "sonner";

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  short_name: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export function PaymentSettingsClient({
  initialData,
}: {
  initialData: Record<string, string>;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  
  // Array state for multiple payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    if (initialData.payment_methods) {
      try { return JSON.parse(initialData.payment_methods); } catch {}
    }
    if (initialData.payment_account_number) {
      return [{
        id: "legacy",
        type: initialData.payment_type || "Cá nhân",
        bank_name: initialData.payment_bank_name || "",
        account_number: initialData.payment_account_number || "",
        account_name: initialData.payment_account_name || "",
      }];
    }
    return [];
  });

  // State for dropdowns mapping method ID to dropdown open state
  const [dropdownsOpen, setDropdownsOpen] = useState<Record<string, boolean>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setBanks(data.data);
        }
      })
      .catch((err) => console.error("Failed to load banks", err));
  }, []);

  const save = async () => {
    setIsSaving(true);
    try {
      // Validate
      for (const method of paymentMethods) {
        if (!method.bank_name || !method.account_name || !method.account_number) {
          toast.error("Vui lòng điền đầy đủ thông tin cho các tài khoản!");
          setIsSaving(false);
          return;
        }
      }

      const result = await updateSettings({
        payment_methods: JSON.stringify(paymentMethods),
      });

      if (result && result.success) {
        toast.success("Đã lưu Phương thức thanh toán");
        router.refresh();
      } else {
        toast.error("Lỗi khi lưu cài đặt");
      }
    } catch (error) {
      toast.error(`Lỗi: ${error instanceof Error ? error.message : "Không thể lưu cài đặt thanh toán"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addMethod = () => {
    setPaymentMethods([...paymentMethods, {
      id: Date.now().toString(),
      type: "Cá nhân",
      bank_name: "",
      account_number: "",
      account_name: ""
    }]);
  };

  const removeMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
  };

  const updateMethod = (id: string, field: keyof PaymentMethod, value: string) => {
    setPaymentMethods(paymentMethods.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
                Thanh toán
              </span>
            </div>
            <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
              <span className="text-black">Quản lý các tài khoản,</span>{" "}
              <span className="text-gray-400">phương thức thanh toán.</span>
            </h1>
            <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
              Cài đặt danh sách tài khoản ngân hàng để khách hàng dễ dàng chuyển khoản khi nhận báo giá, hợp đồng hoặc thanh toán dịch vụ.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="flex items-center justify-center rounded-full bg-white border border-[#eaeaea] px-5 py-2.5 text-[14px] font-medium text-black transition-all hover:bg-gray-50 whitespace-nowrap"
            >
              Quay lại
            </button>
            <button 
              type="button" 
              onClick={save} 
              disabled={isSaving} 
              className="flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white transition-all hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-12">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#eaeaea] pb-4 mb-2">
              <div>
                <h2 className="text-[16px] font-semibold text-black">Tài khoản Ngân hàng</h2>
                <p className="text-[13px] text-gray-500 mt-1">Bạn có thể thêm nhiều tài khoản để khách hàng dễ dàng thanh toán.</p>
              </div>
              <button 
                type="button" 
                onClick={addMethod}
                className="flex items-center gap-2 bg-white text-black hover:bg-gray-50 px-4 py-2 rounded-[6px] font-medium text-[13px] transition-colors border border-[#eaeaea]"
              >
                <Plus className="w-4 h-4" /> Thêm tài khoản
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-4">
              {paymentMethods.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[8px] border border-dashed border-[#eaeaea] text-gray-500 text-[14px]">
                  Chưa có tài khoản nào được thiết lập.
                </div>
              )}
              {paymentMethods.map((method, index) => {
                const selectedBank = banks.find(b => b.shortName === method.bank_name || b.name === method.bank_name);
                const term = searchTerms[method.id] || "";
                const filteredBanks = banks.filter(b => 
                  b.name.toLowerCase().includes(term.toLowerCase()) || 
                  b.shortName.toLowerCase().includes(term.toLowerCase()) ||
                  b.code.toLowerCase().includes(term.toLowerCase())
                );
                const isOpen = dropdownsOpen[method.id] || false;

                return (
                  <div key={method.id} className="bg-white border border-[#eaeaea] rounded-[8px] p-6 relative group transition-colors hover:border-gray-300">
                    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button" 
                        onClick={() => removeMethod(method.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#eaeaea]">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white font-medium text-[12px]">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-black text-[15px]">Tài khoản {index + 1}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      <div className="flex flex-col gap-1.5 relative">
                        <label className="text-[13px] font-medium text-gray-700">Ngân hàng</label>
                        
                        <div 
                          className="flex items-center justify-between cursor-pointer bg-white rounded-[6px] border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors h-[42px]"
                          onClick={() => setDropdownsOpen({...dropdownsOpen, [method.id]: !isOpen})}
                        >
                          {selectedBank ? (
                            <div className="flex items-center gap-3">
                              <img src={selectedBank.logo} alt={selectedBank.shortName} className="w-6 h-6 object-contain" />
                              <span className="text-[14px] font-medium text-black">{selectedBank.shortName} <span className="text-gray-500 text-[12px] ml-1">({selectedBank.code})</span></span>
                            </div>
                          ) : (
                            <span className="text-gray-400">{method.bank_name || "-- Chọn Ngân hàng --"}</span>
                          )}
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>

                        {isOpen && (
                          <div className="absolute top-[70px] z-50 w-full bg-white border border-[#eaeaea] rounded-[8px] shadow-lg flex flex-col">
                            <div className="p-2 border-b border-[#eaeaea]">
                              <input 
                                type="text" 
                                autoFocus
                                placeholder="Tìm kiếm ngân hàng..." 
                                className="w-full rounded-[4px] border border-transparent px-3 py-2 text-[13px] focus:border-[#eaeaea] focus:bg-gray-50 focus:outline-none transition-colors"
                                value={term}
                                onChange={(e) => setSearchTerms({...searchTerms, [method.id]: e.target.value})}
                              />
                            </div>
                            <div className="overflow-y-auto p-1 max-h-60">
                              {filteredBanks.map(bank => (
                                <div 
                                  key={bank.id} 
                                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                                  onClick={() => {
                                    updateMethod(method.id, "bank_name", bank.shortName);
                                    setDropdownsOpen({...dropdownsOpen, [method.id]: false});
                                    setSearchTerms({...searchTerms, [method.id]: ""});
                                  }}
                                >
                                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-md border border-[#eaeaea] p-1">
                                     <img src={bank.logo} alt={bank.shortName} className="max-w-full max-h-full object-contain" />
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-[13px] font-medium text-black truncate">{bank.shortName} <span className="text-gray-500 text-[11px]">({bank.code})</span></span>
                                    <span className="text-[12px] text-gray-500 truncate mt-0.5">{bank.name}</span>
                                  </div>
                                </div>
                              ))}
                              {filteredBanks.length === 0 && (
                                <div className="p-4 text-center text-[13px] text-gray-500">Không tìm thấy ngân hàng</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700">Số Tài khoản</label>
                        <input 
                          type="text" 
                          className="w-full rounded-[6px] border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors h-[42px]"
                          value={method.account_number}
                          onChange={(e) => updateMethod(method.id, "account_number", e.target.value)}
                          placeholder="Ví dụ: 1903939393939"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700">Tên Chủ tài khoản</label>
                        <input 
                          type="text" 
                          className="w-full rounded-[6px] border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors uppercase h-[42px]"
                          value={method.account_name}
                          onChange={(e) => updateMethod(method.id, "account_name", e.target.value.toUpperCase())}
                          placeholder="VÍ DỤ: CTY TNHH ONG VANG"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700">Loại kênh</label>
                        <div className="flex gap-6 h-[42px] items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`type-${method.id}`}
                              checked={method.type === "Cá nhân"} 
                              onChange={() => updateMethod(method.id, "type", "Cá nhân")}
                              className="text-black focus:ring-black w-4 h-4 accent-black" 
                            />
                            <span className="text-[14px] text-black">Cá nhân</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`type-${method.id}`}
                              checked={method.type === "Công ty"} 
                              onChange={() => updateMethod(method.id, "type", "Công ty")}
                              className="text-black focus:ring-black w-4 h-4 accent-black" 
                            />
                            <span className="text-[14px] text-black">Công ty</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
